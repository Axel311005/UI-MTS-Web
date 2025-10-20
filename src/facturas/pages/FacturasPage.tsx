import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from '@/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

import { Filter } from '@/shared/icons';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { FacturaSearch } from '../ui/FacturaSearch';
import { FacturaFilters } from '../ui/FacturaFilters';
import { formatDate, formatMoney } from '@/shared/utils/formatters';
import { useFactura } from '../hooks/useFactura';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { SearchFacturaAction } from '../actions/search-facturas-action';

const FacturaRowActions = lazy(() => import('../ui/FacturaRowActions'));

export const FacturasPage = () => {
  const { facturas } = useFactura();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leer parámetros de búsqueda/filtros desde la URL
  const codigoLike = searchParams.get('codigoLike')?.trim() || '';
  const codigoFactura = searchParams.get('codigo_factura')?.trim() || '';
  const estado = searchParams.get('estado')?.trim() || '';
  const bodegaNombre = searchParams.get('bodegaNombre')?.trim() || '';
  const clienteNombre = searchParams.get('clienteNombre')?.trim() || '';
  const empleadoNombre = searchParams.get('empleadoNombre')?.trim() || '';
  const fechaInicio = searchParams.get('dateFrom')?.trim() || '';
  const fechaFin = searchParams.get('dateTo')?.trim() || '';
  const minTotal = searchParams.get('minTotal')?.trim() || '';
  const maxTotal = searchParams.get('maxTotal')?.trim() || '';

  const hasAnyFilter = useMemo(
    () =>
      [
        codigoLike,
        codigoFactura,
        estado,
        clienteNombre,
        empleadoNombre,
        bodegaNombre,
        fechaInicio,
        fechaFin,
        minTotal,
        maxTotal,
      ].some((v) => v !== undefined && v !== null && String(v).trim() !== ''),
    [
      codigoLike,
      codigoFactura,
      estado,
      clienteNombre,
      empleadoNombre,
      bodegaNombre,
      fechaInicio,
      fechaFin,
      minTotal,
      maxTotal,
    ]
  );

  const { data: facturasFiltradas = [] } = useQuery({
    queryKey: [
      'facturas.search',
      codigoLike,
      codigoFactura,
      estado,
      clienteNombre,
      empleadoNombre,
      bodegaNombre,
      fechaInicio,
      fechaFin,
      minTotal,
      maxTotal,
    ],
    queryFn: () =>
      SearchFacturaAction({
        codigoLike,
        codigo_factura: codigoFactura,
        estado,
        clienteNombre,
        empleadoNombre,
        bodegaNombre,
        dateFrom: fechaInicio,
        dateTo: fechaFin,
        minTotal,
        maxTotal,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const [showFilters, setShowFilters] = useState(false);

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

  const rows = useMemo(() => {
    const data = hasAnyFilter ? facturasFiltradas : facturas;
    return Array.isArray(data) ? data : [];
  }, [hasAnyFilter, facturasFiltradas, facturas]);

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
        <Button
          className="button-hover"
          onClick={() => navigate('/facturas/nueva')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>
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
      {/* Los chips de filtros activos ahora se muestran dentro del panel de filtros */}
      {showFilters && (
        <div className="animate-in fade-in-50 slide-in-from-top-1">
          <FacturaFilters onClose={() => setShowFilters(false)} />
        </div>
      )}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-md border max-h-[480px] relative">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead>Moneda</TableHead>
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
