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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ArrowLeft, Loader2, FileText, Edit, Receipt, ChevronDown } from 'lucide-react';
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
import { useAuthStore } from '@/auth/store/auth.store';

import { getFacturaById } from '../actions/get-factura-by-id';
import { getFacturaReciboPdfAction } from '../actions/get-factura-recibo-pdf';
import { getFacturaPdfAction } from '../actions/get-factura-pdf';
import { downloadPdf } from '../utils/download-pdf';
import { FacturaProformaInfo } from '../ui/FacturaProformaInfo';
import type { Factura, FacturaLinea } from '../types/Factura.interface';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

type FacturaLineaDetalle = FacturaLinea & {
  item?: {
    idItem?: number;
    codigoItem?: string;
    descripcion?: string;
  };
};

type FacturaDetalle = Omit<Factura, 'lineas'> & {
  lineas: FacturaLineaDetalle[];
  empleado?: {
    idEmpleado?: number;
    primerNombre?: string;
    primerApellido?: string;
  };
};

export default function VerDetallesFacturaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState<FacturaDetalle | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const hasPdfAccess = useAuthStore((state) =>
    state.hasAnyRole(['gerente', 'vendedor'])
  );

  useEffect(() => {
    const loadFactura = async () => {
      try {
        setLoading(true);
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID de factura inválido');
        }

        const fetchedFactura = await getFacturaById(numericId);
        setFactura(fetchedFactura as FacturaDetalle);
      } catch (error) {
        toast.error('No se pudo cargar la factura');
        navigate('/admin/facturas');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadFactura();
    }
  }, [id, navigate]);

  const getEstadoBadgeVariant = (estado: string) => {
    const normalized = estado?.toUpperCase?.() ?? '';
    switch (normalized) {
      case 'PAGADO':
        return 'default';
      case 'PENDIENTE':
        return 'secondary';
      case 'VENCIDO':
      case 'ANULADA':
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
              Cargando detalles de la factura...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No se encontró la factura</p>
        </div>
      </div>
    );
  }

  const currencyCode = (() => {
    const descriptor = factura.moneda?.descripcion?.toUpperCase?.() ?? '';
    if (descriptor.includes('CORD')) return 'NIO';
    if (descriptor.includes('DOLAR') || descriptor.includes('USD'))
      return 'USD';
    return 'USD';
  })();

  const consecutivoDisplay = (() => {
    const cons = factura.consecutivo;
    if (!cons?.mascara) return factura.codigoFactura;
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

  const fechaAnulacionDisplay = factura.anulada
    ? formatDate(factura.fechaAnulacion)
    : null;

  const empleadoNombre = factura.empleado
    ? `${factura.empleado.primerNombre ?? ''} ${
        factura.empleado.primerApellido ?? ''
      }`.trim()
    : undefined;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/facturas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{factura.codigoFactura}</h1>
              <Badge variant={getEstadoBadgeVariant(factura.estado)}>
                {factura.estado?.toUpperCase?.()}
              </Badge>
              {factura.anulada && <Badge variant="destructive">ANULADA</Badge>}
            </div>
            <p className="text-muted-foreground">
              Detalles completos de la factura
            </p>
            {factura.anulada && fechaAnulacionDisplay && (
              <p className="text-sm text-muted-foreground">
                Anulada el {fechaAnulacionDisplay}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {hasPdfAccess && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDownloadingPdf}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar PDF
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async () => {
                    if (isDownloadingPdf || !id) return;
                    setIsDownloadingPdf(true);
                    const dismiss = toast.loading('Generando PDF del recibo...');
                    try {
                      const blob = await getFacturaReciboPdfAction(Number(id));
                      const filename = `recibo-${factura.codigoFactura || `FAC-${id}`}.pdf`;
                      downloadPdf(blob, filename);
                      toast.success('PDF del recibo descargado exitosamente');
                    } catch (error: any) {
                      const message =
                        error?.response?.data?.message ||
                        (error instanceof Error ? error.message : 'No se pudo generar el PDF del recibo');
                      toast.error(message);
                    } finally {
                      toast.dismiss(dismiss);
                      setIsDownloadingPdf(false);
                    }
                  }}
                  disabled={isDownloadingPdf}
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  Descargar Recibo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    if (isDownloadingPdf || !id) return;
                    setIsDownloadingPdf(true);
                    const dismiss = toast.loading('Generando PDF de la factura...');
                    try {
                      const blob = await getFacturaPdfAction(Number(id));
                      const filename = `factura-${factura.codigoFactura || `FAC-${id}`}.pdf`;
                      downloadPdf(blob, filename);
                      toast.success('PDF de la factura descargado exitosamente');
                    } catch (error: any) {
                      const message =
                        error?.response?.data?.message ||
                        (error instanceof Error ? error.message : 'No se pudo generar el PDF de la factura');
                      toast.error(message);
                    } finally {
                      toast.dismiss(dismiss);
                      setIsDownloadingPdf(false);
                    }
                  }}
                  disabled={isDownloadingPdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar Factura
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={() => navigate(`/admin/facturas/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Información de Proforma si existe */}
      {(factura?.proforma || (factura as any)?.idProforma || (factura as any)?.proformaId) && (
        <FacturaProformaInfo factura={factura as Factura} />
      )}

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
                  <p className="text-sm text-muted-foreground">
                    Fecha de emisión
                  </p>
                  <p className="font-medium">{formatDate(factura.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consecutivo</p>
                  <p className="font-medium">{consecutivoDisplay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moneda</p>
                  <p className="font-medium">
                    {factura.moneda?.descripcion ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de cambio
                  </p>
                  <p className="font-medium">
                    {factura.tipoCambioUsado ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de pago</p>
                  <p className="font-medium">
                    {factura.tipoPago?.descripcion ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bodega</p>
                  <p className="font-medium">
                    {factura.bodega?.descripcion ?? '—'}
                  </p>
                </div>
                {empleadoNombre && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Atendido por
                    </p>
                    <p className="font-medium">{empleadoNombre}</p>
                  </div>
                )}
              </div>
              {factura.comentario && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Comentario
                    </p>
                    <p className="font-medium">{factura.comentario}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información del cliente */}
          {factura.cliente && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{getClienteNombre(factura.cliente as any)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RUC</p>
                    <p className="font-medium">{factura.cliente.ruc ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{factura.cliente.telefono ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exonerado</p>
                    <p className="font-medium">
                      {factura.cliente.esExonerado
                        ? `Sí (${factura.cliente.porcentajeExonerado ?? '0'}%)`
                        : 'No'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">{factura.cliente.direccion ?? '—'}</p>
                  </div>
                  {factura.cliente.notas && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="font-medium">{factura.cliente.notas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Líneas de factura */}
          <Card>
            <CardHeader>
              <CardTitle>Ítems de la Factura</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Línea</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">
                      Precio Unitario
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factura.lineas.length > 0 ? (
                    factura.lineas.map((linea) => (
                      <TableRow key={linea.idFacturaLinea}>
                        <TableCell className="font-medium">
                          #{linea.idFacturaLinea}
                        </TableCell>
                        <TableCell>{linea.item?.descripcion ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          {linea.cantidad}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(linea.precioUnitario, currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(linea.totalLinea, currencyCode)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No hay líneas registradas.
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
                  {formatCurrency(factura.subtotal, currencyCode)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Descuento ({factura.porcentajeDescuento ?? 0}%)
                </span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(factura.totalDescuento, currencyCode)}
                </span>
              </div>
              <Separator />
              {factura.impuesto && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {factura.impuesto.descripcion ?? 'Impuesto'}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(factura.totalImpuesto, currencyCode)}
                  </span>
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(factura.total, currencyCode)}
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
                  {factura.consecutivo?.descripcion ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-medium">
                  {factura.consecutivo?.documento ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Máscara</p>
                <p className="font-medium font-mono">
                  {factura.consecutivo?.mascara ?? '—'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Último valor</p>
                  <p className="font-medium">
                    {factura.consecutivo?.ultimoValor ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitud</p>
                  <p className="font-medium">
                    {factura.consecutivo?.longitud ?? '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impuesto */}
          {factura.impuesto && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Impuesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{factura.impuesto.descripcion ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Porcentaje</p>
                  <p className="font-medium">{factura.impuesto.porcentaje ?? '—'}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={
                      (factura.impuesto as any).activo === 'ACTIVO'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {(factura.impuesto as any).activo === 'ACTIVO'
                      ? 'Activo'
                      : 'Inactivo'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
