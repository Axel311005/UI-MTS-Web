import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClienteSelect } from '../ui/ClienteSelect';
import { FacturaParametros } from '../ui/FacturaParametros';
import { FacturaLineaTabla } from '../ui/FacturaLineasTabla';
import { FacturaTotalCard } from '../ui/FacutraTotalCard';
import { FacturaHeader } from '../ui/FacturaHeader';
import { patchFactura } from '../actions/patch-factura';
import { patchFacturaLinea } from '../actions/patch-facturaLinea';
import { getFacturaById } from '../actions/get-factura-by-id';

type InvoiceStatus = 'PENDIENTE' | 'PAGADO' | 'ANULADA';

// Línea de factura para edición
interface EditInvoiceLine {
  id?: number;
  itemId: number | '';
  cantidad: number | '';
  precioUnitario: number | '';
  totalLinea: number; // total mostrado y enviado al backend
}
interface InvoiceFormValues {
  // Header
  consecutivoId: number | '';
  fecha: string;
  empleadoId: number;

  // Cliente
  clienteId: number | '';

  // Params
  monedaId: number | '';
  tipoPagoId: number | '';
  impuestoId: number | '';
  bodegaId: number | '';
  comentario: string;

  // Lines
  lineas: EditInvoiceLine[];

  // Totals
  descuentoPct: number | '';
  tipoCambioUsado: number;
}

export default function EditarFacturaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const facturaId = React.useMemo(() => Number(id), [id]);

  const [formValues, setFormValues] = React.useState<InvoiceFormValues>({
    consecutivoId: '',
    fecha: new Date().toISOString().split('T')[0],
    empleadoId: 1,
    clienteId: '',
    monedaId: '',
    tipoPagoId: '',
    impuestoId: '',
    bodegaId: '',
    comentario: '',
    lineas: [],
    descuentoPct: '',
    tipoCambioUsado: 7000,
  });

  const [estadoFactura, setEstadoFactura] =
    React.useState<InvoiceStatus>('PENDIENTE');

  const [errors] = React.useState<Record<string, string>>({});
  const [lineErrors] = React.useState<
    Array<{
      cantidad?: string;
      precioUnitario?: string;
      item?: string;
    }>
  >([]);
  const [codigoPreview] = React.useState('');

  // Cargar datos reales de la factura
  React.useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID de factura inválido');
        }
        const factura = await getFacturaById(numericId);
        const estadoBackend = (factura.estado as InvoiceStatus) ?? 'PENDIENTE';
        setEstadoFactura(estadoBackend);
        setFormValues({
          consecutivoId: factura.consecutivo?.idConsecutivo ?? '',
          fecha: new Date(factura.fecha).toISOString().split('T')[0],
          empleadoId: 1,
          clienteId: factura.cliente?.idCliente ?? '',
          monedaId: factura.moneda?.idMoneda ?? '',
          tipoPagoId: factura.tipoPago?.idTipoPago ?? '',
          impuestoId: factura.impuesto?.idImpuesto ?? '',
          bodegaId: factura.bodega?.idBodega ?? '',
          comentario: factura.comentario ?? '',
          lineas: (factura.lineas || []).map((l) => ({
            id: (l as any).idFacturaLinea,
            itemId: '' as any, // TODO: mapear itemId si el backend lo expone en la línea
            cantidad: l.cantidad as any,
            precioUnitario: l.precioUnitario as any,
            totalLinea: l.totalLinea as any,
          })),
          descuentoPct: (factura.porcentajeDescuento as any) ?? '',
          tipoCambioUsado: factura.tipoCambioUsado ?? 0,
        });

        toast.success(`Editando factura #${id}`);
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast.error('No se pudo cargar la factura');
        navigate('/facturas');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvoice();
    }
  }, [id, navigate, toast]);

  // Calcular totales
  const totals = React.useMemo(() => {
    const subtotal = formValues.lineas.reduce(
      (sum, line) => sum + (Number(line.totalLinea) || 0),
      0
    );
    const descuentoDecimal =
      typeof formValues.descuentoPct === 'number'
        ? formValues.descuentoPct / 100
        : 0;
    const totalDescuento = subtotal * descuentoDecimal;
    const subtotalConDescuento = subtotal - totalDescuento;

    // Asumiendo que el impuesto se aplica después del descuento
    // Esto depende de tu lógica de negocio
    const impuestoRate = 0.1; // 10% - ajustar según tu lógica
    const totalImpuesto = subtotalConDescuento * impuestoRate;
    const total = subtotalConDescuento + totalImpuesto;

    return {
      subtotal,
      totalDescuento,
      totalImpuesto,
      total,
    };
  }, [formValues.lineas, formValues.descuentoPct]);

  const isFormValid = () => {
    return (
      formValues.consecutivoId !== '' &&
      formValues.clienteId !== '' &&
      formValues.monedaId !== '' &&
      formValues.tipoPagoId !== '' &&
      formValues.impuestoId !== '' &&
      formValues.bodegaId !== '' &&
      formValues.lineas.length > 0
    );
  };

  // Helpers para payloads
  const buildHeaderPayload = React.useCallback(
    () => ({
      clienteId: Number(formValues.clienteId),
      tipoPagoId: Number(formValues.tipoPagoId),
      monedaId: Number(formValues.monedaId),
      impuestoId: Number(formValues.impuestoId),
      bodegaId: Number(formValues.bodegaId),
      consecutivoId: Number(formValues.consecutivoId),
      empleadoId: Number(formValues.empleadoId),
      estado: estadoFactura,
      porcentajeDescuento:
        formValues.descuentoPct === '' ? 0 : Number(formValues.descuentoPct),
      tipoCambioUsado: Number(formValues.tipoCambioUsado),
      comentario: formValues.comentario ?? '',
    }),
    [formValues, estadoFactura]
  );

  const buildLinesPayload = React.useCallback(() => {
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
          id: l.id ? Number(l.id) : undefined,
          facturaId: facturaId,
          itemId: Number(l.itemId),
          cantidad: qty,
          precioUnitario: price,
          totalLinea,
        };
      });
  }, [formValues.lineas, facturaId]);

  const handleSave = async () => {
    if (saving) return;
    if (!isFormValid()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    setSaving(true);
    const dismiss = toast.loading('Guardando cambios de factura...');
    try {
      const payload = buildHeaderPayload();
      const { facturaId: updatedId } = await patchFactura(facturaId, payload);
      // eslint-disable-next-line no-console
      console.log('[EditarFactura] patchFactura ok, facturaId:', updatedId);
      toast.success(`Factura #${id} actualizada`);
      // Opcional: navegar después de guardar
      // navigate("/facturas");
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      const raw = error?.response?.data;
      const msg =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        'No se pudo actualizar la factura';
      toast.error(msg);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/facturas');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Cargando factura...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/facturas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Factura #{id}</h1>
            <p className="text-muted-foreground">
              Modifica los datos de la factura
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          {/* Encabezado de factura */}
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaHeader
                consecutivoId={formValues.consecutivoId}
                onConsecutivoChange={(value) =>
                  setFormValues((prev) => ({ ...prev, consecutivoId: value }))
                }
                codigoPreview={codigoPreview}
                fecha={formValues.fecha}
                onFechaChange={(value) =>
                  setFormValues((prev) => ({ ...prev, fecha: value }))
                }
                estado={estadoFactura}
                onEstadoChange={(value) => setEstadoFactura(value)}
                empleado={{ id: 1, nombre: 'Usuario Actual' }}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
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
                onSelectId={(selected) =>
                  setFormValues((prev) => ({
                    ...prev,
                    clienteId: selected as any,
                  }))
                }
                onClear={() =>
                  setFormValues((prev) => ({ ...prev, clienteId: '' }))
                }
              />
            </CardContent>
          </Card>

          {/* Parámetros */}
          <Card>
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
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Líneas de factura */}
          <Card>
            <CardHeader>
              <CardTitle>Ítems de la factura</CardTitle>
            </CardHeader>
            <CardContent>
              <FacturaLineaTabla
                lines={formValues.lineas}
                onLinesChange={(lines) =>
                  setFormValues((prev) => ({ ...prev, lineas: lines }))
                }
                errors={lineErrors}
              />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Totales */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FacturaTotalCard
              totals={totals}
              descuentoPct={formValues.descuentoPct}
              onDescuentoPctChange={(value) =>
                setFormValues((prev) => ({ ...prev, descuentoPct: value }))
              }
              onSave={handleSave}
              onSaveAndNew={async () => {
                if (saving) return;
                if (!isFormValid()) {
                  toast.error('Datos incompletos para guardar líneas');
                  return;
                }
                if (!Number.isFinite(facturaId) || !facturaId) {
                  toast.error('ID de factura inválido');
                  return;
                }
                setSaving(true);
                const dismiss = toast.loading('Guardando líneas de factura...');
                try {
                  const lines = buildLinesPayload();
                  if (lines.length === 0) {
                    toast.warning('No hay líneas válidas para guardar');
                  } else {
                    await Promise.all(lines.map((p) => patchFacturaLinea(p)));
                    toast.success('Líneas actualizadas');
                  }
                } catch (error: any) {
                  console.error('Error guardando líneas:', error);
                  const raw = error?.response?.data;
                  const msg =
                    raw?.message ||
                    (typeof raw === 'string' ? raw : undefined) ||
                    'No se pudieron actualizar las líneas';
                  toast.error(msg);
                } finally {
                  toast.dismiss(dismiss);
                  setSaving(false);
                }
              }}
              onCancel={handleCancel}
              isValid={isFormValid() && !saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
