import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Calendar, FileText, Car, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { getMotivosCita, createCita } from '../actions/cita.actions';
import {
  getVehiculosByCliente,
  createVehiculo,
} from '../actions/vehiculo.actions';
import type { MotivoCita, Vehiculo } from '../types/cita.types';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import { useNavigate } from 'react-router';

interface FormData {
  idMotivoCita: string;
  idVehiculo: string;
  fechaInicio: string;
  horaInicio: string;
}

interface VehiculoFormData {
  placa: string;
  motor: string;
  marca: string;
  modelo: string;
  color: string;
  anio: string;
  numChasis: string;
}

export function CitaForm() {
  const navigate = useNavigate();
  const { user: landingUser, isAuthenticated: landingIsAuthenticated, token: landingToken } = useLandingAuthStore();
  const authUser = useAuthStore((s) => s.user);
  const authToken = useAuthStore((s) => s.token);
  const [localUser, setLocalUser] = useState<{ id: number; email: string; clienteId?: number; nombre?: string } | null>(null);
  const [localToken, setLocalToken] = useState<string | null>(null);
  
  // Verificar localStorage directamente como fallback inmediato
  useEffect(() => {
    if (!landingUser && !authUser?.cliente) {
      try {
        const storedUserStr = localStorage.getItem('landing-user');
        const storedToken = localStorage.getItem('token');
        if (storedUserStr && storedToken) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser?.clienteId) {
            setLocalUser(storedUser);
            setLocalToken(storedToken);
          }
        }
      } catch (error) {
        // Ignorar errores de parsing
      }
    } else {
      setLocalUser(null);
      setLocalToken(null);
    }
  }, [landingUser, authUser]);
  
  // Obtener usuario desde landingUser, localUser o desde authUser como fallback
  const user = landingUser || localUser || (authUser?.cliente ? {
    id: Number(authUser.id) || 0,
    email: authUser.email || '',
    clienteId: authUser.cliente.id || authUser.cliente.idCliente || 0,
    nombre: authUser.cliente.nombreCompleto ||
      (authUser.cliente.primerNombre 
        ? `${authUser.cliente.primerNombre} ${authUser.cliente.primerApellido || ''}`.trim()
        : null) ||
      authUser.cliente.ruc || 'Cliente',
  } : null);
  
  const token = landingToken || localToken || authToken;
  const isAuthenticated = landingIsAuthenticated || !!localUser || (!!authUser?.cliente && !!authToken);
  
  const [motivos, setMotivos] = useState<MotivoCita[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    idMotivoCita: '',
    idVehiculo: '',
    fechaInicio: '',
    horaInicio: '',
  });
  const [vehiculoForm, setVehiculoForm] = useState<VehiculoFormData>({
    placa: '',
    motor: '',
    marca: '',
    modelo: '',
    color: '',
    anio: new Date().getFullYear().toString(),
    numChasis: '',
  });

  useEffect(() => {
    // Verificar autenticación desde localStorage como fallback
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('landing-user');
        
        // Si hay token pero el store no tiene usuario, intentar recuperarlo
        if (storedToken && (!user || !isAuthenticated)) {
          try {
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              useLandingAuthStore.getState().setAuth(storedToken, parsedUser);
            }
          } catch {
            // Si hay error, limpiar
            localStorage.removeItem('token');
            localStorage.removeItem('landing-user');
          }
        }
      }
    };
    
    checkAuth();
    
    const loadData = async () => {
      try {
        // Obtener el usuario actualizado después de verificar auth
        const currentUser = useLandingAuthStore.getState().user;
        const currentToken = useLandingAuthStore.getState().token || 
          (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        
        const [motivosData, vehiculosData] = await Promise.all([
          getMotivosCita(),
          currentUser?.clienteId && currentToken
            ? getVehiculosByCliente(currentUser.clienteId)
            : Promise.resolve([]),
        ]);
        setMotivos(motivosData);
        setVehiculos(vehiculosData);
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, isAuthenticated, token]);

  // Sanitizar texto
  const sanitizeText = (text: string, maxLength: number = 255): string => {
    return text.trim().slice(0, maxLength);
  };

  // Validar fecha y hora
  const validateFechaHora = (fecha: string, hora: string): boolean => {
    try {
      const fechaHora = `${fecha}T${hora}:00`;
      const date = new Date(fechaHora);
      // Verificar que la fecha sea válida y no sea en el pasado
      if (isNaN(date.getTime())) {
        return false;
      }
      // La fecha debe ser en el futuro o hoy
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const fechaDate = new Date(fecha);
      fechaDate.setHours(0, 0, 0, 0);
      return fechaDate >= now;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.idMotivoCita) {
      toast.error('Debe seleccionar un motivo de cita');
      return;
    }

    if (!formData.idVehiculo) {
      toast.error('Debe seleccionar un vehículo');
      return;
    }

    if (!formData.fechaInicio || !formData.horaInicio) {
      toast.error('Debe seleccionar una fecha y hora');
      return;
    }

    // Validar fecha y hora
    if (!validateFechaHora(formData.fechaInicio, formData.horaInicio)) {
      toast.error(
        'La fecha y hora seleccionadas no son válidas o están en el pasado'
      );
      return;
    }

    setSubmitting(true);

    try {
      // Combinar fecha y hora
      const fechaHora = `${formData.fechaInicio}T${formData.horaInicio}:00`;

      // Validar que los IDs sean números válidos
      const idVehiculo = Number(formData.idVehiculo);
      const idMotivoCita = Number(formData.idMotivoCita);

      if (!Number.isFinite(idVehiculo) || idVehiculo <= 0) {
        toast.error('El vehículo seleccionado no es válido');
        setSubmitting(false);
        return;
      }

      if (!Number.isFinite(idMotivoCita) || idMotivoCita <= 0) {
        toast.error('El motivo de cita seleccionado no es válido');
        setSubmitting(false);
        return;
      }

      if (!user?.clienteId) {
        toast.error('Debes estar autenticado para agendar una cita');
        return;
      }

      await createCita({
        idCliente: user.clienteId,
        idVehiculo: idVehiculo,
        idMotivoCita: idMotivoCita,
        fechaInicio: new Date(fechaHora).toISOString(),
        estado: 'PROGRAMADA',
        canal: 'web',
      });

      toast.success('Cita agendada exitosamente');
      navigate('/');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : 'No se pudo agendar la cita');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVehiculo = async () => {
    if (!user?.clienteId) {
      toast.error('Debe estar autenticado para registrar un vehículo');
      return;
    }

    // Sanitizar y validar campos del vehículo
    const placaLimpia = sanitizeText(vehiculoForm.placa, 20).toUpperCase();
    const motorLimpio = sanitizeText(vehiculoForm.motor, 50);
    const marcaLimpia = sanitizeText(vehiculoForm.marca, 50);
    const modeloLimpio = sanitizeText(vehiculoForm.modelo, 50);
    const colorLimpio = sanitizeText(vehiculoForm.color, 30);
    const numChasisLimpio = sanitizeText(vehiculoForm.numChasis, 50);
    const anio = Number(vehiculoForm.anio);

    // Validaciones
    if (!placaLimpia || placaLimpia.length < 3) {
      toast.error('La placa debe tener al menos 3 caracteres');
      return;
    }

    if (!marcaLimpia || marcaLimpia.length < 2) {
      toast.error('La marca debe tener al menos 2 caracteres');
      return;
    }

    if (!modeloLimpio || modeloLimpio.length < 2) {
      toast.error('El modelo debe tener al menos 2 caracteres');
      return;
    }

    // Validar año (entre 1900 y año actual + 1)
    const anioActual = new Date().getFullYear();
    if (!Number.isFinite(anio) || anio < 1900 || anio > anioActual + 1) {
      toast.error(`El año debe estar entre 1900 y ${anioActual + 1}`);
      return;
    }

    try {
      const nuevoVehiculo = await createVehiculo({
        idCliente: user.clienteId,
        placa: placaLimpia,
        motor: motorLimpio,
        marca: marcaLimpia,
        modelo: modeloLimpio,
        color: colorLimpio,
        anio: anio,
        numChasis: numChasisLimpio,
      });

      setVehiculos([...vehiculos, nuevoVehiculo]);
      setFormData({
        ...formData,
        idVehiculo: nuevoVehiculo.idVehiculo.toString(),
      });
      setShowVehiculoForm(false);
      setVehiculoForm({
        placa: '',
        motor: '',
        marca: '',
        modelo: '',
        color: '',
        anio: new Date().getFullYear().toString(),
        numChasis: '',
      });
      toast.success('Vehículo registrado exitosamente');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo registrar el vehículo');
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-black/70 font-montserrat">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-5xl mx-auto bg-white border-2 border-orange-500/20 shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="text-center pb-6 pt-8 md:pt-10 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-white via-orange-50/5 to-white">
          <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black font-montserrat mb-3 md:mb-4 tracking-tight">
            Agendar Cita
          </CardTitle>
          <div className="w-20 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 mx-auto mb-3 md:mb-4 rounded-full"></div>
          <p className="text-black/70 text-base sm:text-lg font-montserrat max-w-2xl mx-auto leading-relaxed">
            Programa una cita para el servicio de tu moto con nuestros
            especialistas
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <Label className="text-black font-bold text-sm sm:text-base flex items-center gap-2 font-montserrat tracking-wide">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                Motivo de la Cita <span className="text-orange-500">*</span>
              </Label>
              <Select
                value={formData.idMotivoCita}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    idMotivoCita: value,
                  })
                }
                disabled={submitting || motivos.length === 0}
              >
                <SelectTrigger className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all">
                  <SelectValue placeholder="Selecciona el motivo de la cita" />
                </SelectTrigger>
                <SelectContent className="font-montserrat">
                  {motivos.map((motivo) => (
                    <SelectItem
                      key={motivo.idMotivoCita}
                      value={motivo.idMotivoCita.toString()}
                      className="font-montserrat"
                    >
                      {motivo.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {motivos.length === 0 && !loading && (
                <p className="text-sm text-amber-600 flex items-start gap-1 font-montserrat">
                  <span className="mt-0.5">⚠️</span>
                  <span>
                    No hay motivos de cita disponibles. Por favor contacta al
                    taller.
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-black font-bold text-sm sm:text-base flex items-center gap-2 font-montserrat tracking-wide">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                Vehículo <span className="text-orange-500">*</span>
              </Label>
              {vehiculos.length > 0 ? (
                <Select
                  value={formData.idVehiculo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, idVehiculo: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all">
                    <SelectValue placeholder="Selecciona tu vehículo" />
                  </SelectTrigger>
                  <SelectContent className="font-montserrat">
                    {vehiculos.map((vehiculo) => (
                      <SelectItem
                        key={vehiculo.idVehiculo}
                        value={vehiculo.idVehiculo.toString()}
                        className="font-montserrat"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <Car className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          <span className="font-medium font-montserrat text-sm sm:text-base">
                            {vehiculo.marca} {vehiculo.modelo}
                          </span>
                          <span className="text-black/60 font-montserrat text-xs sm:text-sm">
                            - {vehiculo.placa}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-6 bg-gradient-to-br from-orange-50/50 to-white border-2 border-orange-500/20 rounded-xl shadow-sm">
                  <p className="text-black/70 mb-4 font-montserrat text-base">
                    No tienes vehículos registrados
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowVehiculoForm(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-montserrat font-semibold touch-manipulation min-h-[48px]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Vehículo
                  </Button>
                </div>
              )}

              {vehiculos.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVehiculoForm(!showVehiculoForm)}
                    className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10 font-montserrat touch-manipulation min-h-[40px]"
                  >
                    {showVehiculoForm ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Nuevo Vehículo
                      </>
                    )}
                  </Button>
                </div>
              )}

              {showVehiculoForm && (
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50/50 to-white border-2 border-orange-500/20 rounded-xl space-y-4 sm:space-y-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-black font-montserrat">
                      Registrar Nuevo Vehículo
                    </h3>
                    {vehiculos.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVehiculoForm(false)}
                        className="text-black/60 hover:text-black touch-manipulation min-h-[40px] min-w-[40px]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Placa <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={vehiculoForm.placa}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            placa: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ABC-123"
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Motor <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={vehiculoForm.motor}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            motor: e.target.value,
                          })
                        }
                        placeholder="Número de motor"
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Marca <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={vehiculoForm.marca}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            marca: e.target.value,
                          })
                        }
                        placeholder="Honda, Yamaha, etc."
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Modelo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={vehiculoForm.modelo}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            modelo: e.target.value,
                          })
                        }
                        placeholder="Modelo del vehículo"
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Color <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={vehiculoForm.color}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            color: e.target.value,
                          })
                        }
                        placeholder="Color del vehículo"
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Año <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={vehiculoForm.anio}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            anio: e.target.value,
                          })
                        }
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-montserrat font-semibold text-black">
                        Número de Chasis
                      </Label>
                      <Input
                        value={vehiculoForm.numChasis}
                        onChange={(e) =>
                          setVehiculoForm({
                            ...vehiculoForm,
                            numChasis: e.target.value,
                          })
                        }
                        placeholder="Número de chasis (opcional)"
                        className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateVehiculo}
                    disabled={
                      !vehiculoForm.placa ||
                      !vehiculoForm.motor ||
                      !vehiculoForm.marca ||
                      !vehiculoForm.modelo ||
                      !vehiculoForm.color ||
                      !vehiculoForm.anio
                    }
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base font-montserrat shadow-lg touch-manipulation min-h-[48px]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Vehículo
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-black font-semibold text-sm sm:text-base flex items-center gap-2 font-montserrat">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  Fecha <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-black font-semibold text-sm sm:text-base flex items-center gap-2 font-montserrat">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  Hora <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, horaInicio: e.target.value })
                  }
                  className="h-12 sm:h-14 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all touch-manipulation"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-montserrat touch-manipulation min-h-[48px]"
                disabled={
                  submitting ||
                  (vehiculos.length === 0 && !showVehiculoForm) ||
                  !formData.idMotivoCita ||
                  !formData.fechaInicio ||
                  !formData.horaInicio
                }
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"
                    />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Agendar Cita
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
