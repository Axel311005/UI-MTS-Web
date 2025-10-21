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

interface InvoiceFormValues {
  consecutivoId: number | '';
  codigoPreview: string;
  fecha: string;
  empleado: { id: number; nombre: string };
  estado: 'PENDIENTE' | 'PAGADO';
  clienteId: number | '';
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

export default function NuevaFacturaPage() {
  const empleado = useAuthStore((s) => s.user?.empleado);
  const empleadoForForm = useMemo(
    () => ({ id: empleado?.id ?? 0, nombre: empleado?.nombreCompleto ?? '' }),
    [empleado]
  );
  const { monedas } = useMoneda();

  // Form state (UI only, no real logic)
  const [formValues, setFormValues] = useState<InvoiceFormValues>({
    consecutivoId: '',
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

  // Prevent double submissions
  const [isSaving, setIsSaving] = useState(false);

  // Check if form is valid (basic UI validation)
  const isFormValid = () => {
    // Enable buttons when headers are complete and at least one item is selected;
    // we'll still validate cantidad/precio > 0 in the save handler via buildLinesPayload.
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
    if (!m) return 0;
    const n = Number(m.tipoCambio);
    return Number.isFinite(n) ? n : 0;
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
    porcentajeDescuento:
      formValues.descuentoPct === '' ? 0 : Number(formValues.descuentoPct),
    tipoCambioUsado: getTipoCambioUsado(),
    comentario: formValues.comentario ?? '',
  });

  const buildLinesPayload = (facturaId: number) =>
    formValues.lineas
      .filter(
        (l) =>
          l.itemId !== '' &&
          l.cantidad !== '' &&
          l.precioUnitario !== '' &&
          Number(l.cantidad) > 0 &&
          Number(l.precioUnitario) > 0
      )
      .map((l) => {
        const m = (monedas ?? []).find(
          (mm) => mm.idMoneda === formValues.monedaId
        );
        const isUSD = (() => {
          if (!m) return false;
          const desc = (m.descripcion || '').toLowerCase();
          return (
            m.idMoneda === 1 ||
            desc.includes('dólar') ||
            desc.includes('dolar') ||
            desc.includes('usd')
          );
        })();
        const qty = Number(l.cantidad);
        const priceRaw = Number(l.precioUnitario);
        const price = isUSD
          ? Number(priceRaw.toFixed(2))
          : Math.round(priceRaw);
        const totalRaw =
          Number(l.totalLinea) && Number(l.totalLinea) > 0
            ? Number(l.totalLinea)
            : qty * price;
        const total = isUSD
          ? Number(totalRaw.toFixed(2))
          : Math.round(totalRaw);
        return {
          facturaId: Number(facturaId),
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea: total,
        };
      });

  // Only preview subtotal locally; backend will compute discounts/taxes/total
  useEffect(() => {
    const subtotal = formValues.lineas.reduce((acc, l) => {
      const qty = Number(l.cantidad) || 0;
      const price = Number(l.precioUnitario) || 0;
      return acc + qty * price;
    }, 0);
    setFormValues((prev) => {
      if (prev.totales.subtotal === subtotal) return prev;
      return {
        ...prev,
        totales: { ...prev.totales, subtotal },
      };
    });
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
      const resp: any = await postFactura(header);
      const facturaId = Number(
        resp?.facturaId ??
          resp?.id_factura ??
          resp?.id ??
          resp?.Id ??
          resp?.data?.idFactura ??
          resp?.data?.id ??
          (Array.isArray(resp) ? resp[0]?.idFactura ?? resp[0]?.id : undefined)
      );

      if (!Number.isFinite(facturaId)) {
        console.error('Respuesta inesperada al crear factura:', resp);
        throw new Error('No se recibió un id de factura válido');
      }

      toast.success('Factura guardada correctamente');
    } catch (err: any) {
      console.error('Error guardando factura:', err);
      const raw = err?.response?.data;
      const msg =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        'No se pudo guardar la factura';
      toast.error(msg);
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
    const dismiss = toast.loading('Guardando líneas de factura...');
    setIsSaving(true);
    try {
      const facturaId = Number(formValues.consecutivoId); // Extraer el ID correcto de la factura creada
      if (!Number.isFinite(facturaId) || facturaId <= 0) {
        console.error('ID de factura inválido:', facturaId);
        throw new Error('No se recibió un id de factura válido');
      }

      // Asegurar que el ID correcto se pase al POST de las líneas
      const linePayloads = buildLinesPayload(facturaId);
      console.log(
        '[NuevaFactura] Enviando líneas con facturaId:',
        facturaId,
        linePayloads
      );

      if (linePayloads.length === 0) {
        toast.warning('No hay líneas válidas para guardar', {
          description:
            'Verifica que cada línea tenga item, cantidad > 0 y precio > 0.',
        });
      } else {
        await Promise.all(linePayloads.map((p) => postFacturaLinea(p)));
        toast.success('Líneas de factura guardadas correctamente');
      }
      // Resetear el formulario para una nueva factura
      setFormValues((prev) => ({
        consecutivoId: '',
        codigoPreview: '',
        fecha: new Date().toISOString().split('T')[0],
        empleado: prev.empleado,
        estado: 'PENDIENTE',
        clienteId: '',
        monedaId: '',
        tipoPagoId: '',
        impuestoId: '',
        bodegaId: '',
        comentario: '',
        descuentoPct: '',
        lineas: [],
        totales: prev.totales,
      }));
    } catch (err: any) {
      console.error('Error guardando líneas de factura:', err);
      const raw = err?.response?.data;
      const msg =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        'No se pudo guardar las líneas de la factura';
      toast.error(msg);
    } finally {
      toast.dismiss(dismiss);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    toast.info('Cancelado', {
      description: 'Operación cancelada.',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nueva Factura</h1>
        <p className="text-muted-foreground">
          Completa los datos para crear una nueva factura
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
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
                codigoPreview={''}
                estado={formValues.estado}
                onEstadoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, estado: value }))
                }
              />
            </CardContent>
          </Card>

          {/* Cliente Section */}
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

          {/* Params Section */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Parámetros de facturación</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaParametros
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
              />
            </CardContent>
          </Card>

          {/* Lines Section */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <FacturaLineaTabla
                lines={formValues.lineas}
                monedaId={formValues.monedaId}
                onLinesChange={(lines) =>
                  setFormValues((prev) => ({ ...prev, lineas: lines }))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Totals Card - Right side (sticky on desktop) */}
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
