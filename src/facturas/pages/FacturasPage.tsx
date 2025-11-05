import { lazy, Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Loader2 } from '@/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/ui/pagination';
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
import type { Factura } from '../types/Factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

const FacturaRowActions = lazy(() => import('../ui/FacturaRowActions'));

export const FacturasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false);
  const [loadedPages, setLoadedPages] = useState(1);
  const loadingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const limit = pageSize;
  const offset = useInfiniteScroll ? 0 : (page - 1) * pageSize;
  const currentLimit = useInfiniteScroll ? loadedPages * pageSize : pageSize;

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

  const { facturas, totalItems: totalFacturas = 0 } = useFactura({
    usePagination: !hasAnyFilter && !useInfiniteScroll,
    limit: useInfiniteScroll ? undefined : limit,
    offset: useInfiniteScroll ? undefined : offset,
  });

  const { data: facturasFiltradasResponse, isLoading: isLoadingSearch } = useQuery<PaginatedResponse<Factura>>({
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
      useInfiniteScroll ? currentLimit : limit,
      offset,
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
        limit: useInfiniteScroll ? currentLimit : limit,
        offset,
      }),
    enabled: hasAnyFilter,
    staleTime: 1000 * 60 * 5,
  });

  const facturasFiltradas = useMemo(() => {
    if (!facturasFiltradasResponse) return [];
    if (Array.isArray(facturasFiltradasResponse)) return facturasFiltradasResponse;
    return facturasFiltradasResponse.data || [];
  }, [facturasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!facturasFiltradasResponse) return 0;
    if (Array.isArray(facturasFiltradasResponse)) return facturasFiltradasResponse.length;
    return facturasFiltradasResponse.total ?? 0;
  }, [facturasFiltradasResponse]);

  // Scroll infinito: cuando se alcanza el final, cargar más
  useEffect(() => {
    if (!useInfiniteScroll || !hasAnyFilter) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          const currentTotal = facturasFiltradas.length;
          const totalAvailable = totalFiltradas;
          
          if (currentTotal < totalAvailable && currentTotal >= loadedPages * pageSize) {
            loadingRef.current = true;
            setLoadedPages((prev) => prev + 1);
          }
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [useInfiniteScroll, hasAnyFilter, facturasFiltradas.length, totalFiltradas, loadedPages, pageSize]);

  useEffect(() => {
    loadingRef.current = false;
  }, [facturasFiltradas.length]);

  // Para scroll infinito sin filtros
  useEffect(() => {
    if (!useInfiniteScroll || hasAnyFilter) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          const currentTotal = facturas.length;
          const totalAvailable = totalFacturas;
          
          if (currentTotal < totalAvailable && currentTotal >= loadedPages * pageSize) {
            loadingRef.current = true;
            setLoadedPages((prev) => prev + 1);
          }
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [useInfiniteScroll, hasAnyFilter, facturas.length, totalFacturas, loadedPages, pageSize]);

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

  const isAnulada = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
  };

  const isEstadoAnulado = (estadoRaw: unknown) =>
    typeof estadoRaw === 'string' && normalizeEstado(estadoRaw) === 'ANULADA';

  const rows = useMemo(() => {
    const data = hasAnyFilter ? facturasFiltradas : facturas;
    if (!Array.isArray(data)) return [];
    const filtered = data.filter(
      (factura) =>
        !isAnulada(factura.anulada) && !isEstadoAnulado(factura.estado)
    );
    
    // Para scroll infinito, limitar a lo cargado
    if (useInfiniteScroll) {
      return filtered.slice(0, loadedPages * pageSize);
    }
    
    return filtered;
  }, [hasAnyFilter, facturasFiltradas, facturas, useInfiniteScroll, loadedPages, pageSize]);

  const totalRows = hasAnyFilter ? totalFiltradas : totalFacturas;
  const totalPages = Math.ceil(totalRows / pageSize);
  const hasMore = useInfiniteScroll ? rows.length < totalRows : false;

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
        <Button
          variant={useInfiniteScroll ? 'default' : 'outline'}
          onClick={() => {
            setUseInfiniteScroll(!useInfiniteScroll);
            setLoadedPages(1);
            setPage(1);
          }}
          className="whitespace-nowrap"
          size="sm"
        >
          {useInfiniteScroll ? 'Modo: Scroll Infinito' : 'Modo: Paginación'}
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
          {!useInfiniteScroll && totalRows > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalRows}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          )}
          {useInfiniteScroll && hasMore && (
            <div ref={observerTarget} className="flex justify-center py-4">
              {isLoadingSearch && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando más facturas...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
