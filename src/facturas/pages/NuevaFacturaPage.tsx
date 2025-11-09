import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import { ClienteSelect } from '../ui/ClienteSelect';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FacturaHeader } from '../ui/FacturaHeader';
import { FacturaParametros } from '../ui/FacturaParametros';
import { FacturaLineaTabla } from '../ui/FacturaLineasTabla';
import { FacturaTotalCard } from '../ui/FacutraTotalCard';
import { useAuthStore } from '@/auth/store/auth.store';
import { postFactura } from '../actions/post-factura';
import { postFacturaLinea } from '../actions/post-facturalinea';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useQueryClient } from '@tanstack/react-query';

interface InvoiceFormValues {
  consecutivoId: number | '';
  codigoPreview: string;
  fecha: string;
  empleado: { id: number; nombre: string };
  estado: 'PENDIENTE' | 'PAGADO';
  clienteId: number | '';
  monedaId: number | '';
  monedaNombre?: string;
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

export default function NuevaFacturaPage() {
  const queryClient = useQueryClient();
  const empleado = useAuthStore((s) => s.user?.empleado);
  const empleadoForForm = useMemo(() => {
    if (!empleado) return { id: 0, nombre: '' };
    const nombre = empleado.nombreCompleto || 
      [empleado.primerNombre, empleado.primerApellido].filter(Boolean).join(' ') || '';
    return { id: empleado.id ?? 0, nombre };
  }, [empleado]);
  const { monedas } = useMoneda();

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

  // Form state (UI only, no real logic)
  const [formValues, setFormValues] = useState<InvoiceFormValues>({
    consecutivoId: '',
    monedaNombre: '',
    codigoPreview: '',
    fecha: new Date().toISOString().split('T')[0],
    empleado: empleadoForForm,
    estado: 'PENDIENTE',
    clienteId: '',
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

  const [isSaving, setIsSaving] = useState(false);
  const [facturaId, setFacturaId] = useState<number | null>(null); // Store facturaId

  // Check if form is valid (basic UI validation)
  const isFormValid = () => {
    const hasSomeItem = formValues.lineas.some((l) => l.itemId !== '');
    return (
      formValues.consecutivoId !== '' &&
      formValues.fecha !== '' &&
      formValues.clienteId !== '' &&
      formValues.monedaId !== '' &&
      formValues.tipoPagoId !== '' &&
      formValues.impuestoId !== '' &&
      formValues.bodegaId !== '' &&
      hasSomeItem
    );
  };

  // Helpers
  const getTipoCambioUsado = () => {
    const m = (monedas ?? []).find((mm) => mm.idMoneda === formValues.monedaId);
    return m ? Number(m.tipoCambio) : 0;
  };

  const buildHeaderPayload = () => ({
    clienteId: Number(formValues.clienteId),
    tipoPagoId: Number(formValues.tipoPagoId),
    monedaId: Number(formValues.monedaId),
    impuestoId: Number(formValues.impuestoId),
    bodegaId: Number(formValues.bodegaId),
    consecutivoId: Number(formValues.consecutivoId),
    empleadoId: Number(empleadoForForm.id),
    estado: formValues.estado,
    porcentajeDescuento: formValues.descuentoPct
      ? Number(formValues.descuentoPct)
      : 0,
    tipoCambioUsado: getTipoCambioUsado(),
    comentario: formValues.comentario ?? '',
  });

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
        // Asegúrate de convertir todo a número antes de enviarlo
        const qty = Number(l.cantidad);
        const priceRaw = Number(l.precioUnitario); // Asegúrate de que esto sea un número
        const price = parseFloat(priceRaw.toFixed(2)); // Asegúrate de que esto sea un número
        const totalRaw = l.totalLinea > 0 ? l.totalLinea : qty * price;
        const total = parseFloat(totalRaw.toFixed(2)); // Asegúrate de que esto sea un número

        // Verifica en la consola antes de enviar
        console.log('[buildLinesPayload] Línea de factura:', {
          facturaId: facturaId ?? 0,
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea: total,
        });

        return {
          facturaId: facturaId ?? 0,
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea: total,
        };
      });
  };

  // Only preview subtotal locally
  useEffect(() => {
    const subtotal = formValues.lineas.reduce((acc, l) => {
      const qty = Number(l.cantidad) || 0;
      const price = Number(l.precioUnitario) || 0;
      return acc + qty * price;
    }, 0);
    setFormValues((prev) => ({
      ...prev,
      totales: { ...prev.totales, subtotal },
    }));
  }, [formValues.lineas]);

  // Handlers
  const handleSave = async () => {
    if (isSaving) return;
    if (!isFormValid()) {
      toast.error('Faltan datos obligatorios');
      return;
    }
    const dismiss = toast.loading('Guardando factura...');
    setIsSaving(true);
    try {
      const header = buildHeaderPayload();
      const resp = await postFactura(header);
      const newFacturaId = resp?.facturaId;
      setFacturaId(newFacturaId); // Set facturaId after invoice is created

      if (!newFacturaId) {
        console.error('Respuesta inesperada al crear factura:', resp);
        throw new Error('No se recibió un id de factura válido');
      }

      toast.success('Factura guardada correctamente');
    } catch (err: any) {
      console.error('Error guardando factura:', err);
      toast.error('No se pudo guardar la factura');
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
    if (!facturaId) {
      toast.error('Primero guarda la factura para obtener su ID');
      return;
    }
    const dismiss = toast.loading('Guardando líneas de factura...');
    setIsSaving(true);
    try {
      const linesPayload = buildLinesPayload();
      if (linesPayload.length === 0) {
        toast.warning('No hay líneas válidas para guardar');
        return;
      }
      await Promise.all(linesPayload.map((p) => postFacturaLinea(p)));
      toast.success('Líneas de factura guardadas correctamente');

      // Refrescar listados de facturas inmediatamente
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['facturas'], exact: false }),
        queryClient.invalidateQueries({
          queryKey: ['facturas.search'],
          exact: false,
        }),
      ]);

      // Reset form for a new invoice
      setFormValues({
        consecutivoId: '',
        codigoPreview: '',
        fecha: new Date().toISOString().split('T')[0],
        empleado: formValues.empleado,
        estado: 'PENDIENTE',
        clienteId: '',
        monedaId: '',
        tipoPagoId: '',
        impuestoId: '',
        bodegaId: '',
        comentario: '',
        descuentoPct: '',
        lineas: [],
        totales: formValues.totales,
      });
    } catch (err: any) {
      console.error('Error guardando líneas de factura:', err);
      toast.error('No se pudo guardar las líneas de la factura');
    } finally {
      toast.dismiss(dismiss);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    toast.info('Cancelado', { description: 'Operación cancelada.' });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear una nueva factura
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaHeader
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
                codigoPreview={''}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ClienteSelect
                selectedId={
                  formValues.clienteId === ''
                    ? ''
                    : Number(formValues.clienteId)
                }
                onSelectId={(id) =>
                  setFormValues((prev) => ({ ...prev, clienteId: id }))
                }
                onClear={() =>
                  setFormValues((prev) => ({ ...prev, clienteId: '' }))
                }
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Parámetros de facturación</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaParametros
                monedaId={formValues.monedaId}
                onMonedaChange={(value) => {
                  const found = (monedas ?? []).find(
                    (m) => m.idMoneda === Number(value)
                  );
                  setFormValues((prev) => ({
                    ...prev,
                    monedaId: value,
                    monedaNombre: found?.descripcion ?? prev.monedaNombre ?? '',
                  }));
                }}
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
              <FacturaLineaTabla
                lines={formValues.lineas}
                monedaId={formValues.monedaId}
                currencyNameHint={formValues.monedaNombre}
                bodegaId={formValues.bodegaId}
                onLinesChange={(lines) =>
                  setFormValues((prev) => ({ ...prev, lineas: lines }))
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FacturaTotalCard
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
