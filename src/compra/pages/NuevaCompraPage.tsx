import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { postCompra } from '../actions/post-compra';
import { postCompraLinea } from '../actions/post-compra-linea';
// import { useBodega } from '@/bodega/hook/useBodega';
import { useMoneda } from '@/moneda/hook/useMoneda';
// import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { useAuthStore } from '@/auth/store/auth.store';
import { CompraHeader } from '../ui/CompraHeader';
import { CompraParametros } from '../ui/CompraParametros';
import { CompraLineaTabla } from '../ui/CompraLineaTabla';
import { CompraTotalCard } from '../ui/CompraTotalCard';
import { useQueryClient } from '@tanstack/react-query';

export default function NuevaCompraPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { monedas } = useMoneda();
  const empleado = useAuthStore((s) => s.user?.empleado);

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

  const empleadoForForm = useMemo(() => {
    if (!empleado) return { id: 0, nombre: '' };
    const nombre = empleado.nombreCompleto || 
      [empleado.primerNombre, empleado.primerApellido].filter(Boolean).join(' ') || '';
    return { id: empleado.id ?? 0, nombre };
  }, [empleado]);

  const [formValues, setFormValues] = useState<CompraFormValues>({
    consecutivoId: '',
    codigoPreview: '',
    fecha: new Date().toISOString().split('T')[0],
    empleado: empleadoForForm,
    estado: 'PENDIENTE',
    monedaId: '',
    tipoPagoId: '',
    impuestoId: '',
    bodegaId: '',
    comentario: '',
    descuentoPct: '',
    lineas: [],
    totales: { subtotal: 0, totalDescuento: 0, totalImpuesto: 0, total: 0 },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [compraId, setCompraId] = useState<number | null>(null);

  const currencyNameHint = useMemo(() => {
    const id =
      typeof formValues.monedaId === 'number'
        ? formValues.monedaId
        : Number(formValues.monedaId);
    const found = (monedas ?? []).find((m) => m.idMoneda === id);
    return found?.descripcion ?? '';
  }, [formValues.monedaId, monedas]);

  const getTipoCambioUsado = () => {
    const m = (monedas ?? []).find((mm) => mm.idMoneda === formValues.monedaId);
    return m ? Number(m.tipoCambio) : 0;
  };

  // Recalcular subtotal al cambiar líneas
  useEffect(() => {
    const subtotal = formValues.lineas.reduce((acc, l) => {
      const qty = Number(l.cantidad) || 0;
      const price = Number(l.precioUnitario) || 0;
      return acc + qty * price;
    }, 0);
    setFormValues((prev) => ({
      ...prev,
      totales: {
        ...prev.totales,
        subtotal,
        totalDescuento:
          prev.descuentoPct === ''
            ? 0
            : (subtotal * Number(prev.descuentoPct)) / 100,
      },
    }));
  }, [formValues.lineas, formValues.descuentoPct]);

  // Recalcular totales dependientes de impuesto/descuento
  useEffect(() => {
    const subtotal = formValues.totales.subtotal;
    const descuento = formValues.totales.totalDescuento;
    const impuestoPct = 0; // UI: impuesto real se calculará en backend; aquí no aplicamos fórmula exacta
    const totalImpuesto = (subtotal - descuento) * (impuestoPct / 100);
    const total = subtotal - descuento + totalImpuesto;
    setFormValues((prev) => ({
      ...prev,
      totales: { ...prev.totales, totalImpuesto, total },
    }));
  }, [formValues.totales.subtotal, formValues.totales.totalDescuento]);

  const isFormValid = () => {
    const hasSomeItem = formValues.lineas.some((l) => l.itemId !== '');
    return (
      formValues.consecutivoId !== '' &&
      formValues.fecha !== '' &&
      formValues.monedaId !== '' &&
      formValues.tipoPagoId !== '' &&
      formValues.impuestoId !== '' &&
      formValues.bodegaId !== '' &&
      hasSomeItem
    );
  };

  const buildLinesPayload = () => {
    return formValues.lineas
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
        const price = parseFloat(priceRaw.toFixed(2));
        const totalRaw = l.totalLinea > 0 ? l.totalLinea : qty * price;
        const total = parseFloat(totalRaw.toFixed(2));

        // Debug útil en desarrollo
        console.log('[buildLinesPayload] Línea de compra:', {
          compraId: compraId ?? 0,
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea: total,
        });

        return {
          compraId: compraId ?? 0,
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea: total,
        };
      });
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!isFormValid()) {
      toast.error('Faltan datos obligatorios');
      return;
    }
    const dismiss = toast.loading('Guardando compra...');
    setIsSaving(true);
    try {
      const payload = {
        consecutivoId: Number(formValues.consecutivoId),
        bodegaId: Number(formValues.bodegaId),
        monedaId: Number(formValues.monedaId),
        tipoPagoId: Number(formValues.tipoPagoId),
        impuestoId: Number(formValues.impuestoId),
        empleadoId: Number(empleadoForForm.id),
        estado: formValues.estado,
        porcentajeDescuento: formValues.descuentoPct
          ? Number(formValues.descuentoPct)
          : 0,
        tipoCambioUsado: getTipoCambioUsado(),
        comentario: formValues.comentario ?? '',
      };
      const { compraId: newCompraId } = await postCompra(payload);
      setCompraId(newCompraId);
      toast.success('Compra guardada. Ahora puedes guardar las líneas.');
    } catch (err: any) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (err instanceof Error ? err.message : undefined) ||
        'No se pudo guardar la compra';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSaving(false);
    }
  };

  const handleSaveAndNew = async () => {
    if (isSaving) return;
    if (!isFormValid()) {
      toast.error('Faltan datos obligatorios');
      return;
    }
    if (!compraId) {
      toast.error('Primero guarda la compra para obtener su ID');
      return;
    }
    const dismiss = toast.loading('Guardando líneas de compra...');
    setIsSaving(true);
    try {
      const linesPayload = buildLinesPayload();
      if (linesPayload.length === 0) {
        toast.warning('No hay líneas válidas para guardar');
        return;
      }
      await Promise.all(linesPayload.map((p) => postCompraLinea(p)));
      toast.success('Líneas de compra guardadas correctamente');

      // Refrescar listados de compras inmediatamente
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['compras'], exact: false }),
        queryClient.invalidateQueries({
          queryKey: ['compras.search'],
          exact: false,
        }),
      ]);

      // Reset para una nueva compra (mantiene empleado)
      setFormValues({
        consecutivoId: '',
        codigoPreview: '',
        fecha: new Date().toISOString().split('T')[0],
        empleado: formValues.empleado,
        estado: 'PENDIENTE',
        monedaId: '',
        tipoPagoId: '',
        impuestoId: '',
        bodegaId: '',
        comentario: '',
        descuentoPct: '',
        lineas: [],
        totales: formValues.totales,
      });
      setCompraId(null);
    } catch (err: any) {
      console.error('Error guardando líneas de compra:', err);
      toast.error('No se pudo guardar las líneas de la compra');
    } finally {
      toast.dismiss(dismiss);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/compras');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Compra</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear una nueva compra
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
                codigoPreview={formValues.codigoPreview}
                fecha={formValues.fecha}
                onFechaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, fecha: value }))
                }
                estado={formValues.estado}
                onEstadoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, estado: value }))
                }
                empleado={formValues.empleado}
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
              onSaveAndNew={handleSaveAndNew}
              onCancel={handleCancel}
              isValid={isFormValid() && !isSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
