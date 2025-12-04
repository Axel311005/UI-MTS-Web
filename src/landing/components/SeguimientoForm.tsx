import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Search,
  Clock,
  CheckCircle,
  Package,
  Car,
  User,
  Calendar,
  MapPin,
  TrendingUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSeguimientoByCodigo } from '../actions/seguimiento.actions';
import type { SeguimientoRecepcion } from '../types/seguimiento.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL_CLIENTE } from '@/shared/config/socket.config';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import { validateCode } from '@/shared/utils/smart-validation';

const estadoConfig: Record<
  string,
  { color: string; bg: string; icon: typeof CheckCircle }
> = {
  PENDIENTE: {
    color: 'text-orange-700',
    bg: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
    icon: Clock,
  },
  'EN PROCESO': {
    color: 'text-orange-700',
    bg: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300',
    icon: TrendingUp,
  },
  FINALIZADO: {
    color: 'text-green-700',
    bg: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300',
    icon: Package,
  },
  ENTREGADO: {
    color: 'text-purple-700',
    bg: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300',
    icon: CheckCircle,
  },
};

interface ClienteNotification {
  tipo: 'recepcion_seguimiento_actualizado' | 'nueva_cita' | 'nueva_cotizacion';
  id_registro: number | string;
  nombre_cliente?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export function SeguimientoForm() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [seguimiento, setSeguimiento] = useState<SeguimientoRecepcion | null>(
    null
  );
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isSearchingRef = useRef(false);
  const { token: landingToken } = useLandingAuthStore();
  const authToken = useAuthStore((s) => s.token);
  const token = landingToken || authToken;

  // Conectar WebSocket cuando hay un seguimiento cargado
  useEffect(() => {
    if (!seguimiento?.codigoRecepcion) {
      // Si no hay seguimiento, desconectar socket si existe
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.removeAllListeners();
        socketRef.current = null;
        setSocketConnected(false);
        setSocketId(null);
      }
      return;
    }

    // Construir URL con codigoRecepcion como query parameter
    const codigoRecepcion = seguimiento.codigoRecepcion;
    const urlWithQuery = `${SOCKET_URL_CLIENTE}?codigoRecepcion=${encodeURIComponent(
      codigoRecepcion
    )}`;

    // Obtener token
    const authToken = token || localStorage.getItem('token');

    // Crear conexión WebSocket para seguimiento público (namespace /cliente)
    const socket = io(urlWithQuery, {
      auth: authToken ? { token: authToken } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setSocketConnected(true);
      setSocketId(socket.id ?? null);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setSocketId(null);
    };

    const onConnectError = () => {
      setSocketConnected(false);
    };

    // Escuchar notificaciones para clientes (namespace /cliente)
    const onClienteNotification = (payload: ClienteNotification) => {
      // Solo procesar si es una actualización de seguimiento
      if (payload.tipo === 'recepcion_seguimiento_actualizado') {
        // Verificar que el código coincida - puede venir en diferentes lugares
        const payloadCodigo =
          (payload.data &&
          typeof payload.data === 'object' &&
          'codigoRecepcion' in payload.data
            ? (payload.data.codigoRecepcion as string)
            : null) ||
          (payload.data &&
          typeof payload.data === 'object' &&
          'recepcion' in payload.data &&
          payload.data.recepcion &&
          typeof payload.data.recepcion === 'object' &&
          'codigoRecepcion' in payload.data.recepcion
            ? (payload.data.recepcion.codigoRecepcion as string)
            : null) ||
          null;

        const payloadIdRecepcion =
          payload.id_registro ||
          (payload.data &&
          typeof payload.data === 'object' &&
          'idRecepcion' in payload.data
            ? (payload.data.idRecepcion as number)
            : null) ||
          (payload.data &&
          typeof payload.data === 'object' &&
          'recepcion' in payload.data &&
          payload.data.recepcion &&
          typeof payload.data.recepcion === 'object' &&
          'idRecepcion' in payload.data.recepcion
            ? (payload.data.recepcion.idRecepcion as number)
            : null);

        // Verificar coincidencia por código o por ID de recepción
        const codigoCoincide =
          payloadCodigo && payloadCodigo === seguimiento.codigoRecepcion;
        const idCoincide =
          payloadIdRecepcion &&
          (payloadIdRecepcion === seguimiento.recepcionId ||
            String(payloadIdRecepcion) === String(seguimiento.recepcionId));

        if (codigoCoincide || idCoincide) {
          // Recargar el seguimiento desde el servidor sin mostrar notificación
          getSeguimientoByCodigo(seguimiento.codigoRecepcion)
            .then((data) => {
              setSeguimiento(data);
              // El estado se actualiza automáticamente en el componente
            })
            .catch(() => {
              // Error silencioso al recargar seguimiento
            });
        }
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('clienteNotification', onClienteNotification);

    // Cleanup al desmontar o cambiar código
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('clienteNotification', onClienteNotification);
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      setSocketId(null);
    };
  }, [seguimiento?.codigoRecepcion, token]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir múltiples requests simultáneos
    if (isSearchingRef.current || loading) {
      return;
    }

    // Sanitizar y validar código con validaciones inteligentes
    const codigoLimpio = codigo.trim().toUpperCase();

    if (!codigoLimpio) {
      toast.error('Ingresa un código de recepción');
      return;
    }

    // Validar con validaciones inteligentes
    const codigoValidation = validateCode(codigoLimpio);
    if (!codigoValidation.isValid) {
      toast.error(codigoValidation.error || 'El código no es válido');
      return;
    }

    // Si ya hay un seguimiento con el mismo código, no buscar de nuevo
    if (seguimiento?.codigoRecepcion === codigoLimpio) {
      return;
    }

    isSearchingRef.current = true;
    setLoading(true);
    try {
      const data = await getSeguimientoByCodigo(codigoLimpio);
      setSeguimiento(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Código no encontrado';
      toast.error(message);
      setSeguimiento(null);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 bg-gradient-to-b from-white via-white to-orange-50/10 py-8 px-6 sm:px-8 md:px-10 lg:px-12 rounded-3xl">
      <div>
        <Card className="bg-white border-2 border-orange-500/20 shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="text-center pb-6 pt-8 md:pt-10 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-white via-orange-50/5 to-white">
            <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black font-montserrat mb-3 md:mb-4 tracking-tight">
              Seguimiento de Reparación
            </CardTitle>
            <div className="w-20 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 mx-auto mb-3 md:mb-4 rounded-full"></div>
            <p className="text-black/70 text-base sm:text-lg font-montserrat max-w-2xl mx-auto leading-relaxed">
              Ingresa tu código de recepción para ver el estado de tu reparación
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
            <form onSubmit={handleSearch} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-black font-bold text-sm sm:text-base md:text-lg flex items-center gap-2 font-montserrat tracking-wide">
                  Código de Recepción
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Ej: REC-20250115-AB12CD"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="text-base sm:text-lg py-4 sm:py-6 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat transition-all touch-manipulation"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-montserrat font-semibold text-sm sm:text-base touch-manipulation min-h-[48px]"
                  >
                    {loading ? (
                      <div className="animate-spin">
                        <Search className="h-5 w-5" />
                      </div>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {seguimiento && (
          <div className="space-y-6">
            {/* Indicador de conexión WebSocket */}
            {socketConnected ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Actualización en tiempo real activa
                </span>
                {socketId && (
                  <span className="text-xs text-green-600">
                    ({socketId.slice(0, 8)}...)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <WifiOff className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Conectando a actualizaciones en tiempo real...
                </span>
              </div>
            )}

            {/* Código de recepción */}
            <div>
              <Card className="bg-gradient-to-br from-white to-white border-2 border-orange-500/20 shadow-xl overflow-hidden">
                <div className="p-4 sm:p-6 bg-orange-500/10 border-b-4 border-orange-500">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-medium opacity-80 mb-2">
                        Código de Recepción
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-black font-montserrat tracking-wider break-all">
                        {seguimiento.codigoRecepcion}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Información de la recepción */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-orange-500/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-black flex items-center gap-2 font-montserrat">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                    Información de la Recepción
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-500/20 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="p-2 sm:p-3 bg-orange-500 rounded-lg flex-shrink-0">
                        <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-orange-600 font-semibold font-montserrat text-xs sm:text-sm md:text-base block mb-1 sm:mb-2">
                          Vehículo
                        </Label>
                        <p className="font-bold text-black text-sm sm:text-base md:text-lg font-montserrat leading-relaxed break-words">
                          {seguimiento.vehiculo.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-500/20 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="p-2 sm:p-3 bg-orange-500 rounded-lg flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-orange-600 font-semibold font-montserrat text-xs sm:text-sm md:text-base block mb-1 sm:mb-2">
                          Cliente
                        </Label>
                        <p className="font-bold text-black text-sm sm:text-base md:text-lg font-montserrat leading-relaxed break-words">
                          {seguimiento.cliente.nombre}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-500/20 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <div className="p-2 sm:p-3 bg-orange-500 rounded-lg flex-shrink-0">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base font-montserrat block mb-1 sm:mb-2">
                          Fecha de Recepción
                        </Label>
                        <p className="font-bold text-black text-sm sm:text-base md:text-lg font-montserrat leading-relaxed break-words">
                          {format(
                            new Date(seguimiento.fechaRecepcion),
                            "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                            { locale: es }
                          )}
                        </p>
                      </div>
                    </div>

                    {seguimiento.fechaEntregaEstimada && (
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 lg:p-7 bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-500/20 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="p-2 sm:p-3 bg-orange-500 rounded-lg flex-shrink-0">
                          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label className="text-orange-600 font-semibold text-xs sm:text-sm md:text-base font-montserrat block mb-1 sm:mb-2">
                            Fecha Estimada de Entrega
                          </Label>
                          <p className="font-bold text-black text-sm sm:text-base md:text-lg font-montserrat leading-relaxed break-words">
                            {format(
                              new Date(seguimiento.fechaEntregaEstimada),
                              "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Línea de tiempo mejorada */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-orange-500/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-black flex items-center gap-2 font-montserrat">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    Línea de Tiempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Línea vertical decorativa */}
                    <div className="absolute left-6 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 via-orange-400 to-orange-500 rounded-full"></div>

                    <div className="space-y-6">
                      {seguimiento.seguimientos.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-black/70 font-montserrat text-sm sm:text-base">
                            No hay seguimientos registrados para esta recepción.
                          </p>
                        </div>
                      ) : (
                        seguimiento.seguimientos.map((seg, index) => {
                          const config =
                            estadoConfig[seg.estado] || estadoConfig.PENDIENTE;
                          const Icon = config.icon;
                          const isLast =
                            index === seguimiento.seguimientos.length - 1;

                          return (
                            <div
                              key={seg.id}
                              className="flex gap-4 md:gap-6 relative"
                            >
                              <div className="flex flex-col items-center relative z-10">
                                <div
                                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${config.bg}`}
                                >
                                  <Icon
                                    className={`h-6 w-6 md:h-7 md:w-7 ${config.color}`}
                                  />
                                </div>
                                {!isLast && (
                                  <div className="w-1.5 h-full bg-gradient-to-b from-orange-500/40 via-orange-400/30 to-orange-500/20 my-2 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4 sm:pb-6 bg-gradient-to-br from-white to-orange-50/20 p-4 sm:p-5 md:p-6 rounded-xl border-2 border-orange-500/20 shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <span
                                    className={`font-bold text-sm sm:text-base md:text-lg ${config.color} break-words`}
                                  >
                                    {seg.estado}
                                  </span>
                                  <span className="text-xs sm:text-sm md:text-base text-black/70 bg-orange-500/10 px-2 sm:px-3 py-1 rounded-full font-montserrat w-fit">
                                    {format(
                                      new Date(seg.fecha),
                                      "d MMM yyyy 'a las' HH:mm",
                                      { locale: es }
                                    )}
                                  </span>
                                </div>
                                <p className="text-black/80 leading-relaxed font-montserrat text-xs sm:text-sm md:text-base break-words">
                                  {seg.descripcion}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
