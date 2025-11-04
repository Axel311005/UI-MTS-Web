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
import { CompraSearch } from '../ui/CompraSearch';

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

  // Lectura completa de filtros compatibles con backend
  const codigoLike = (searchParams.get('codigoLike') || '').trim();
  const codigo_compra = (searchParams.get('codigo_compra') || '').trim();
  const estado = (searchParams.get('estado') || '').trim();
  const anulado = (searchParams.get('anulado') || '').trim();
  const bodegaNombre = (searchParams.get('bodegaNombre') || '').trim();
  const empleadoNombre = (searchParams.get('empleadoNombre') || '').trim();
  const tipo_pago = (searchParams.get('tipo_pago') || '').trim();
  const moneda = (searchParams.get('moneda') || '').trim();
  const id_bodega = (searchParams.get('id_bodega') || '').trim();
  const id_empleado = (searchParams.get('id_empleado') || '').trim();
  const id_tipo_pago = (searchParams.get('id_tipo_pago') || '').trim();
  const id_moneda = (searchParams.get('id_moneda') || '').trim();
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const minTotal = searchParams.get('minTotal') || '';
  const maxTotal = searchParams.get('maxTotal') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const sortBy = (searchParams.get('sortBy') || 'fecha') as
    | 'fecha'
    | 'total'
    | 'codigo_compra'
    | 'bodega'
    | 'empleado'
    | 'tipo_pago'
    | 'moneda';
  const sortDir = (searchParams.get('sortDir') || 'DESC') as 'ASC' | 'DESC';

  const hasAnyFilter = useMemo(
    () =>
      [
        codigoLike,
        codigo_compra,
        estado,
        anulado,
        bodegaNombre,
        empleadoNombre,
        tipo_pago,
        moneda,
        id_bodega,
        id_empleado,
        id_tipo_pago,
        id_moneda,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
      ].some((v) => (v ?? '').toString().trim() !== ''),
    [
      codigoLike,
      codigo_compra,
      estado,
      anulado,
      bodegaNombre,
      empleadoNombre,
      tipo_pago,
      moneda,
      id_bodega,
      id_empleado,
      id_tipo_pago,
      id_moneda,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
    ]
  );

  const { data: comprasFiltradasApi = [] } = useQuery({
    queryKey: [
      'compras.search',
      codigoLike,
      codigo_compra,
      estado,
      anulado,
      bodegaNombre,
      empleadoNombre,
      tipo_pago,
      moneda,
      id_bodega,
      id_empleado,
      id_tipo_pago,
      id_moneda,
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
        codigo_compra: codigo_compra || undefined,
        codigoLike: codigoLike || undefined,
        estado: estado || undefined,
        anulado: anulado || undefined,
        bodegaNombre: bodegaNombre || undefined,
        empleadoNombre: empleadoNombre || undefined,
        tipo_pago: tipo_pago || undefined,
        moneda: moneda || undefined,
        id_bodega: id_bodega || undefined,
        id_empleado: id_empleado || undefined,
        id_tipo_pago: id_tipo_pago || undefined,
        id_moneda: id_moneda || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        minTotal: minTotal || undefined,
        maxTotal: maxTotal || undefined,
        page,
        limit,
        sortBy,
        sortDir,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const rows = hasAnyFilter ? comprasFiltradasApi : compras;

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
        <CompraSearch className="max-w-sm" placeholder="Buscar por código" />
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
                {rows.map((compra) => (
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
