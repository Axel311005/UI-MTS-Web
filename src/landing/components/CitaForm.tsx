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
import { Calendar, Car, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getMotivosCita, createCita } from '../actions/cita.actions';
import {
  getVehiculosByCliente,
  createVehiculo,
} from '../actions/vehiculo.actions';
import type { Vehiculo, MotivoCita } from '../types/cita.types';
import { useLandingAuthStore } from '../store/landing-auth.store';

export function CitaForm() {
  const { user } = useLandingAuthStore();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [motivos, setMotivos] = useState<MotivoCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showVehiculoForm, setShowVehiculoForm] = useState(false);

  // Log cuando cambian los vehículos o el user
  useEffect(() => {
    console.log('👤 User del store:', user);
    console.log('👤 ClienteId:', user?.clienteId);
    console.log('👤 Tipo de clienteId:', typeof user?.clienteId);
    console.log(
      '🔄 Estado vehiculos actualizado:',
      vehiculos.length,
      vehiculos
    );
    console.log('🔄 showVehiculoForm:', showVehiculoForm);
  }, [vehiculos, showVehiculoForm, user]);
  const [creatingVehiculo, setCreatingVehiculo] = useState(false);
  const [formData, setFormData] = useState({
    idMotivoCita: '',
    idVehiculo: '',
    fechaInicio: '',
  });
  const [vehiculoForm, setVehiculoForm] = useState({
    placa: '',
    motor: '',
    marca: '',
    anio: new Date().getFullYear(),
    modelo: '',
    color: '',
    numChasis: '',
  });

  useEffect(() => {
    console.log('🚀 useEffect loadData ejecutado');
    console.log('🚀 User completo:', user);
    console.log('🚀 ClienteId disponible:', user?.clienteId);

    const loadData = async () => {
      if (!user?.clienteId) {
        console.warn('⚠️ No hay clienteId, no se cargarán los datos');
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Cargando datos para clienteId:', user.clienteId);
        console.log('📋 Tipo de clienteId:', typeof user.clienteId);
        // Cargar vehículos es crítico, motivos es opcional (el cliente puede crear su propio motivo)
        const [motivosData, vehiculosData] = await Promise.allSettled([
          getMotivosCita(),
          getVehiculosByCliente(user.clienteId),
        ]);

        const motivosCargados =
          motivosData.status === 'fulfilled' ? motivosData.value : [];
        const vehiculosCargados =
          vehiculosData.status === 'fulfilled' ? vehiculosData.value : [];

        if (motivosData.status === 'rejected') {
          console.warn(
            '⚠️ No se pudieron cargar los motivos de cita:',
            motivosData.reason
          );
        }
        if (vehiculosData.status === 'rejected') {
          console.error('❌ Error cargando vehículos:', vehiculosData.reason);
          toast.error('Error al cargar vehículos');
        }

        setMotivos(motivosCargados);
        console.log('✅ Motivos cargados:', motivosCargados.length);
        console.log(
          '✅ Vehículos cargados en loadData:',
          vehiculosCargados.length,
          vehiculosCargados
        );
        console.log('✅ Tipo de vehiculos:', typeof vehiculosCargados);
        console.log('✅ Es array vehiculos?', Array.isArray(vehiculosCargados));

        // Asegurar que siempre sea un array
        const vehiculosArray = Array.isArray(vehiculosCargados)
          ? vehiculosCargados
          : [];
        console.log(
          '✅ Vehículos array final:',
          vehiculosArray.length,
          vehiculosArray
        );

        setVehiculos(vehiculosArray);
        // Si hay vehículos, ocultar el formulario. Si no hay, mostrarlo.
        if (vehiculosArray.length === 0) {
          setShowVehiculoForm(true);
        } else {
          setShowVehiculoForm(false);
        }
      } catch (error: any) {
        toast.error('Error al cargar datos');
        console.error('❌ Error en loadData:', error);
        if (error?.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clienteId) {
      toast.error('Debes estar autenticado para crear una cita');
      return;
    }

    if (
      !formData.idMotivoCita ||
      !formData.idVehiculo ||
      !formData.fechaInicio
    ) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      // Crear la cita con el motivo seleccionado
      await createCita({
        idCliente: user.clienteId,
        idVehiculo: Number(formData.idVehiculo),
        idMotivoCita: Number(formData.idMotivoCita),
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        estado: 'PROGRAMADA',
        canal: 'web',
      });

      toast.success('¡Cita programada exitosamente! Te contactaremos pronto.');
      setFormData({
        idMotivoCita: '',
        idVehiculo: '',
        fechaInicio: '',
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la cita. Por favor intenta nuevamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
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
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow-lg">
              <Calendar className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Agendar Cita
          </CardTitle>
          <p className="text-slate-600 mt-3 text-lg">
            Programa una cita para el servicio de tu moto
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Motivo de la Cita <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.idMotivoCita}
                onValueChange={(value) =>
                  setFormData({ ...formData, idMotivoCita: value })
                }
                disabled={submitting || motivos.length === 0}
              >
                <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-400 rounded-xl">
                  <SelectValue placeholder="Selecciona el motivo de la cita" />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((motivo) => (
                    <SelectItem
                      key={motivo.idMotivoCita}
                      value={motivo.idMotivoCita.toString()}
                    >
                      {motivo.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {motivos.length === 0 && !loading && (
                <p className="text-sm text-amber-600 flex items-start gap-1">
                  <span className="mt-0.5">⚠️</span>
                  <span>
                    No hay motivos de cita disponibles. Por favor contacta al
                    taller.
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold text-base flex items-center gap-2">
                <Car className="h-5 w-5 text-orange-500" />
                Vehículo <span className="text-destructive">*</span>
              </Label>
              {vehiculos.length > 0 ? (
                <Select
                  value={formData.idVehiculo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, idVehiculo: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-400 rounded-xl">
                    <SelectValue placeholder="Selecciona tu vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((vehiculo) => (
                      <SelectItem
                        key={vehiculo.idVehiculo}
                        value={vehiculo.idVehiculo.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">
                            {vehiculo.marca} {vehiculo.modelo}
                          </span>
                          <span className="text-slate-500">
                            - {vehiculo.placa}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  {!showVehiculoForm && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800 mb-3">
                        <strong>No tienes vehículos registrados.</strong>{' '}
                        Registra tu vehículo para continuar.
                      </p>
                      <Button
                        type="button"
                        onClick={() => setShowVehiculoForm(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        Registrar Vehículo
                      </Button>
                    </div>
                  )}

                  {showVehiculoForm && (
                    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-700">
                          Registrar Nuevo Vehículo
                        </h3>
                        {vehiculos.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowVehiculoForm(false)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>
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
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
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
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
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
                            placeholder="Ej: Honda, Yamaha"
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
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
                            placeholder="Ej: CBR 600"
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            Año <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            type="number"
                            value={vehiculoForm.anio}
                            onChange={(e) =>
                              setVehiculoForm({
                                ...vehiculoForm,
                                anio: Number(e.target.value),
                              })
                            }
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
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
                            placeholder="Ej: Rojo, Negro"
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>
                            Número de Chasis{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={vehiculoForm.numChasis}
                            onChange={(e) =>
                              setVehiculoForm({
                                ...vehiculoForm,
                                numChasis: e.target.value,
                              })
                            }
                            placeholder="Número de chasis"
                            disabled={creatingVehiculo}
                            className="border-2 border-orange-200"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={async () => {
                          if (
                            !vehiculoForm.placa ||
                            !vehiculoForm.motor ||
                            !vehiculoForm.marca ||
                            !vehiculoForm.modelo ||
                            !vehiculoForm.color ||
                            !vehiculoForm.numChasis
                          ) {
                            toast.error('Completa todos los campos requeridos');
                            return;
                          }
                          if (!user?.clienteId) {
                            toast.error('Debes estar autenticado');
                            return;
                          }
                          setCreatingVehiculo(true);
                          try {
                            const nuevoVehiculo = await createVehiculo({
                              idCliente: user.clienteId,
                              ...vehiculoForm,
                            });
                            toast.success('Vehículo registrado exitosamente');
                            setVehiculos([...vehiculos, nuevoVehiculo]);
                            setShowVehiculoForm(false);
                            setVehiculoForm({
                              placa: '',
                              motor: '',
                              marca: '',
                              anio: new Date().getFullYear(),
                              modelo: '',
                              color: '',
                              numChasis: '',
                            });
                          } catch (error: any) {
                            const message =
                              error?.response?.data?.message ||
                              error?.message ||
                              'Error al registrar vehículo';
                            toast.error(message);
                          } finally {
                            setCreatingVehiculo(false);
                          }
                        }}
                        disabled={creatingVehiculo}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        {creatingVehiculo ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Registrando...
                          </span>
                        ) : (
                          'Registrar Vehículo'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Fecha y Hora <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={(e) =>
                  setFormData({ ...formData, fechaInicio: e.target.value })
                }
                min={new Date().toISOString().slice(0, 16)}
                className="h-12 border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 rounded-xl text-base"
                disabled={submitting}
              />
              <p className="text-sm text-slate-500">
                Selecciona la fecha y hora que mejor se ajuste a tu
                disponibilidad.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 hover:from-orange-600 hover:via-orange-700 hover:to-pink-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={
                  submitting ||
                  (vehiculos.length === 0 && !showVehiculoForm) ||
                  !formData.idMotivoCita
                }
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Programando cita...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Programar Cita
                  </span>
                )}
              </Button>
            </motion.div>

            {vehiculos.length === 0 && !showVehiculoForm && (
              <p className="text-center text-sm text-slate-500">
                No puedes agendar una cita sin tener vehículos registrados.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
