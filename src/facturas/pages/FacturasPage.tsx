import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

import { lazy, Suspense, useMemo, useState } from 'react';
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
import { getFacturasAction } from '../actions/get-facturas';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router';
import type { Factura } from '../types/Factura.interface';
import { FacturaSearch } from '../ui/FacturaSearch';
import { FacturaFilters } from '../ui/FacturaFilters';

const FacturaRowActions = lazy(() => import('../ui/FacturaRowActions'));

export const FacturasPage = () => {
  const { data: facturas } = useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: getFacturasAction,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const [showFilters, setShowFilters] = useState(false);

  if (!facturas) {
    return <Navigate to="/" />;
  }
  const normalizeEstado = (raw: string) => raw?.toUpperCase?.() ?? '';
  const getEstadoBadgeVariant = (estadoRaw: string) => {
    const estado = normalizeEstado(estadoRaw);
    switch (estado) {
      case 'PAGADA':
        return 'secondary';
      case 'PENDIENTE':
        return 'outline';
      case 'VENCIDA':
        return 'destructive';
      case 'ANULADA':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (iso: any) => {
    if (!iso) return '—';
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-ES');
  };
  const toNumber = (v: any) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  };
  const formatMoney = (v: any) => `$${toNumber(v).toFixed(2)}`;

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
                {rows.map((factura) => {
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
