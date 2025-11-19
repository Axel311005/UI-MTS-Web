import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useRecepcion } from '@/recepcion/hook/useRecepcion';
import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { postFacturaFromProformaAction } from '@/facturas/actions/post-factura-from-proforma';
import { useAuthStore } from '@/auth/store/auth.store';
import { getProformaByIdAction } from '@/proforma/actions/get-proforma-by-id';
import { getProformaLineasByProformaIdAction } from '@/proforma/actions/get-proforma-lineas-by-proforma-id';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';
import { BodegaSelect } from '@/shared/components/selects/BodegaSelect';
// Helper local para mostrar nombre del cliente (unifica estructuras posibles)
function getClienteNombre(cliente: any): string {
  if (!cliente) return '—';
  const parts = [cliente?.nombres, cliente?.apellidos, cliente?.razonSocial]
    .filter(Boolean)
    .join(' ');
  return parts || cliente?.nombre || '—';
}

export default function NuevaFacturaFromProformaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Leer proformaId de múltiples fuentes:
  // 1. Desde searchParams (React Router)
  // 2. Desde location.search directamente
  // 3. Desde location.state (si se pasó en la navegación)
  // 4. Desde window.location.search (fallback)
  const proformaIdFromSearch =
    searchParams.get('proformaId') || searchParams.get('proforma_id');

  const proformaIdFromLocation = (() => {
    try {
      const urlParams = new URLSearchParams(location.search);
      return urlParams.get('proformaId') || urlParams.get('proforma_id');
    } catch {
      return null;
    }
  })();

  const proformaIdFromState = (location.state as any)?.proformaId;

  const proformaIdFromWindow = (() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('proformaId') || urlParams.get('proforma_id');
    } catch {
      return null;
    }
  })();

  // Usar el primer valor válido encontrado
  const proformaIdParam =
    proformaIdFromSearch ||
    proformaIdFromLocation ||
    (proformaIdFromState ? String(proformaIdFromState) : null) ||
    proformaIdFromWindow;

  const proformaId = proformaIdParam ? Number(proformaIdParam) : 0;
  const empleadoId = useAuthStore((s) => {
    const id = s.user?.empleado?.id;
    if (!id) {
      throw new Error('No hay empleado en sesión');
    }
    return id;
  });

  // Validar que el proformaId sea válido
  const isValidProformaId = Number.isFinite(proformaId) && proformaId > 0;

  const { recepciones = [] } = useRecepcion();
  const { tipoPagos = [] } = useTipoPago();

  // Obtener datos de la proforma
  const proformaQuery = useQuery({
    queryKey: ['proforma', proformaId],
    enabled: isValidProformaId,
    queryFn: () => getProformaByIdAction(proformaId),
    retry: 2,
    retryDelay: 1000,
  });

  const lineasQuery = useQuery({
    queryKey: ['proforma.lineas', proformaId],
    enabled: isValidProformaId,
    queryFn: () => getProformaLineasByProformaIdAction(proformaId),
    retry: 2,
    retryDelay: 1000,
  });

  const proforma = proformaQuery.data;
  const lineas = lineasQuery.data || [];

  // Formatear fecha
  const fechaFormateada = useMemo(() => {
    if (!proforma?.fecha) return '—';
    const fecha = new Date(proforma.fecha);
    return fecha.toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [proforma?.fecha]);

  // Formatear moneda
  const simboloMoneda = proforma?.moneda?.simbolo || '₲';

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

    // Validar que proformaId esté presente antes de enviar
    if (!proformaId || proformaId <= 0) {
      toast.error(
        'Error: No se encontró el ID de la proforma. Por favor, vuelve a la página de proformas e intenta nuevamente.'
      );
      return;
    }

    // Preparar el payload con validación
    const payload = {
      proformaId,
      recepcionId: values.recepcionId,
      tipoPagoId: values.tipoPagoId,
      bodegaId: values.bodegaId,
      consecutivoId: values.consecutivoId,
      empleadoId,
      comentario: values.comentario || undefined,
      porcentajeDescuento: values.porcentajeDescuento,
    };

    try {
      await postFacturaFromProformaAction(payload);
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

  // Si no hay proformaId válido en la URL
  if (!isValidProformaId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generar Factura desde Proforma</h1>
          <p className="text-destructive mb-2">
            No se proporcionó un ID de proforma válido en la URL
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {proformaIdParam ? (
              <>
                <p>
                  Parámetro recibido:{' '}
                  <code className="bg-muted px-1 rounded">
                    {proformaIdParam}
                  </code>
                </p>
                <p>
                  Valor numérico:{' '}
                  <code className="bg-muted px-1 rounded">{proformaId}</code>
                </p>
                <p className="text-xs mt-2">
                  La URL debe tener el formato:{' '}
                  <code className="bg-muted px-1 rounded">
                    /admin/facturas/from-proforma?proformaId=12
                  </code>
                </p>
              </>
            ) : (
              <p>
                No se encontró el parámetro{' '}
                <code className="bg-muted px-1 rounded">proformaId</code> en la
                URL
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/admin/proformas')}>
            Volver a Proformas
          </Button>
        </div>
      </div>
    );
  }

  if (proformaQuery.isLoading || lineasQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generar Factura desde Proforma</h1>
          <p className="text-muted-foreground">
            Cargando información de la proforma...
          </p>
        </div>
      </div>
    );
  }

  if (proformaQuery.isError || !proforma) {
    const errorMessage =
      proformaQuery.error instanceof Error
        ? proformaQuery.error.message
        : (proformaQuery.error as any)?.response?.data?.message ||
          (proformaQuery.error as any)?.response?.status === 404
        ? 'La proforma no fue encontrada'
        : (proformaQuery.error as any)?.response?.status === 401
        ? 'No autorizado. Por favor, inicia sesión nuevamente'
        : 'No se pudo cargar la información de la proforma';

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Generar Factura desde Proforma</h1>
          <p className="text-destructive mb-2">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">
            ID de Proforma: {proformaId}
          </p>
          {(proformaQuery.error as any)?.response?.status && (
            <p className="text-xs text-muted-foreground mt-1">
              Código de error: {(proformaQuery.error as any).response.status}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/admin/proformas')}>
            Volver a Proformas
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              proformaQuery.refetch();
              lineasQuery.refetch();
            }}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generar Factura desde Proforma</h1>
        <p className="text-muted-foreground">
          Complete los datos para generar la factura
        </p>
      </div>

      {/* Información de la Proforma */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Proforma</CardTitle>
          <CardDescription>
            Revise la información de la proforma antes de generar la factura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Código de Proforma
                </p>
                <p className="font-semibold text-lg">
                  {proforma.codigoProforma || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                <p className="font-medium">{fechaFormateada}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trámite</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {proforma.tramiteSeguro?.numeroTramite || '—'}
                  </p>
                  {proforma.tramiteSeguro?.estado && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        proforma.tramiteSeguro.estado === 'APROBADO'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {proforma.tramiteSeguro.estado
                        .toString()
                        .replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium">
                  {proforma.tramiteSeguro?.cliente
                    ? getClienteNombre(proforma.tramiteSeguro.cliente)
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vehículo</p>
                <p className="font-medium">
                  {proforma.tramiteSeguro?.vehiculo
                    ? `${proforma.tramiteSeguro.vehiculo.placa} - ${proforma.tramiteSeguro.vehiculo.marca} ${proforma.tramiteSeguro.vehiculo.modelo}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Moneda</p>
                <p className="font-medium">
                  {proforma.moneda?.descripcion || '—'} (
                  {proforma.moneda?.simbolo || '—'})
                </p>
              </div>
              {proforma.impuesto && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Impuesto</p>
                  <p className="font-medium">
                    {proforma.impuesto.descripcion} (
                    {proforma.impuesto.porcentaje}%)
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                <p className="font-medium">
                  {simboloMoneda}{' '}
                  {Number(proforma.subtotal || 0).toLocaleString('es-PY')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Impuesto
                </p>
                <p className="font-medium">
                  {simboloMoneda}{' '}
                  {Number(proforma.totalImpuesto || 0).toLocaleString('es-PY')}
                </p>
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Estimado
                </p>
                <p className="font-bold text-xl text-primary">
                  {simboloMoneda}{' '}
                  {Number(proforma.totalEstimado || 0).toLocaleString('es-PY')}
                </p>
              </div>
              {proforma.observaciones && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-muted-foreground mb-1">
                    Observaciones
                  </p>
                  <p className="font-medium text-sm">
                    {proforma.observaciones}
                  </p>
                </div>
              )}
            </div>

            {/* Líneas de la Proforma */}
            {lineas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Líneas de la Proforma
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">
                          Precio Unitario
                        </TableHead>
                        <TableHead className="text-right">
                          Total Línea
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineas.map((linea) => (
                        <TableRow key={linea.idProformaLineas}>
                          <TableCell className="font-medium">
                            {linea.item?.codigoItem || '—'}
                          </TableCell>
                          <TableCell>
                            {linea.item?.descripcion || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(linea.cantidad || 0).toLocaleString(
                              'es-PY'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {simboloMoneda}{' '}
                            {Number(linea.precioUnitario || 0).toLocaleString(
                              'es-PY'
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {simboloMoneda}{' '}
                            {Number(linea.totalLinea || 0).toLocaleString(
                              'es-PY'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulario para generar factura */}
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
