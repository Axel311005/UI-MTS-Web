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
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import type { PaginatedResponse } from '@/shared/types/pagination';

const FacturaRowActions = lazy(() => import('../ui/FacturaRowActions'));

export const FacturasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

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
  // Leer IDs desde sessionStorage (no se muestran en URL)
  // Usar un estado que se actualice cuando cambien los searchParams (para forzar re-render)
  const [clienteId, setClienteId] = useState(() => {
    const stored = sessionStorage.getItem('factura_filters_clienteId');
    return stored ? stored : '';
  });
  const [empleadoId, setEmpleadoId] = useState(() => {
    const stored = sessionStorage.getItem('factura_filters_empleadoId');
    return stored ? stored : '';
  });
  const [monedaId, setMonedaId] = useState(() => {
    const stored = sessionStorage.getItem('factura_filters_monedaId');
    return stored ? stored : '';
  });
  const [tipoPagoId, setTipoPagoId] = useState(() => {
    const stored = sessionStorage.getItem('factura_filters_tipoPagoId');
    return stored ? stored : '';
  });

  // Sincronizar con sessionStorage cuando cambien los searchParams (para detectar cambios desde FacturaFilters)
  useEffect(() => {
    const storedClienteId = sessionStorage.getItem('factura_filters_clienteId');
    const storedEmpleadoId = sessionStorage.getItem('factura_filters_empleadoId');
    const storedMonedaId = sessionStorage.getItem('factura_filters_monedaId');
    const storedTipoPagoId = sessionStorage.getItem('factura_filters_tipoPagoId');
    if (storedClienteId !== clienteId) {
      setClienteId(storedClienteId || '');
    }
    if (storedEmpleadoId !== empleadoId) {
      setEmpleadoId(storedEmpleadoId || '');
    }
    if (storedMonedaId !== monedaId) {
      setMonedaId(storedMonedaId || '');
    }
    if (storedTipoPagoId !== tipoPagoId) {
      setTipoPagoId(storedTipoPagoId || '');
    }
    // Limpiar el parámetro _refresh si existe (no debe mostrarse en la URL)
    if (searchParams.has('_refresh')) {
      const sp = new URLSearchParams(searchParams);
      sp.delete('_refresh');
      setSearchParams(sp, { replace: true });
    }
  }, [searchParams, clienteId, empleadoId, monedaId, tipoPagoId, setSearchParams]);
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
        clienteId,
        empleadoId,
        monedaId,
        tipoPagoId,
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
      clienteId,
      empleadoId,
      monedaId,
      tipoPagoId,
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

  const { data: facturasFiltradasResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Factura>>({
      queryKey: [
        'facturas.search',
        codigoLike,
        codigoFactura,
        estado,
        clienteId,
        empleadoId,
        monedaId,
        tipoPagoId,
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
          clienteId,
          empleadoId,
          monedaId,
          tipoPagoId,
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
    if (Array.isArray(facturasFiltradasResponse))
      return facturasFiltradasResponse;
    return facturasFiltradasResponse.data || [];
  }, [facturasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!facturasFiltradasResponse) return 0;
    if (Array.isArray(facturasFiltradasResponse))
      return facturasFiltradasResponse.length;
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

          if (
            currentTotal < totalAvailable &&
            currentTotal >= loadedPages * pageSize
          ) {
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
  }, [
    useInfiniteScroll,
    hasAnyFilter,
    facturasFiltradas.length,
    totalFiltradas,
    loadedPages,
    pageSize,
  ]);

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

          if (
            currentTotal < totalAvailable &&
            currentTotal >= loadedPages * pageSize
          ) {
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
  }, [
    useInfiniteScroll,
    hasAnyFilter,
    facturas.length,
    totalFacturas,
    loadedPages,
    pageSize,
  ]);

  const [showFilters, setShowFilters] = useState(false);

  const ESTADO_BADGE_VARIANTS: Record<
    string,
    'secondary' | 'outline' | 'destructive' | 'default'
  > = {
    PAGADO: 'secondary',
    PENDIENTE: 'outline',
    ANULADA: 'destructive',
  };

  const normalizeEstado = (raw: string) => raw?.toUpperCase?.() ?? '';

  const getEstadoBadgeVariant = (estadoRaw: string) =>
    ESTADO_BADGE_VARIANTS[normalizeEstado(estadoRaw)] ?? 'default';

  const rows = useMemo(() => {
    const data = hasAnyFilter ? facturasFiltradas : facturas;
    if (!Array.isArray(data)) return [];

    // Las facturas ya vienen filtradas del action (sin anuladas)
    // Solo aplicar el slice para scroll infinito si es necesario
    if (useInfiniteScroll) {
      return data.slice(0, loadedPages * pageSize);
    }

    return data;
  }, [
    hasAnyFilter,
    facturasFiltradas,
    facturas,
    useInfiniteScroll,
    loadedPages,
    pageSize,
  ]);

  const totalRows = hasAnyFilter ? totalFiltradas : totalFacturas;
  const totalPages = totalRows > 0 ? Math.ceil(totalRows / pageSize) : 1;
  const hasMore = useInfiniteScroll ? rows.length < totalRows : false;

  // Sincronizar página con URL cuando cambian los datos
  useEffect(() => {
    if (useInfiniteScroll) return;
    if (totalRows === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        setSearchParams(params, { replace: true });
      }
      return;
    }

    const computedTotalPages = Math.ceil(totalRows / pageSize);
    if (page > computedTotalPages) {
      const lastPage = Math.max(1, computedTotalPages);
      const params = new URLSearchParams(searchParams);
      if (lastPage > 1) {
        params.set('page', lastPage.toString());
      } else {
        params.delete('page');
      }
      setSearchParams(params, { replace: true });
    }
  }, [
    totalRows,
    page,
    pageSize,
    searchParams,
    setSearchParams,
    useInfiniteScroll,
  ]);

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
            // Reset a página 1 en la URL
            const params = new URLSearchParams(searchParams);
            params.delete('page');
            setSearchParams(params, { replace: true });
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
                  <TableHead>Origen</TableHead>
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
                            {factura.cliente
                              ? getClienteNombre(factura.cliente)
                              : '—'}
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
                      <TableCell>
                        {factura.proforma ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            Desde Proforma
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Directa
                          </span>
                        )}
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
                const params = new URLSearchParams(searchParams);
                if (newPage > 1) {
                  params.set('page', newPage.toString());
                } else {
                  params.delete('page');
                }
                setSearchParams(params, { replace: true });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(newSize) => {
                const params = new URLSearchParams(searchParams);
                params.delete('page'); // Reset a página 1
                if (newSize !== 10) {
                  params.set('pageSize', newSize.toString());
                } else {
                  params.delete('pageSize');
                }
                setSearchParams(params, { replace: true });
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
