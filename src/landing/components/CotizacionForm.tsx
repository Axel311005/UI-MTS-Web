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
import { Plus, Trash2, DollarSign, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  getItemsCotizables,
  createCotizacion,
  createDetalleCotizacion,
} from '../actions/cotizacion.actions';
import type { ItemCotizable } from '../types/cotizacion.types';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { landingConsecutivoApi } from '../api/consecutivo.api';

interface DetalleLinea {
  idItem: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export function CotizacionForm() {
  const { user } = useLandingAuthStore();
  const [items, setItems] = useState<ItemCotizable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lineas, setLineas] = useState<DetalleLinea[]>([]);
  const [consecutivoId, setConsecutivoId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar items cotizables
        const itemsData = await getItemsCotizables();
        setItems(itemsData);

        // Intentar obtener consecutivo, pero si falla (403), usar valor por defecto
        try {
          const consecutivosResponse = await landingConsecutivoApi.get('/');
          const consecutivos = Array.isArray(consecutivosResponse.data)
            ? consecutivosResponse.data
            : [];
          const cotizacionConsecutivo = consecutivos.find(
            (c: any) =>
              c.idConsecutivo === 4 ||
              c.descripcion?.toLowerCase().includes('cotizacion')
          );
          if (cotizacionConsecutivo) {
            setConsecutivoId(cotizacionConsecutivo.idConsecutivo);
          } else if (consecutivos.length > 0) {
            // Fallback: usar el primero disponible
            setConsecutivoId(consecutivos[0].idConsecutivo);
          } else {
            // Si no hay consecutivos, usar el ID 4 por defecto (consecutivo de cotización)
            setConsecutivoId(4);
          }
        } catch (consecError: any) {
          // Si el consecutivo falla (403 Forbidden o cualquier error), usar valor por defecto
          console.warn(
            'No se pudo obtener consecutivo, usando valor por defecto:',
            consecError?.response?.status
          );
          setConsecutivoId(4); // ID por defecto para cotizaciones
        }
      } catch (error: any) {
        toast.error('Error al cargar items cotizables');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper para imprimir valores monetarios sin romper si vienen como string o undefined
  const toMoney = (n: unknown) => `C$ ${Number(n ?? 0).toFixed(2)}`;

  const addLinea = () => {
    if (items.length === 0) return;
    const firstItem = items[0];
    const precio = firstItem.precioBaseLocal ?? firstItem.precioUnitario ?? 0;
    setLineas([
      ...lineas,
      {
        idItem: firstItem.idItem,
        cantidad: 1,
        precioUnitario: precio,
        totalLinea: precio,
      },
    ]);
  };

  const removeLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const updateLinea = (
    index: number,
    field: keyof DetalleLinea,
    value: number
  ) => {
    const updated = [...lineas];
    if (field === 'idItem') {
      // Cuando cambia el item, actualizar el precio unitario al del item seleccionado (buscar por el nuevo id)
      const selected = items.find((i) => i.idItem === value);
      const precio = Number(
        (selected as any)?.precioBaseLocal ??
          (selected as any)?.precioUnitario ??
          0
      );
      const cantidad = 1;
      updated[index] = {
        ...updated[index],
        idItem: value,
        precioUnitario: precio,
        cantidad,
        totalLinea: cantidad * precio,
      };
    } else {
      // Asegurar que siempre guardamos números
      const numeric = Number(value) || 0;
      updated[index] = { ...updated[index], [field]: numeric } as DetalleLinea;
    }

    // Recalcular total solo si cambia cantidad (precioUnitario no se puede cambiar)
    if (field === 'cantidad' || field === 'idItem') {
      const cantidad = Number(updated[index].cantidad) || 0;
      const precio = Number(updated[index].precioUnitario) || 0;
      updated[index].totalLinea = cantidad * precio;
    }

    setLineas(updated);
  };

  const total = lineas.reduce((sum, linea) => {
    const totalLinea = Number(linea.totalLinea) || 0;
    return sum + totalLinea;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.clienteId) {
      toast.error('Debes estar autenticado para crear una cotización');
      return;
    }

    if (lineas.length === 0) {
      toast.error('Agrega al menos un item a la cotización');
      return;
    }

    if (!consecutivoId) {
      toast.error('No se pudo obtener el consecutivo de cotización');
      return;
    }

    setSubmitting(true);
    try {
      // Crear cotización
      const cotizacion = await createCotizacion({
        idCliente: user.clienteId,
        idConsecutivo: consecutivoId,
        estado: 'GENERADA',
        nombreCliente: user.nombre || 'Cliente',
      });

      // Crear detalles
      for (const linea of lineas) {
        await createDetalleCotizacion({
          idItem: linea.idItem,
          idCotizacion: cotizacion.idCotizacion,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          totalLineas: linea.totalLinea,
        });
      }

      toast.success('Cotización enviada con éxito');
      setLineas([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear cotización';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"
          />
          <p className="text-slate-600 text-lg">Cargando items...</p>
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
      <Card className="max-w-5xl mx-auto bg-gradient-to-br from-white via-orange-50/30 to-pink-50/30 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="inline-block mb-4">
            <div className="p-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow-lg">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Cotización en Línea
          </CardTitle>
          <p className="text-slate-600 mt-2">
            Agrega los items que necesitas y obtén una cotización instantánea
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {lineas.length > 0 && (
              <div className="space-y-4">
                {lineas.map((linea, index) => {
                  const totalLineaValue = Number.isFinite(linea.totalLinea)
                    ? linea.totalLinea
                    : 0;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-end p-6 bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <Label className="text-slate-700 font-semibold mb-2 block">
                          Item
                        </Label>
                        <Select
                          value={linea.idItem.toString()}
                          onValueChange={(value) => {
                            const selectedItem = items.find(
                              (i) => i.idItem === Number(value)
                            );
                            if (selectedItem) {
                              updateLinea(index, 'idItem', Number(value));
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-400 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem
                                key={item.idItem}
                                value={item.idItem.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                                  <span>
                                    {item.codigoItem} - {item.descripcion}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Label className="text-slate-700 font-semibold mb-2 block">
                          Cantidad
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={linea.cantidad}
                          onChange={(e) =>
                            updateLinea(
                              index,
                              'cantidad',
                              Number(e.target.value)
                            )
                          }
                          className="h-12 border-2 border-orange-200 focus:border-orange-400 rounded-xl"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Label className="text-slate-700 font-semibold mb-2 block">
                          Precio Unit.
                        </Label>
                        <Input
                          type="text"
                          value={toMoney(linea.precioUnitario)}
                          disabled
                          className="h-12 border-2 border-orange-200 bg-slate-50 rounded-xl cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-10 md:col-span-2">
                        <Label className="text-slate-700 font-semibold mb-2 block">
                          Total
                        </Label>
                        <Input
                          type="text"
                          value={`C$ ${totalLineaValue.toFixed(2)}`}
                          disabled
                          className="h-12 font-bold text-lg bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeLinea(index)}
                          className="h-12 w-12 rounded-xl shadow-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={addLinea}
                className="w-full border-2 border-orange-300 text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:border-orange-400 h-14 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300"
                disabled={items.length === 0}
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Item
              </Button>
            </motion.div>

            {lineas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-2 border-orange-200 pt-6 mt-6"
              >
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-orange-50 via-pink-50 to-orange-50 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-orange-500" />
                    <span className="text-2xl font-bold text-slate-800">
                      Total:
                    </span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    C$ {Number(total || 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 hover:from-orange-600 hover:via-orange-700 hover:to-pink-600 text-white h-14 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 relative overflow-hidden"
                disabled={submitting || lineas.length === 0}
              >
                <span className="relative z-10 flex items-center justify-center">
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5 mr-2" />
                      Enviar Cotización
                    </>
                  )}
                </span>
                {!submitting && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
