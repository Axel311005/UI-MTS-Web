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
  // ID 4 es el consecutivo de cotizaciones (fijo, no necesita estado)
  const consecutivoId = 4;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar items cotizables
        const itemsData = await getItemsCotizables();
        setItems(itemsData);

        // El consecutivoId ya está inicializado con el valor 4 (consecutivo de cotizaciones)
      } catch (error: any) {
        toast.error('Error al cargar items cotizables');
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
      const cantidad = Number(updated[index].cantidad) || 1;
      updated[index] = {
        ...updated[index],
        idItem: value,
        precioUnitario: Math.max(0, precio), // Asegurar que sea positivo
        cantidad: Math.max(1, cantidad), // Asegurar que sea al menos 1
        totalLinea: Math.max(0, cantidad * precio), // Asegurar que sea positivo
      };
    } else {
      // Asegurar que siempre guardamos números válidos
      let numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) {
        numeric = field === 'cantidad' ? 1 : 0; // Cantidad mínimo 1, otros mínimo 0
      }
      
      if (field === 'cantidad' && numeric < 1) {
        numeric = 1; // Cantidad debe ser al menos 1
      }
      
      updated[index] = { ...updated[index], [field]: numeric } as DetalleLinea;
    }

    // Recalcular total solo si cambia cantidad (precioUnitario no se puede cambiar)
    if (field === 'cantidad' || field === 'idItem') {
      const cantidad = Math.max(1, Number(updated[index].cantidad) || 1);
      const precio = Math.max(0, Number(updated[index].precioUnitario) || 0);
      updated[index].totalLinea = Math.max(0, cantidad * precio);
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

    // El consecutivoId siempre es 4 (consecutivo de cotizaciones)

    // Validar que todas las líneas tengan valores válidos
    const lineasInvalidas = lineas.some((linea) => {
      const precioUnitario = Number(linea.precioUnitario);
      const totalLinea = Number(linea.totalLinea);
      const cantidad = Number(linea.cantidad);
      
      return (
        !Number.isFinite(precioUnitario) ||
        precioUnitario <= 0 ||
        !Number.isFinite(totalLinea) ||
        totalLinea < 0 ||
        !Number.isFinite(cantidad) ||
        cantidad <= 0
      );
    });

    if (lineasInvalidas) {
      toast.error('Por favor, verifica que todos los items tengan valores válidos');
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

      // Crear detalles - asegurar que todos los valores sean números válidos
      for (const linea of lineas) {
        const precioUnitario = Number(linea.precioUnitario) || 0;
        const totalLineas = Number(linea.totalLinea) || 0;
        const cantidad = Number(linea.cantidad) || 0;

        if (precioUnitario <= 0 || totalLineas < 0 || cantidad <= 0) {
          throw new Error(`Item con valores inválidos: precioUnitario=${precioUnitario}, totalLineas=${totalLineas}, cantidad=${cantidad}`);
        }

        await createDetalleCotizacion({
          idItem: linea.idItem,
          idCotizacion: cotizacion.idCotizacion,
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          totalLineas: totalLineas,
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
          <p className="text-black/70 text-lg font-montserrat">Cargando items...</p>
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
      <Card className="max-w-6xl mx-auto bg-white border-2 border-orange-500/20 shadow-2xl overflow-hidden rounded-2xl">
        <CardHeader className="text-center pb-6 pt-8 md:pt-10 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-white via-orange-50/5 to-white">
          <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black font-montserrat mb-3 md:mb-4 tracking-tight">
            Cotización en Línea
          </CardTitle>
          <div className="w-20 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 mx-auto mb-3 md:mb-4 rounded-full"></div>
          <p className="text-black/70 text-base sm:text-lg font-montserrat max-w-2xl mx-auto leading-relaxed">
            Agrega los items que necesitas y obtén una cotización instantánea
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {lineas.length > 0 && (
              <div className="space-y-4">
                {lineas.map((linea, index) => {
                  const totalLineaValue = Number.isFinite(linea.totalLinea)
                    ? linea.totalLinea
                    : 0;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 sm:gap-4 items-end p-4 sm:p-6 bg-gradient-to-br from-white via-orange-50/10 to-white rounded-xl sm:rounded-2xl border-2 border-orange-500/20 shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    >
                      <div className="col-span-12 sm:col-span-6 md:col-span-5">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
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
                          <SelectTrigger className="h-11 sm:h-12 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all">
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
                      <div className="col-span-6 sm:col-span-3 md:col-span-2">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
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
                          className="h-11 sm:h-12 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3 md:col-span-2">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
                          Precio Unit.
                        </Label>
                        <Input
                          type="text"
                          value={toMoney(linea.precioUnitario)}
                          disabled
                          className="h-11 sm:h-12 border-2 border-orange-500/20 bg-white text-black rounded-xl cursor-not-allowed font-montserrat font-semibold text-sm sm:text-base"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-2">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
                          Total
                        </Label>
                        <Input
                          type="text"
                          value={`C$ ${totalLineaValue.toFixed(2)}`}
                          disabled
                          className="h-11 sm:h-12 font-bold text-base sm:text-lg bg-white text-black border-2 border-orange-500/20 rounded-xl font-montserrat"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 md:col-span-1 flex justify-center sm:justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeLinea(index)}
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shadow-lg"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
                className="w-full border-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500 h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 font-montserrat"
                disabled={items.length === 0}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Agregar Item</span>
              </Button>
            </motion.div>

            {lineas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t-2 border-orange-200 pt-6 mt-6"
              >
                <div className="flex justify-between items-center p-6 bg-orange-500/10 rounded-2xl shadow-lg border border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-orange-500" />
                    <span className="text-xl sm:text-2xl font-bold text-black font-montserrat">
                      Total:
                    </span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-orange-500 font-montserrat">
                    C$ {Number(total || 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 relative overflow-hidden font-montserrat"
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
