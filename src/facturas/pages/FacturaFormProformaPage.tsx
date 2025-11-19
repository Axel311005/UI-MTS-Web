import { useNavigate, useSearchParams } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useRecepcion } from '@/recepcion/hook/useRecepcion';
import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { postFacturaFromProformaAction } from '@/facturas/actions/post-factura-from-proforma';
import { useAuthStore } from '@/auth/store/auth.store';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';
import { BodegaSelect } from '@/shared/components/selects/BodegaSelect';

export default function NuevaFacturaFromProformaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proformaId = Number(searchParams.get('proformaId') || 0);
  const empleadoId = useAuthStore((s) => {
    const id = s.user?.empleado?.id;
    if (!id) {
      throw new Error('No hay empleado en sesión');
    }
    return id;
  });

  const { recepciones = [] } = useRecepcion();
  const { tipoPagos = [] } = useTipoPago();

  const [values, setValues] = useState({
    recepcionId: 0,
    tipoPagoId: 0,
    bodegaId: 0,
    consecutivoId: 0,
    comentario: '',
    porcentajeDescuento: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<typeof values>) =>
    setValues((v) => ({ ...v, ...patch }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!proformaId) e.proformaId = 'Proforma requerida';
    if (!values.recepcionId) e.recepcionId = 'Recepción requerida';
    if (!values.tipoPagoId) e.tipoPagoId = 'Tipo de pago requerido';
    if (!values.bodegaId) e.bodegaId = 'Bodega requerida';
    if (!values.consecutivoId) e.consecutivoId = 'Consecutivo requerido';
    if (values.porcentajeDescuento < 0 || values.porcentajeDescuento > 100) {
      e.porcentajeDescuento = 'El descuento debe estar entre 0 y 100';
    }
    if (!empleadoId) e.empleadoId = 'No hay empleado en sesión';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      await postFacturaFromProformaAction({
        proformaId,
        recepcionId: values.recepcionId,
        tipoPagoId: values.tipoPagoId,
        bodegaId: values.bodegaId,
        consecutivoId: values.consecutivoId,
        empleadoId,
        comentario: values.comentario || undefined,
        porcentajeDescuento: values.porcentajeDescuento,
      });
      toast.success('Factura generada desde proforma');
      navigate('/admin/facturas');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo generar la factura');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generar Factura desde Proforma</h1>
        <p className="text-muted-foreground">
          Complete los datos para generar la factura
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos para Generar Factura</CardTitle>
          <CardDescription>
            Complete los datos necesarios para generar la factura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Recepción</Label>
                <Select
                  value={values.recepcionId ? String(values.recepcionId) : ''}
                  onValueChange={(v) => update({ recepcionId: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una recepción" />
                  </SelectTrigger>
                  <SelectContent>
                    {(recepciones || []).map((r) => (
                      <SelectItem
                        key={r.idRecepcion}
                        value={String(r.idRecepcion)}
                      >
                        {r.codigoRecepcion} — {r.vehiculo?.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recepcionId && (
                  <p className="text-sm text-destructive">
                    {errors.recepcionId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Pago</Label>
                <Select
                  value={values.tipoPagoId ? String(values.tipoPagoId) : ''}
                  onValueChange={(v) => update({ tipoPagoId: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tipo de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tipoPagos || []).map((t) => (
                      <SelectItem
                        key={t.idTipoPago}
                        value={String(t.idTipoPago)}
                      >
                        {t.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoPagoId && (
                  <p className="text-sm text-destructive">
                    {errors.tipoPagoId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bodega</Label>
                <BodegaSelect
                  selectedId={values.bodegaId || ''}
                  onSelectId={(id) => update({ bodegaId: id })}
                  onClear={() => update({ bodegaId: 0 })}
                  error={errors.bodegaId}
                />
              </div>

              <div className="space-y-2">
                <Label>Consecutivo</Label>
                <ConsecutivoSelect
                  tipo="FACTURA"
                  selectedId={values.consecutivoId || ''}
                  onSelectId={(id) => update({ consecutivoId: id })}
                  onClear={() => update({ consecutivoId: 0 })}
                  error={errors.consecutivoId}
                />
              </div>

              <div className="space-y-2">
                <Label>Porcentaje de Descuento (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={values.porcentajeDescuento}
                  onChange={(e) =>
                    update({ porcentajeDescuento: Number(e.target.value) || 0 })
                  }
                />
                {errors.porcentajeDescuento && (
                  <p className="text-sm text-destructive">
                    {errors.porcentajeDescuento}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comentario</Label>
              <Textarea
                placeholder="Factura generada a partir de proforma aprobada"
                value={values.comentario}
                onChange={(e) => update({ comentario: e.target.value })}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/proformas')}
              >
                Cancelar
              </Button>
              <Button type="submit">Generar Factura</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
