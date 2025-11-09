import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Edit, FileText, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/auth/store/auth.store';
import { getCompraPdfAction } from '../actions/get-compra-pdf';
import { downloadPdf } from '@/facturas/utils/download-pdf';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import { getCompraById } from '../actions/get-compra-by-id';
import type { Compra, CompraLinea } from '../types/Compra.interface';

type CompraLineaDetalle = CompraLinea & {
  item?: {
    idItem?: number;
    codigoItem?: string;
    descripcion?: string;
  };
};

type CompraDetalle = Omit<Compra, 'lineas'> & {
  lineas: CompraLineaDetalle[];
  proveedor?: {
    idProveedor?: number;
    nombre?: string;
    ruc?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
  };
  empleado?: {
    idEmpleado?: number;
    primerNombre?: string;
    primerApellido?: string;
  };
  consecutivo?: {
    idConsecutivo?: number;
    descripcion?: string;
    documento?: string;
    mascara?: string;
    ultimoValor?: string | number;
    longitud?: string | number;
  };
};

const ESTADO_BADGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive'
> = {
  COMPLETADA: 'default',
  PENDIENTE: 'secondary',
  ANULADA: 'destructive',
  CANCELADA: 'destructive',
};

const normalizeEstado = (value?: string) => (value ?? '').trim().toUpperCase();

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const instance = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instance.getTime())) return String(value);
  return instance.toLocaleDateString('es-ES', {
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
  if (!Number.isFinite(numeric)) return String(value);

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

// Nota: se usaba para claves de filas cuando faltaba el id de línea.
// Al alinear con VerDetallesFactura, usamos directamente idCompraLinea como key.

export default function VerDetallesCompraPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const hasPdfAccess = useAuthStore((state) =>
    state.hasAnyRole(['gerente', 'vendedor', 'superuser'])
  );

  useEffect(() => {
    const loadCompra = async () => {
      try {
        setIsLoading(true);
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID de compra inválido');
        }

        const fetched = await getCompraById(numericId);
        setCompra(fetched as CompraDetalle);
      } catch (error) {
        console.error('Error cargando compra:', error);
        toast.error('No se pudo cargar la compra');
        navigate('/admin/compras');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void loadCompra();
    }
  }, [id, navigate]);

  const currencyCode = useMemo(() => {
    const descriptor = compra?.moneda?.descripcion?.toUpperCase?.() ?? '';
    if (descriptor.includes('CORD')) return 'NIO';
    if (descriptor.includes('DOLAR') || descriptor.includes('USD'))
      return 'USD';
    return 'USD';
  }, [compra?.moneda?.descripcion]);

  const fechaAnulacionDisplay = compra?.anulado
    ? formatDate(compra?.fechaAnulacion)
    : null;

  const empleadoNombre = compra?.empleado
    ? `${compra.empleado.primerNombre ?? ''} ${
        compra.empleado.primerApellido ?? ''
      }`.trim()
    : undefined;

  const consecutivoDisplay = useMemo(() => {
    const cons = compra?.consecutivo;
    if (!cons?.mascara) return compra?.codigoCompra ?? '—';
    const longitud = Number(cons.longitud ?? 0);
    const ultimo = Number(cons.ultimoValor ?? 0);
    const padded = String(ultimo).padStart(
      Number.isFinite(longitud) && longitud > 0
        ? longitud
        : String(ultimo).length,
      '0'
    );
    return cons.mascara.replace('{0}', padded);
  }, [compra?.consecutivo, compra?.codigoCompra]);

  const getLineaDescripcion = (linea: CompraLineaDetalle) => {
    return linea.item?.descripcion ?? '—';
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              Cargando detalles de la compra...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            No se encontró la compra solicitada
          </p>
        </div>
      </div>
    );
  }

  const estadoNorm = normalizeEstado(compra.estado);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/compras')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{compra.codigoCompra}</h1>
              <Badge variant={ESTADO_BADGE_VARIANT[estadoNorm] ?? 'secondary'}>
                {estadoNorm || '—'}
              </Badge>
              {compra.anulado && <Badge variant="destructive">ANULADA</Badge>}
            </div>
            <p className="text-muted-foreground">
              Detalles completos de la compra
            </p>
            {compra.anulado && fechaAnulacionDisplay && (
              <p className="text-sm text-muted-foreground">
                Anulada el {fechaAnulacionDisplay}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {hasPdfAccess && (
            <Button
              variant="outline"
              onClick={async () => {
                if (isDownloadingPdf || !id) return;
                setIsDownloadingPdf(true);
                const dismiss = toast.loading('Generando PDF de la compra...');
                try {
                  const blob = await getCompraPdfAction(Number(id));
                  const filename = `compra-${compra?.codigoCompra || `COMP-${id}`}.pdf`;
                  downloadPdf(blob, filename);
                  toast.success('PDF de la compra descargado exitosamente');
                } catch (error: any) {
                  const message =
                    error?.response?.data?.message ||
                    (error instanceof Error
                      ? error.message
                      : 'No se pudo generar el PDF de la compra');
                  toast.error(message);
                } finally {
                  toast.dismiss(dismiss);
                  setIsDownloadingPdf(false);
                }
              }}
              disabled={isDownloadingPdf}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generar PDF
            </Button>
          )}
          <Button onClick={() => navigate(`/admin/compras/${id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{formatDate(compra.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Código interno
                  </p>
                  <p className="font-medium">{consecutivoDisplay}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moneda</p>
                  <p className="font-medium">
                    {compra.moneda?.descripcion ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de cambio
                  </p>
                  <p className="font-medium">{compra.tipoCambioUsado ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de pago</p>
                  <p className="font-medium">
                    {compra.tipoPago?.descripcion ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bodega</p>
                  <p className="font-medium">
                    {compra.bodega?.descripcion ?? '—'}
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
              {compra.comentario && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Comentario
                    </p>
                    <p className="font-medium">{compra.comentario}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {compra.proveedor && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Proveedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">
                      {compra.proveedor.nombre ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RUC</p>
                    <p className="font-medium">{compra.proveedor.ruc ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">
                      {compra.proveedor.telefono ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p className="font-medium">
                      {compra.proveedor.direccion ?? '—'}
                    </p>
                  </div>
                  {compra.proveedor.notas && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="font-medium">{compra.proveedor.notas}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ítems de la Compra</CardTitle>
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
                  {compra.lineas.length > 0 ? (
                    compra.lineas.map((linea) => (
                      <TableRow key={linea.idCompraLinea}>
                        <TableCell className="font-medium">
                          #{linea.idCompraLinea}
                        </TableCell>
                        <TableCell>{getLineaDescripcion(linea)}</TableCell>
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

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(compra.subtotal, currencyCode)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Descuento ({compra.porcentajeDescuento ?? 0}%)
                </span>
                <span className="font-semibold text-destructive">
                  -{formatCurrency(compra.totalDescuento, currencyCode)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {compra.impuesto?.descripcion ?? 'Impuesto'}
                </span>
                <span className="font-semibold">
                  {formatCurrency(compra.totalImpuesto, currencyCode)}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">
                  {formatCurrency(compra.total, currencyCode)}
                </span>
              </div>
            </CardContent>
          </Card>

          {compra.consecutivo && (
            <Card>
              <CardHeader>
                <CardTitle>Información del Consecutivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">
                    {compra.consecutivo.descripcion ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {compra.consecutivo.documento ?? '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Máscara</p>
                  <p className="font-medium font-mono">
                    {compra.consecutivo.mascara ?? '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Último valor
                    </p>
                    <p className="font-medium">
                      {compra.consecutivo.ultimoValor ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitud</p>
                    <p className="font-medium">
                      {compra.consecutivo.longitud ?? '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {compra.impuesto && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Impuesto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{compra.impuesto.descripcion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Porcentaje</p>
                  <p className="font-medium">{compra.impuesto.porcentaje}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant={
                      (compra.impuesto as any).activo === 'ACTIVO'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {(compra.impuesto as any).activo === 'ACTIVO'
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
