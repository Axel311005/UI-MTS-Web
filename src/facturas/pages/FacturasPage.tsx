import { lazy, Suspense, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

import { Filter } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Navigate } from 'react-router';
import { FacturaSearch } from '../ui/FacturaSearch';
import { FacturaFilters } from '../ui/FacturaFilters';
import { formatDate, formatMoney } from '@/shared/utils/formatters';
import { useFactura } from '../hooks/useFactura';
import { Skeleton } from '@/shared/components/ui/skeleton';
const FacturaRowActions = lazy(() => import('../ui/FacturaRowActions'));

export const FacturasPage = () => {
  const { facturas, isLoading } = useFactura();

  const [showFilters, setShowFilters] = useState(false);

  if (!facturas) return <Navigate to="/" />;
  const ESTADO_BADGE_VARIANTS: Record<
    string,
    'secondary' | 'outline' | 'destructive' | 'default'
  > = {
    PAGADA: 'secondary',
    PENDIENTE: 'outline',
    VENCIDA: 'destructive',
    ANULADA: 'destructive',
  };

  const normalizeEstado = (raw: string) => raw?.toUpperCase?.() ?? '';

  const getEstadoBadgeVariant = (estadoRaw: string) =>
    ESTADO_BADGE_VARIANTS[normalizeEstado(estadoRaw)] ?? 'default';

  const rows = useMemo(() => facturas ?? [], [facturas]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Facturas
          </h1>
          <p className="text-muted-foreground text-left">
            Gestiona las facturas y documentos de venta
          </p>
        </div>
        <Button className="button-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda reutilizando componente existente */}
          <div className="flex items-center gap-4">
            <FacturaSearch className="max-w-sm" />
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters((s) => !s)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>
          {showFilters && (
            <div className="animate-in fade-in-50 slide-in-from-top-1">
              <FacturaFilters />
            </div>
          )}
          <div className="overflow-auto rounded-md border max-h-[480px]">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Impuesto</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={12} className="p-0">
                        <div className="grid grid-cols-12 gap-2 py-2 px-2">
                          {[...Array(12)].map((_, c) => (
                            <Skeleton key={c} className="h-4 w-full" />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-32 text-center text-sm text-muted-foreground"
                    >
                      No hay facturas todavía
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  rows.map((factura) => {
                    const estadoNorm = normalizeEstado(factura.estado);
                    return (
                      <TableRow
                        key={factura.id_factura}
                        className="table-row-hover"
                      >
                        <TableCell className="font-medium">
                          {factura.codigoFactura}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {factura.cliente?.nombre}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {factura.cliente?.ruc}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(factura.fecha)}</TableCell>
                        <TableCell>
                          {factura.bodega?.descripcion ?? '—'}
                        </TableCell>
                        <TableCell>
                          {factura.moneda?.descripcion ?? '—'}
                        </TableCell>
                        <TableCell>{formatMoney(factura.subtotal)}</TableCell>
                        <TableCell className="text-xs">
                          {factura.porcentajeDescuento}% (
                          {formatMoney(factura.totalDescuento)})
                        </TableCell>
                        <TableCell>
                          {formatMoney(factura.totalImpuesto)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatMoney(factura.total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(estadoNorm)}>
                            {estadoNorm}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {factura.tipoPago?.descripcion ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Suspense
                            fallback={
                              <div className="text-xs text-muted-foreground">
                                …
                              </div>
                            }
                          >
                            <FacturaRowActions factura={factura} />
                          </Suspense>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
