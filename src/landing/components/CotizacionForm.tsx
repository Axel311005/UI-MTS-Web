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
import { Plus, Trash2, DollarSign, ShoppingCart, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  getItemsCotizables,
  createCotizacion,
  createDetalleCotizacion,
} from '../actions/cotizacion.actions';
import { landingCotizacionApi } from '../api/landing.api';
import type { ItemCotizable } from '../types/cotizacion.types';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';

interface DetalleLinea {
  idItem: number | null; // null cuando no hay item seleccionado
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
  lineaId?: string; // ID único para cada línea
}

export function CotizacionForm() {
  const { user: landingUser } = useLandingAuthStore();
  const authUser = useAuthStore((s) => s.user);
  const [localUser, setLocalUser] = useState<{ id: number; email: string; clienteId?: number; nombre?: string } | null>(null);
  
  // Verificar localStorage directamente como fallback inmediato
  useEffect(() => {
    if (!landingUser && !authUser?.cliente) {
      try {
        const storedUserStr = localStorage.getItem('landing-user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser?.clienteId) {
            setLocalUser(storedUser);
          }
        }
      } catch (error) {
        // Ignorar errores de parsing
      }
    } else {
      setLocalUser(null);
    }
  }, [landingUser, authUser]);
  
  // Obtener clienteId desde landingUser, localUser o desde authUser como fallback
  const user = landingUser || localUser || (authUser?.cliente ? {
    id: Number(authUser.id) || 0,
    email: authUser.email || '',
    clienteId: (authUser.cliente as any)?.id || (authUser.cliente as any)?.idCliente,
    nombre: authUser.cliente?.primerNombre 
      ? `${authUser.cliente.primerNombre} ${authUser.cliente.primerApellido || ''}`.trim()
      : authUser.cliente?.ruc || 'Cliente',
  } : null);
  
  const [items, setItems] = useState<ItemCotizable[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lineas, setLineas] = useState<DetalleLinea[]>([]);
  const [createdCotizacionId, setCreatedCotizacionId] = useState<number | null>(null);
  const [createdCotizacionCodigo, setCreatedCotizacionCodigo] = useState<string | null>(null);
  // ID 4 es el consecutivo de cotizaciones (fijo, no necesita estado)
  const consecutivoId = 4;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar items cotizables
        const itemsData = await getItemsCotizables();
        setItems(itemsData);

        // El consecutivoId ya está inicializado con el valor 4 (consecutivo de cotizaciones)
        // NO cargamos el ID desde localStorage al inicio - el botón solo aparece después de enviar exitosamente
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
    
    // Si el usuario empieza a agregar líneas después de haber enviado una cotización,
    // limpiar el estado de la cotización creada (ocultar botón de PDF)
    if (createdCotizacionId) {
      setCreatedCotizacionId(null);
      setCreatedCotizacionCodigo(null);
    }
    
    // Agregar nueva línea sin item seleccionado
    setLineas([
      ...lineas,
      {
        idItem: null, // Sin item seleccionado inicialmente
        cantidad: 1,
        precioUnitario: 0,
        totalLinea: 0,
        lineaId: `linea-${Date.now()}-${Math.random()}`,
      },
    ]);
  };

  const removeLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const updateLinea = (
    index: number,
    field: keyof DetalleLinea,
    value: number | null
  ) => {
    const updated = [...lineas];
    if (field === 'idItem') {
      if (value === null) {
        // Si se deselecciona, resetear valores
        updated[index] = {
          ...updated[index],
          idItem: null,
          precioUnitario: 0,
          totalLinea: 0,
        };
        setLineas(updated);
        return;
      }

      // Verificar si el nuevo item ya existe en otra línea
      const existingIndex = updated.findIndex(
        (l, i) => i !== index && l.idItem === value
      );
      
      if (existingIndex !== -1) {
        // Si existe, fusionar: sumar cantidades y eliminar la línea actual
        const existingLinea = updated[existingIndex];
        const currentCantidad = updated[index].cantidad;
        const newCantidad = existingLinea.cantidad + currentCantidad;
        updated[existingIndex] = {
          ...existingLinea,
          cantidad: newCantidad,
          totalLinea: newCantidad * existingLinea.precioUnitario,
        };
        updated.splice(index, 1);
        setLineas(updated);
        return; // Salir temprano porque ya actualizamos el estado
      }
      
      // Si no existe, actualizar normalmente
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

  const handleDownloadPdf = async () => {
    // Obtener el ID desde el estado o localStorage
    let cotizacionId = createdCotizacionId;
    let cotizacionCodigo = createdCotizacionCodigo;
    
    // Si no hay ID en el estado, intentar obtenerlo de localStorage
    if (!cotizacionId) {
      try {
        const savedId = localStorage.getItem('lastCreatedCotizacionId');
        const savedCodigo = localStorage.getItem('lastCreatedCotizacionCodigo');
        if (savedId) {
          cotizacionId = Number(savedId);
          cotizacionCodigo = savedCodigo || null;
        } else {
          toast.error('No se encontró la cotización para descargar');
          return;
        }
      } catch (error) {
        toast.error('Error al obtener la información de la cotización');
        return;
      }
    }
    
    if (!cotizacionId) {
      toast.error('No se encontró la cotización para descargar');
      return;
    }
    
    try {
      const dismiss = toast.loading('Generando PDF...');
      
      // Verificar que el usuario esté autenticado
      const token = localStorage.getItem('token');
      if (!token) {
        toast.dismiss(dismiss);
        toast.error('Debes estar autenticado para descargar el PDF');
        return;
      }

      // Usar el ID guardado directamente, sin hacer GET adicional
      const response = await landingCotizacionApi.get(
        `/${cotizacionId}/cotizacion-pdf`,
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `cotizacion-${
        cotizacionCodigo || cotizacionId
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      toast.dismiss(dismiss);
      toast.success('PDF generado correctamente');
      
      // Limpiar los estados y localStorage después de descargar exitosamente
      setCreatedCotizacionId(null);
      setCreatedCotizacionCodigo(null);
      try {
        localStorage.removeItem('lastCreatedCotizacionId');
        localStorage.removeItem('lastCreatedCotizacionCodigo');
      } catch (error) {
        // Si hay error al limpiar localStorage, continuar de todas formas
        console.warn('Error al limpiar localStorage:', error);
      }
    } catch (error: any) {
      toast.dismiss();
      
      // Manejo específico de errores
      if (error?.response?.status === 403) {
        // Intentar leer el mensaje del error desde el Blob si es posible
        let errorMessage = 'No tienes permisos para generar el PDF de esta cotización';
        try {
          if (error?.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            errorMessage = json.message || errorMessage;
          }
        } catch {
          // Si no se puede parsear, usar el mensaje por defecto
        }
        toast.error(errorMessage);
      } else if (error?.response?.status === 401) {
        toast.error('Debes iniciar sesión para descargar el PDF');
      } else if (error?.response?.status === 404) {
        toast.error('La cotización no fue encontrada');
      } else {
        // Intentar leer el mensaje del error desde el Blob si es posible
        let message = 'Error al generar PDF';
        try {
          if (error?.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            const json = JSON.parse(text);
            message = json.message || message;
          } else {
            message = error?.response?.data?.message || error?.message || message;
          }
        } catch {
          message = error?.response?.data?.message || error?.message || message;
        }
        toast.error(message);
      }
    }
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

    // Validar que todas las líneas tengan un item seleccionado
    const lineasSinItem = lineas.filter((linea) => !linea.idItem || linea.idItem === null);
    if (lineasSinItem.length > 0) {
      toast.error('Por favor, selecciona un item para todas las líneas');
      return;
    }

    // Validar que todas las líneas tengan valores válidos y dentro de límites razonables
    const lineasInvalidas = lineas.some((linea) => {
      const totalLinea = Number(linea.totalLinea);
      const cantidad = Number(linea.cantidad);
      
      // Validar que sean números finitos
      if (!Number.isFinite(totalLinea) || !Number.isFinite(cantidad)) {
        return true;
      }
      
      // Validar límites: cantidad entre 1 y 10000
      if (cantidad <= 0 || cantidad > 10000) {
        return true;
      }
      
      if (totalLinea < 0) {
        return true;
      }
      
      return false;
    });

    if (lineasInvalidas) {
      toast.error('Por favor, verifica que todos los items tengan valores válidos (cantidad: 1-10000)');
      return;
    }

    // Validar número máximo de líneas (prevenir ataques)
    if (lineas.length > 100) {
      toast.error('No se pueden agregar más de 100 items en una cotización');
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
        // Validar que tenga un item seleccionado (ya validado arriba, pero por seguridad)
        if (!linea.idItem || linea.idItem === null) {
          throw new Error('Todas las líneas deben tener un item seleccionado');
        }

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

      // Guardar el ID de la cotización creada en estado (esto mostrará el botón de PDF)
      const cotizacionId = cotizacion.idCotizacion;
      setCreatedCotizacionId(cotizacionId);
      
      // Guardar en localStorage para que handleDownloadPdf pueda usarlo si es necesario
      try {
        localStorage.setItem('lastCreatedCotizacionId', String(cotizacionId));
        // Si el código viene en la respuesta, guardarlo también
        if (cotizacion.codigoCotizacion) {
          localStorage.setItem('lastCreatedCotizacionCodigo', cotizacion.codigoCotizacion);
          setCreatedCotizacionCodigo(cotizacion.codigoCotizacion);
        }
      } catch (error) {
        // Si hay error al guardar en localStorage, continuar de todas formas
        console.warn('Error al guardar en localStorage:', error);
      }
      
      toast.success('Cotización enviada con éxito');
      
      // Limpiar las líneas después de enviar exitosamente
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
                      key={linea.lineaId || `linea-${index}-${linea.idItem}`}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end p-4 sm:p-6 bg-gradient-to-br from-white via-orange-50/10 to-white rounded-xl sm:rounded-2xl border-2 border-orange-500/20 shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    >
                      <div className="col-span-1 sm:col-span-2 lg:col-span-5">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
                          Item
                        </Label>
                        <Select
                          key={`select-${linea.lineaId || index}-${linea.idItem || 'empty'}`}
                          value={linea.idItem?.toString() || ''}
                          onValueChange={(value) => {
                            if (!value) {
                              updateLinea(index, 'idItem', null);
                              return;
                            }
                            const selectedItem = items.find(
                              (i) => i.idItem === Number(value)
                            );
                            if (selectedItem) {
                              // Verificar si el item ya existe en otra línea
                              const existingIndex = lineas.findIndex(
                                (l, i) => i !== index && l.idItem === Number(value)
                              );
                              if (existingIndex !== -1) {
                                // Si existe, sumar a esa línea y eliminar la actual
                                const updated = [...lineas];
                                const existingLinea = updated[existingIndex];
                                const currentCantidad = updated[index].cantidad;
                                const newCantidad = existingLinea.cantidad + currentCantidad;
                                updated[existingIndex] = {
                                  ...existingLinea,
                                  cantidad: newCantidad,
                                  totalLinea: newCantidad * existingLinea.precioUnitario,
                                };
                                updated.splice(index, 1);
                                setLineas(updated);
                              } else {
                                // Si no existe, actualizar normalmente
                                updateLinea(index, 'idItem', Number(value));
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-11 sm:h-12 border-2 border-orange-500/20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl font-montserrat text-sm sm:text-base transition-all">
                            <SelectValue placeholder="Selecciona un item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem
                                key={item.idItem}
                                value={item.idItem.toString()}
                                textValue={`${item.codigoItem} - ${item.descripcion}`}
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                                  <span className="truncate">
                                    {item.codigoItem} - {item.descripcion}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 sm:col-span-1 lg:col-span-2">
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
                      <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
                          Precio Unit.
                        </Label>
                        <Input
                          type="text"
                          value={toMoney(linea.precioUnitario)}
                          disabled
                          className="h-11 sm:h-12 border-2 border-orange-500/20 bg-white text-black rounded-xl cursor-not-allowed font-montserrat font-semibold text-xs sm:text-sm"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                        <Label className="text-black font-bold text-xs sm:text-sm mb-2 block font-montserrat tracking-wide">
                          Total
                        </Label>
                        <Input
                          type="text"
                          value={`C$ ${totalLineaValue.toFixed(2)}`}
                          disabled
                          className="h-11 sm:h-12 font-bold text-sm sm:text-base bg-white text-black border-2 border-orange-500/20 rounded-xl font-montserrat"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1 lg:col-span-1 flex justify-center sm:justify-center lg:justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeLinea(index)}
                          className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shadow-lg touch-manipulation"
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
                className="w-full border-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500 h-12 sm:h-14 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 font-montserrat touch-manipulation min-h-[48px]"
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 p-4 sm:p-6 bg-orange-500/10 rounded-2xl shadow-lg border border-orange-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-black font-montserrat">
                      Total:
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-500 font-montserrat">
                    C$ {Number(total || 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 relative overflow-hidden font-montserrat touch-manipulation min-h-[48px]"
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

            {/* Botón para descargar PDF de la cotización recién creada */}
            {createdCotizacionId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4"
              >
                <Button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full bg-green-500 hover:bg-green-600 text-white h-12 sm:h-14 rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-green-500/50 transition-all duration-300 font-montserrat"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar PDF de la Cotización
                </Button>
              </motion.div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
