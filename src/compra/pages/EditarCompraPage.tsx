import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';

import { Loader2 } from 'lucide-react';
import { CompraLineaTabla } from '../ui/CompraLineaTabla';
import { CompraHeader } from '../ui/CompraHeader';
import { CompraParametros } from '../ui/CompraParametros';
import { CompraTotalCard } from '../ui/CompraTotalCard';
import { useQueryClient } from '@tanstack/react-query';
import { patchCompra } from '../actions/patch-compra';
import { patchCompraLinea } from '../actions/patch-compra-linea';
import { postCompraLinea } from '../actions/post-compra-linea';
import { deleteCompraLinea } from '../actions/delete-compra-linea';
import { getCompraById } from '../actions/get-compra-by-id';
import { useAuthStore } from '@/auth/store/auth.store';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useImpuesto } from '@/impuesto/hook/useImpuesto';
import { useNavigate } from 'react-router';

interface CompraFormValues {
  consecutivoId: number | '';
  codigoPreview: string;
  fecha: string;
  empleado: { id: number; nombre: string };
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
  monedaId: number | '';
  tipoPagoId: number | '';
  impuestoId: number | '';
  bodegaId: number | '';
  comentario: string;
  descuentoPct: number | '';
  lineas: Array<{
    itemId: number | '';
    cantidad: number | '';
    precioUnitario: number | '';
    totalLinea: number;
  }>;
  totales: {
    subtotal: number;
    totalDescuento: number;
    totalImpuesto: number;
    total: number;
  };
}

export default function EditarCompraPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const empleado = useAuthStore((s) => s.user?.empleado);
  const { monedas } = useMoneda();
  const { impuestos } = useImpuesto();

  // Refrescar datos del servidor solo una vez al montar
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['monedas'] });
    queryClient.invalidateQueries({ queryKey: ['impuestos'] });
    queryClient.invalidateQueries({ queryKey: ['tipoPagos'] });
    queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    queryClient.invalidateQueries({ queryKey: ['consecutivos'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar las IDs originales de las líneas para detectar las eliminadas
  const [originalLineIds, setOriginalLineIds] = useState<number[]>([]);

  const [formValues, setFormValues] = useState<CompraFormValues>({
    consecutivoId: '',
    codigoPreview: '',
    fecha: new Date().toISOString().split('T')[0],
    empleado: empleado
      ? {
          id: empleado.id,
          nombre:
            empleado.nombreCompleto ||
            [empleado.primerNombre, empleado.primerApellido]
              .filter(Boolean)
              .join(' ') ||
            '',
        }
      : { id: 0, nombre: 'Usuario Actual' },
    estado: 'PENDIENTE',
    monedaId: '',
    tipoPagoId: '',
    impuestoId: '',
    bodegaId: '',
    comentario: '',
    descuentoPct: '',
    lineas: [],
    totales: {
      subtotal: 0,
      totalDescuento: 0,
      totalImpuesto: 0,
      total: 0,
    },
  });

  // Load compra data
  useEffect(() => {
    const loadCompra = async () => {
      try {
        setIsLoading(true);
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID de compra inválido');
        }

        const compra = await getCompraById(numericId);

        // Mapear las líneas incluyendo el id para poder hacer PATCH
        const lineasMapeadas = (compra.lineas || []).map((l: any) => ({
          id: l.idCompraLinea || (l as any).id,
          itemId: (l.item?.idItem ?? (l as any).itemId ?? '') as number | '',
          cantidad: l.cantidad as number | '',
          precioUnitario: l.precioUnitario as number | '',
          totalLinea: l.totalLinea as number,
        }));

        // Calcular totales desde los datos de la compra
        const subtotal = Number(compra.subtotal) || 0;
        const porcentajeDescuento = Number(compra.porcentajeDescuento) || 0;
        const totalDescuento = Number(compra.totalDescuento) || 0;
        const totalImpuesto = Number(compra.totalImpuesto) || 0;
        const total = Number(compra.total) || 0;

        setFormValues({
          consecutivoId: (compra as any).consecutivo?.idConsecutivo ?? '',
          codigoPreview: compra.codigoCompra ?? '',
          fecha: compra.fecha
            ? new Date(compra.fecha).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          empleado: empleado
            ? {
                id: empleado.id,
                nombre:
                  empleado.nombreCompleto ||
                  [empleado.primerNombre, empleado.primerApellido]
                    .filter(Boolean)
                    .join(' ') ||
                  '',
              }
            : { id: 0, nombre: 'Usuario Actual' },
          estado:
            (compra.estado as 'PENDIENTE' | 'COMPLETADA' | 'ANULADA') ??
            'PENDIENTE',
          monedaId: compra.moneda?.idMoneda ?? '',
          tipoPagoId: compra.tipoPago?.idTipoPago ?? '',
          impuestoId: compra.impuesto?.idImpuesto ?? '',
          bodegaId: compra.bodega?.idBodega ?? '',
          comentario: compra.comentario ?? '',
          descuentoPct: porcentajeDescuento || '',
          lineas: lineasMapeadas,
          totales: {
            subtotal,
            totalDescuento,
            totalImpuesto,
            total,
          },
        });

        // Guardar las IDs originales de las líneas
        const originalIds = lineasMapeadas
          .map((l) => l.id)
          .filter(
            (id): id is number => id !== undefined && typeof id === 'number'
          );
        setOriginalLineIds(originalIds);

        toast.success(`Editando compra #${id}`);
      } catch (err: any) {
        console.error('Error cargando compra:', err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'No se pudo cargar la compra';
        toast.error(message);
        navigate('/admin/compras');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadCompra();
    }
  }, [id, navigate, empleado]);

  // Calcular totales cuando cambien las líneas o el descuento
  const totals = useMemo(() => {
    const subtotal = formValues.lineas.reduce((sum, line) => {
      const qty = Number(line.cantidad) || 0;
      const price = Number(line.precioUnitario) || 0;
      const lineTotal = qty * price;
      return sum + lineTotal;
    }, 0);

    const descuentoDecimal =
      typeof formValues.descuentoPct === 'number'
        ? formValues.descuentoPct / 100
        : typeof formValues.descuentoPct === 'string' &&
          formValues.descuentoPct !== ''
        ? Number(formValues.descuentoPct) / 100
        : 0;
    const totalDescuento = subtotal * descuentoDecimal;
    const subtotalConDescuento = subtotal - totalDescuento;

    // Obtener el porcentaje de impuesto desde el impuestoId
    const impuestoIdNum =
      typeof formValues.impuestoId === 'number'
        ? formValues.impuestoId
        : Number(formValues.impuestoId);
    const impuesto = (impuestos ?? []).find(
      (i) => i.idImpuesto === impuestoIdNum
    );
    const impuestoRate = impuesto ? Number(impuesto.porcentaje) / 100 : 0;
    const totalImpuesto = subtotalConDescuento * impuestoRate;
    const total = subtotalConDescuento + totalImpuesto;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDescuento: Number(totalDescuento.toFixed(2)),
      totalImpuesto: Number(totalImpuesto.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [
    formValues.lineas,
    formValues.descuentoPct,
    formValues.impuestoId,
    impuestos,
  ]);

  // Actualizar totalLinea de cada línea cuando cambien cantidad o precio unitario
  useEffect(() => {
    setFormValues((prev) => {
      let hasChanges = false;
      const updatedLines = prev.lineas.map((line) => {
        const qty = Number(line.cantidad) || 0;
        const price = Number(line.precioUnitario) || 0;
        const calculatedTotal = qty * price;
        if (Math.abs(line.totalLinea - calculatedTotal) > 0.01) {
          hasChanges = true;
        }
        return {
          ...line,
          totalLinea: calculatedTotal,
        };
      });
      // Solo actualizar si hay cambios para evitar loops infinitos
      if (hasChanges) {
        return {
          ...prev,
          lineas: updatedLines,
        };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues.lineas.map((l) => `${l.cantidad}-${l.precioUnitario}`).join(','),
  ]);

  // Actualizar totales en formValues cuando cambien
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      totals,
    }));
  }, [totals]);

  // Compute currency name hint unconditionally to keep hook order stable
  const currencyNameHint = useMemo(() => {
    const idNum =
      typeof formValues.monedaId === 'number'
        ? formValues.monedaId
        : Number(formValues.monedaId);
    const found = (monedas ?? []).find((m) => m.idMoneda === idNum);
    return found?.descripcion ?? '';
  }, [formValues.monedaId, monedas]);

  const getTipoCambioUsado = () => {
    const idNum =
      typeof formValues.monedaId === 'number'
        ? formValues.monedaId
        : Number(formValues.monedaId);
    const m = (monedas ?? []).find((mm) => mm.idMoneda === idNum);
    return m ? Number(m.tipoCambio) : 0;
  };

  const isFormValid = () => {
    // Permitir guardar incluso sin líneas (para eliminar todas las líneas existentes)
    return (
      formValues.consecutivoId !== '' &&
      formValues.fecha !== '' &&
      formValues.monedaId !== '' &&
      formValues.tipoPagoId !== '' &&
      formValues.impuestoId !== '' &&
      formValues.bodegaId !== ''
    );
  };

  const buildLinesPayload = () => {
    return (formValues.lineas || [])
      .filter(
        (l) =>
          l.itemId !== '' &&
          l.cantidad !== '' &&
          l.precioUnitario !== '' &&
          Number(l.cantidad) > 0 &&
          Number(l.precioUnitario) > 0
      )
      .map((l) => {
        const qty = Number(l.cantidad);
        const priceRaw = Number(l.precioUnitario);
        const price = Number(priceRaw.toFixed(2));
        const totalRaw =
          typeof l.totalLinea === 'number' && l.totalLinea > 0
            ? l.totalLinea
            : qty * price;
        const totalLinea = Number(Number(totalRaw).toFixed(2));
        return {
          id: (l as any).id as number | undefined,
          compraId: Number(id),
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea,
        };
      });
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!isFormValid()) {
      toast.error('Faltan datos obligatorios');
      return;
    }
    const dismiss = toast.loading('Actualizando compra...');
    setIsSaving(true);
    try {
      // 1) Actualizar encabezado de compra
      const headerPayload = {
        consecutivoId: Number(formValues.consecutivoId),
        bodegaId: Number(formValues.bodegaId),
        monedaId: Number(formValues.monedaId),
        tipoPagoId: Number(formValues.tipoPagoId),
        impuestoId: Number(formValues.impuestoId),
        empleadoId: Number(empleado?.id ?? 0),
        estado: formValues.estado,
        porcentajeDescuento:
          formValues.descuentoPct === '' ? 0 : Number(formValues.descuentoPct),
        tipoCambioUsado: getTipoCambioUsado(),
        comentario: formValues.comentario ?? '',
      };
      await patchCompra(Number(id), headerPayload);

      // 2) Detectar líneas eliminadas, crear nuevas y actualizar existentes
      const lines = buildLinesPayload();
      const currentLineIds = lines
        .map((l) => l.id)
        .filter(
          (id): id is number => id !== undefined && typeof id === 'number'
        );

      // Líneas que estaban originalmente pero ya no están (eliminadas)
      const deletedLineIds = originalLineIds.filter(
        (originalId) => !currentLineIds.includes(originalId)
      );

      const createPromises: Promise<any>[] = [];
      const updatePromises: Promise<any>[] = [];
      const deletePromises: Promise<any>[] = [];

      // Eliminar líneas que ya no están
      for (const deletedId of deletedLineIds) {
        deletePromises.push(deleteCompraLinea(deletedId));
      }

      // Crear/actualizar líneas
      for (const line of lines) {
        if (line.id) {
          updatePromises.push(
            patchCompraLinea(Number(line.id), {
              compraId: line.compraId,
              itemId: line.itemId,
              cantidad: line.cantidad,
              precioUnitario: line.precioUnitario,
              totalLinea: line.totalLinea,
            })
          );
        } else {
          createPromises.push(
            postCompraLinea({
              compraId: line.compraId,
              itemId: line.itemId,
              cantidad: line.cantidad,
              precioUnitario: line.precioUnitario,
              totalLinea: line.totalLinea,
            })
          );
        }
      }

      // Ejecutar todas las operaciones
      if (deletePromises.length) await Promise.all(deletePromises);
      if (updatePromises.length) await Promise.all(updatePromises);

      // Capturar los IDs de las nuevas líneas creadas
      const createdResults =
        createPromises.length > 0 ? await Promise.all(createPromises) : [];
      const newLineIds = createdResults.map((result) => result.compraLineaId);

      // Actualizar las IDs originales después de guardar (incluyendo las nuevas)
      const existingIds = lines
        .map((l) => l.id)
        .filter(
          (id): id is number => id !== undefined && typeof id === 'number'
        );
      setOriginalLineIds([...existingIds, ...newLineIds]);

      toast.success('Compra actualizada correctamente');

      // Invalidate compras caches so lists refresh immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['compras'], exact: false }),
        queryClient.invalidateQueries({
          queryKey: ['compras.search'],
          exact: false,
        }),
      ]);
    } catch (err: any) {
      console.error('Error actualizando compra:', err);
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (err instanceof Error ? err.message : undefined) ||
        'No se pudo actualizar la compra';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    toast.info('Cancelado', { description: 'Operación cancelada.' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Compra</h1>
        <p className="text-muted-foreground">
          Modifica los datos de la compra {formValues.codigoPreview}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <CompraHeader
                consecutivoId={formValues.consecutivoId}
                onConsecutivoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, consecutivoId: value }))
                }
                fecha={formValues.fecha}
                onFechaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, fecha: value }))
                }
                empleado={formValues.empleado}
                estado={formValues.estado}
                onEstadoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, estado: value }))
                }
                codigoPreview={formValues.codigoPreview}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Parámetros de compra</CardTitle>
            </CardHeader>
            <CardContent>
              <CompraParametros
                monedaId={formValues.monedaId}
                onMonedaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, monedaId: value }))
                }
                tipoPagoId={formValues.tipoPagoId}
                onTipoPagoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, tipoPagoId: value }))
                }
                impuestoId={formValues.impuestoId}
                onImpuestoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, impuestoId: value }))
                }
                bodegaId={formValues.bodegaId}
                onBodegaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, bodegaId: value }))
                }
                comentario={formValues.comentario}
                onComentarioChange={(value) =>
                  setFormValues((prev) => ({ ...prev, comentario: value }))
                }
                descuentoPct={formValues.descuentoPct}
                onDescuentoPctChange={(value) =>
                  setFormValues((prev) => ({ ...prev, descuentoPct: value }))
                }
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <CompraLineaTabla
                lines={formValues.lineas}
                monedaId={formValues.monedaId}
                bodegaId={formValues.bodegaId}
                currencyNameHint={currencyNameHint}
                onLinesChange={(lines) =>
                  setFormValues((prev) => ({ ...prev, lineas: lines }))
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CompraTotalCard
              totals={formValues.totales}
              descuentoPct={formValues.descuentoPct}
              onDescuentoPctChange={(value) =>
                setFormValues((prev) => ({ ...prev, descuentoPct: value }))
              }
              onSave={handleSave}
              onCancel={handleCancel}
              isValid={isFormValid() && !isSaving}
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
