import { lazy, Suspense, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Filter } from '@/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';

import { CompraFilters } from '../ui/CompraFilters';
import { useCompra } from '../hooks/useCompra';
import { formatDate, formatMoney } from '@/shared/utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { SearchComprasAction } from '../actions/search-compras-action';

const CompraRowActions = lazy(() => import('../ui/CompraRowActions'));

export function ComprasPage() {
  const [showFilters, setShowFilters] = useState(false);
  const { compras } = useCompra();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const estado = (searchParams.get('estado') || '').trim().toLowerCase();
  const anulado = (searchParams.get('anulado') || '').trim();
  // filtros removidos del backend: bodegaNombre, moneda, tipo_pago
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const minTotal = searchParams.get('minTotal');
  const maxTotal = searchParams.get('maxTotal');
  const page = Number(searchParams.get('page') || '1');
  const limit = Number(searchParams.get('limit') || '10');
  const sortBy = (searchParams.get('sortBy') || 'FECHA') as 'FECHA' | 'TOTAL';
  const sortDir = (searchParams.get('sortDir') || 'DESC') as 'ASC' | 'DESC';

  const hasAnyFilter = useMemo(
    () =>
      [estado, anulado, dateFrom, dateTo, minTotal, maxTotal].some(
        (v) => (v ?? '').toString().trim() !== ''
      ),
    [estado, anulado, dateFrom, dateTo, minTotal, maxTotal]
  );

  const { data: comprasFiltradasApi = [] } = useQuery({
    queryKey: [
      'compras.search',
      estado,
      anulado,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      page,
      limit,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      SearchComprasAction({
        estado: estado || undefined,
        anulado: anulado ? anulado === 'true' : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal ? Number(minTotal) : undefined,
        maxTotal: maxTotal ? Number(maxTotal) : undefined,
        page,
        limit,
        sortBy,
        sortDir,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const rows = hasAnyFilter ? comprasFiltradasApi : compras;

  // Filtro simple local, solo por código de compra
  const comprasFiltradas = rows.filter((c) =>
    c.codigoCompra.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Compras
          </h1>
          <p className="text-muted-foreground">
            Gestiona las compras y órdenes de compra
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => navigate('/compras/nueva')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Compra
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <CustomSearchControl
          className="max-w-sm"
          placeholder="Buscar compra..."
          value={search}
          onKeyDown={setSearch}
        />
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
          <CompraFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Compras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-md border max-h-[480px] relative">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
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
                {comprasFiltradas.map((compra) => (
                  <TableRow key={compra.idCompra} className="table-row-hover">
                    <TableCell className="font-medium">
                      {compra.codigoCompra}
                    </TableCell>
                    <TableCell>{formatDate(compra.fecha)}</TableCell>
                    <TableCell>{compra.bodega?.descripcion ?? '—'}</TableCell>
                    <TableCell>{compra.moneda?.descripcion ?? '—'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatMoney(compra.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (compra.estado ?? '').toString().toUpperCase() ===
                          'COMPLETADA'
                            ? 'default'
                            : (compra.estado ?? '').toString().toUpperCase() ===
                              'ANULADA'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {compra.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{compra.tipoPago?.descripcion ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Suspense
                        fallback={
                          <div className="text-xs text-muted-foreground">…</div>
                        }
                      >
                        <CompraRowActions compra={compra} />
                      </Suspense>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
