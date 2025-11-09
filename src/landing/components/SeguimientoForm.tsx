import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Search, Clock, CheckCircle, Package, Car, User, Calendar, MapPin, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { getSeguimientoByCodigo } from '../actions/seguimiento.actions';
import type { SeguimientoRecepcion } from '../types/seguimiento.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL_CLIENTE } from '@/shared/config/socket.config';
import { useLandingAuthStore } from '../store/landing-auth.store';

const estadoConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
  PENDIENTE: {
    color: 'text-yellow-700',
    bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300',
    icon: Clock,
  },
  'EN PROCESO': {
    color: 'text-blue-700',
    bg: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300',
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
  const { token } = useLandingAuthStore();

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
    const urlWithQuery = `${SOCKET_URL_CLIENTE}?codigoRecepcion=${encodeURIComponent(codigoRecepcion)}`;

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
      console.info('[socket] connected', socket.id);
      setSocketConnected(true);
      setSocketId(socket.id ?? null);
    };

    const onDisconnect = (reason: any) => {
      console.warn('[socket] disconnected', reason);
      setSocketConnected(false);
      setSocketId(null);
    };

    const onConnectError = (err: any) => {
      const msg = err?.message ?? String(err);
      console.error('[socket] connect_error', msg);
      setSocketConnected(false);
    };

    // Escuchar notificaciones para clientes (namespace /cliente)
    const onClienteNotification = (payload: ClienteNotification) => {
      console.info('[socket] clienteNotification', payload);
      console.info('[socket] Seguimiento actual:', seguimiento);
      
      // Solo procesar si es una actualización de seguimiento
      if (payload.tipo === 'recepcion_seguimiento_actualizado') {
        // Verificar que el código coincida - puede venir en diferentes lugares
        const payloadCodigo = 
          payload.data?.codigoRecepcion as string ||
          payload.data?.recepcion?.codigoRecepcion as string ||
          (payload.data?.recepcion as any)?.codigoRecepcion as string;
        
        const payloadIdRecepcion = 
          payload.id_registro ||
          payload.data?.idRecepcion ||
          payload.data?.recepcion?.idRecepcion;
        
        console.info('[socket] Verificando coincidencia:', {
          payloadCodigo,
          seguimientoCodigo: seguimiento.codigoRecepcion,
          payloadIdRecepcion,
          seguimientoIdRecepcion: seguimiento.recepcionId,
        });
        
        // Verificar coincidencia por código o por ID de recepción
        const codigoCoincide = payloadCodigo && payloadCodigo === seguimiento.codigoRecepcion;
        const idCoincide = payloadIdRecepcion && 
          (payloadIdRecepcion === seguimiento.recepcionId || 
           String(payloadIdRecepcion) === String(seguimiento.recepcionId));
        
        if (codigoCoincide || idCoincide) {
          console.info('[socket] Coincidencia encontrada, recargando seguimiento...');
          // Recargar el seguimiento desde el servidor sin mostrar notificación
          getSeguimientoByCodigo(seguimiento.codigoRecepcion)
            .then((data) => {
              console.info('[socket] Seguimiento recargado:', data);
              setSeguimiento(data);
              // El estado se actualiza automáticamente en el componente
            })
            .catch((error) => {
              console.error('[socket] Error al recargar seguimiento:', error);
            });
        } else {
          console.warn('[socket] Notificación recibida pero no coincide con el seguimiento actual');
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
    if (!codigo.trim()) {
      toast.error('Ingresa un código de recepción');
      return;
    }

    setLoading(true);
    try {
      const data = await getSeguimientoByCodigo(codigo.trim());
      setSeguimiento(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Código no encontrado';
      toast.error(message);
      setSeguimiento(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="p-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow-lg">
                <Search className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Seguimiento de Reparación
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Ingresa tu código de recepción para ver el estado de tu reparación
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-lg">
                  Código de Recepción
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Ej: REC-20250115-AB12CD"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    className="text-lg py-6 border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 rounded-xl"
                    disabled={loading}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Search className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {seguimiento && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Indicador de conexión WebSocket */}
            {socketConnected ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl"
              >
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Actualización en tiempo real activa
                </span>
                {socketId && (
                  <span className="text-xs text-green-600">({socketId.slice(0, 8)}...)</span>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <WifiOff className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Conectando a actualizaciones en tiempo real...
                </span>
              </motion.div>
            )}

            {/* Código de recepción */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-xl overflow-hidden">
                <div className="p-6 bg-gradient-to-br from-orange-100 to-pink-100 border-b-4 border-orange-300">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-medium opacity-80 mb-2">Código de Recepción</p>
                      <p className="text-3xl font-bold font-mono text-slate-900">{seguimiento.codigoRecepcion}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Información de la recepción */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-orange-500" />
                    Información de la Recepción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl"
                    >
                      <Car className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <Label className="text-blue-600 font-semibold">Vehículo</Label>
                        <p className="font-bold text-slate-900 text-lg">
                          {seguimiento.vehiculo.descripcion}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl"
                    >
                      <User className="h-6 w-6 text-pink-600 mt-1 flex-shrink-0" />
                      <div>
                        <Label className="text-pink-600 font-semibold">Cliente</Label>
                        <p className="font-bold text-slate-900 text-lg">
                          {seguimiento.cliente.nombre}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl"
                    >
                      <Calendar className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <Label className="text-orange-600 font-semibold">Fecha de Recepción</Label>
                        <p className="font-bold text-slate-900 text-lg">
                          {format(new Date(seguimiento.fechaRecepcion), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      </div>
                    </motion.div>

                    {seguimiento.fechaEntregaEstimada && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl"
                      >
                        <Calendar className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <Label className="text-green-600 font-semibold">Fecha Estimada de Entrega</Label>
                          <p className="font-bold text-slate-900 text-lg">
                            {format(
                              new Date(seguimiento.fechaEntregaEstimada),
                              "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Línea de tiempo mejorada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                    Línea de Tiempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Línea vertical decorativa */}
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-200 via-pink-200 to-orange-200 rounded-full"></div>

                    <div className="space-y-8">
                      {seguimiento.seguimientos.map((seg, index) => {
                        const config = estadoConfig[seg.estado] || estadoConfig.PENDIENTE;
                        const Icon = config.icon;
                        const isLast = index === seguimiento.seguimientos.length - 1;

                        return (
                          <motion.div
                            key={seg.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex gap-6 relative"
                          >
                            <div className="flex flex-col items-center relative z-10">
                              <motion.div
                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white ${config.bg}`}
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Icon className={`h-7 w-7 ${config.color}`} />
                              </motion.div>
                              {!isLast && (
                                <div className="w-1 h-full bg-gradient-to-b from-slate-300 to-slate-200 my-2"></div>
                              )}
                            </div>
                            <motion.div
                              className="flex-1 pb-8 bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                              whileHover={{ x: 5 }}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`font-bold text-lg ${config.color}`}>
                                  {seg.estado}
                                </span>
                                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                  {format(new Date(seg.fecha), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{seg.descripcion}</p>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
