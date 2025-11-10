import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ArrowLeft, Loader2, Edit, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { tallerApi } from '@/shared/api/tallerApi';

import { getCotizacionByIdAction } from '../actions/get-cotizacion-by-id';
import { getDetalleCotizacionByCotizacionIdAction } from '../actions/get-detalle-cotizacion-by-cotizacion-id';
import type { Cotizacion } from '../types/cotizacion.interface';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import type { DetalleCotizacion } from '../types/detalle-cotizacion.interface';

type CotizacionDetalle = Cotizacion & {
  detalles?: DetalleCotizacion[];
};

export default function VerDetallesCotizacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cotizacion, setCotizacion] = useState<CotizacionDetalle | null>(null);

  const numericId = id ? Number(id) : null;
  const isValidId =
    numericId !== null && Number.isFinite(numericId) && numericId > 0;

  // Query para obtener la cotización
  const cotizacionQuery = useQuery({
    queryKey: ['cotizacion', numericId],
    enabled: isValidId,
    queryFn: () => getCotizacionByIdAction(numericId!),
  });

  // Query para obtener los detalles de la cotización
  const detallesQuery = useQuery({
    queryKey: ['detalle-cotizacion', 'by-cotizacion', numericId],
    enabled: isValidId,
    queryFn: () => getDetalleCotizacionByCotizacionIdAction(numericId!),
  });

  useEffect(() => {
    if (cotizacionQuery.isError) {
      toast.error('No se pudo cargar la cotización');
      navigate('/admin/cotizaciones');
      return;
    }

    if (cotizacionQuery.data) {
      setCotizacion({
        ...cotizacionQuery.data,
        detalles: detallesQuery.data || [],
      } as CotizacionDetalle);
      setLoading(false);
    } else if (cotizacionQuery.isLoading || detallesQuery.isLoading) {
      setLoading(true);
    }
  }, [
    cotizacionQuery.data,
    cotizacionQuery.isLoading,
    cotizacionQuery.isError,
    cotizacionQuery.error,
    detallesQuery.data,
    detallesQuery.isLoading,
    navigate,
  ]);

  const getEstadoBadgeVariant = (estado: string) => {
    const normalized = estado?.toUpperCase?.() ?? '';
    switch (normalized) {
      case 'GENERADA':
        return 'default';
      case 'APROBADA':
        return 'default';
      case 'RECHAZADA':
        return 'destructive';
      case 'CANCELADA':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (value?: string | Date | null) => {
    if (!value) return '—';
    const dateValue = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dateValue.getTime())) {
      return String(value);
    }
    return dateValue.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (
    value?: number | string | null,
    currency: string = 'USD'
  ) => {
    if (value === undefined || value === null || value === '') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(0);
    }
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      return `${value}`;
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              Cargando detalles de la cotización...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No se encontró la cotización</p>
        </div>
      </div>
    );
  }

  const currencyCode = 'USD'; // Por defecto USD, ajustar si hay campo de moneda

  const consecutivoDisplay = (() => {
    const cons = cotizacion.consecutivo;
    if (!cons?.mascara) return cotizacion.codigoCotizacion;
    const longitud = Number(cons.longitud ?? 0);
    const ultimo = Number(cons.ultimoValor ?? 0);
    const padded = String(ultimo).padStart(
      Number.isFinite(longitud) && longitud > 0
        ? longitud
        : String(ultimo).length,
      '0'
    );
    return cons.mascara.replace('{0}', padded);
  })();

  // Calcular subtotal de los detalles
  const subtotal =
    cotizacion.detalles?.reduce((sum, detalle) => {
      const total = Number(detalle.totalLineas ?? 0);
      return sum + (Number.isFinite(total) ? total : 0);
    }, 0) ?? 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cotizaciones')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {cotizacion.codigoCotizacion}
              </h1>
              <Badge variant={getEstadoBadgeVariant(cotizacion.estado)}>
                {cotizacion.estado?.toUpperCase?.()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Detalles completos de la cotización
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              if (!numericId) return;
              try {
                const dismiss = toast.loading('Generando PDF...');
                const response = await tallerApi.get(
                  `/cotizacion/${numericId}/cotizacion-pdf`,
                  { responseType: 'blob' }
                );
                const blob = new Blob([response.data], {
                  type: 'application/pdf',
                });
                const urlBlob = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = urlBlob;
                link.download = `cotizacion-${
                  cotizacion?.codigoCotizacion || numericId
                }.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(urlBlob);
                toast.dismiss(dismiss);
                toast.success('PDF generado correctamente');
              } catch (error: any) {
                const message =
                  error?.response?.data?.message || 'Error al generar PDF';
                toast.error(message);
              }
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF
          </Button>
          <Button onClick={() => navigate(`/admin/cotizaciones/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(cotizacion.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consecutivo</p>
                  <p className="font-medium">{consecutivoDisplay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">
                    {cotizacion.nombreCliente ??
                      (cotizacion.cliente
                        ? getClienteNombre(cotizacion.cliente)
                        : '—')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          {cotizacion.cliente && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">
                      {getClienteNombre(cotizacion.cliente)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RUC</p>
                    <p className="font-medium">
                      {cotizacion.cliente.ruc ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">
                      {cotizacion.cliente.telefono ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exonerado</p>
                    <p className="font-medium">
                      {cotizacion.cliente.esExonerado
                        ? `Sí (${
                            cotizacion.cliente.porcentajeExonerado ?? '0'
                          }%)`
                        : 'No'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">
                      {cotizacion.cliente.direccion ?? '—'}
                    </p>
                  </div>
                  {cotizacion.cliente.notas && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="font-medium">{cotizacion.cliente.notas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalles de cotización */}
          <Card>
            <CardHeader>
              <CardTitle>Ítems de la Cotización</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">
                      Precio Unitario
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotizacion.detalles && cotizacion.detalles.length > 0 ? (
                    cotizacion.detalles.map((detalle) => (
                      <TableRow key={detalle.idDetalleCotizacion}>
                        <TableCell>
                          {detalle.item?.descripcion ??
                            detalle.item?.codigoItem ??
                            '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {detalle.cantidad}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(detalle.precioUnitario, currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(detalle.totalLineas, currencyCode)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {detallesQuery.isLoading
                          ? 'Cargando detalles...'
                          : 'No hay detalles registrados.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Totales y detalles adicionales */}
        <div className="lg:col-span-1 space-y-6">
          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(subtotal, currencyCode)}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(cotizacion.total, currencyCode)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Información del consecutivo */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Consecutivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">
                  {cotizacion.consecutivo?.descripcion ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-medium">
                  {cotizacion.consecutivo?.documento ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Máscara</p>
                <p className="font-medium font-mono">
                  {cotizacion.consecutivo?.mascara ?? '—'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Último valor</p>
                  <p className="font-medium">
                    {cotizacion.consecutivo?.ultimoValor ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitud</p>
                  <p className="font-medium">
                    {cotizacion.consecutivo?.longitud ?? '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
