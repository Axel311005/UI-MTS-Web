import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/ui/pagination';
import { ClienteHeader } from '../ui/ClienteHeader';
import { ClienteSearchBar } from '../ui/ClienteSearchBar';
import { ClienteFilters } from '../ui/ClienteFilters';
import { ClienteRowActions } from '../ui/ClienteRowActions';
import { useCliente } from '../hook/useCliente';
import { EstadoActivo } from '@/shared/types/status';
import type { Cliente } from '../types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getClienteNombre } from '../utils/cliente.utils';
import { SearchClientesAction } from '../actions/search-clientes-action';

export const ClientesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const currentParam = searchParams.get('q') || '';
    if (currentParam !== searchTerm) {
      setSearchTerm(currentParam);
    }
  }, [searchParams, searchTerm]);

  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const hasSearch = debouncedSearch.length > 0;

  const {
    clientes = [],
    totalItems = 0,
    isLoading,
  } = useCliente({
    usePagination: !hasSearch,
    limit: !hasSearch ? limit : undefined,
    offset: !hasSearch ? offset : undefined,
  });

  // Búsqueda usando el backend cuando hay término de búsqueda
  const { data: clientesFiltradosResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Cliente>>({
      queryKey: ['clientes.search', debouncedSearch, limit, offset],
      queryFn: () =>
        SearchClientesAction({
          q: debouncedSearch,
          limit,
          offset,
        }),
      enabled: hasSearch,
      staleTime: 1000 * 60 * 5,
    });

  const clientesFiltrados = useMemo(() => {
    if (!clientesFiltradosResponse) return [];
    if (Array.isArray(clientesFiltradosResponse))
      return clientesFiltradosResponse;
    return clientesFiltradosResponse.data || [];
  }, [clientesFiltradosResponse]);

  const totalFiltrados = useMemo(() => {
    if (!hasSearch) return totalItems;
    if (!clientesFiltradosResponse) return 0;
    if (Array.isArray(clientesFiltradosResponse))
      return clientesFiltradosResponse.length;
    return clientesFiltradosResponse.total ?? 0;
  }, [hasSearch, totalItems, clientesFiltradosResponse]);

  // Determinar qué clientes mostrar
  const displayedClientes = useMemo(() => {
    if (hasSearch) return clientesFiltrados;
    return clientes;
  }, [hasSearch, clientesFiltrados, clientes]);

  const isLoadingData = hasSearch ? isLoadingSearch : isLoading;

  useEffect(() => {
    if (isLoadingData) return;
    const computedTotalPages = totalFiltrados
      ? Math.ceil(totalFiltrados / pageSize)
      : 1;

    if (totalFiltrados === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        setSearchParams(params, { replace: true });
      }
      return;
    }

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
  }, [isLoadingData, page, pageSize, searchParams, setSearchParams, totalFiltrados]);

  const totalPages = totalFiltrados ? Math.ceil(totalFiltrados / pageSize) : 1;
  const showEmptyState = !isLoadingData && totalFiltrados === 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <ClienteHeader onNewClient={() => navigate('/admin/clientes/nuevo')} />

      <ClienteSearchBar
        value={searchTerm}
        onValueChange={(value) => {
          setSearchTerm(value);
          // Reset a página 1 al buscar
          const params = new URLSearchParams(searchParams);
          const trimmed = value.trim();
          if (trimmed) params.set('q', trimmed);
          else params.delete('q');
          params.delete('page');
          setSearchParams(params, { replace: true });
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div>
          <ClienteFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead data-mobile-keep>RUC</TableHead>
                <TableHead data-mobile-hidden>Teléfono</TableHead>
                <TableHead data-mobile-hidden>Dirección</TableHead>
                <TableHead data-mobile-hidden>Exonerado</TableHead>
                <TableHead data-mobile-keep>Estado</TableHead>
                <TableHead className="text-right" data-mobile-keep data-mobile-actions>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedClientes.map((cliente) => {
                const isActivo = cliente.activo === EstadoActivo.ACTIVO;
                const estadoLabel = isActivo ? 'Activo' : 'Inactivo';
                const exoneradoLabel = cliente.esExonerado
                  ? `Sí${
                      cliente.porcentajeExonerado
                        ? ` (${cliente.porcentajeExonerado}%)`
                        : ''
                    }`
                  : 'No';
                const telefono = cliente.telefono || '—';
                const direccion = cliente.direccion || '—';
                return (
                  <TableRow key={cliente.idCliente} className="table-row-hover">
                    <TableCell className="font-medium">
                      {getClienteNombre(cliente)}
                    </TableCell>
                    <TableCell data-mobile-keep>{cliente.ruc || '—'}</TableCell>
                    <TableCell data-mobile-hidden>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {telefono}
                      </div>
                    </TableCell>
                    <TableCell data-mobile-hidden>{direccion}</TableCell>
                    <TableCell data-mobile-hidden>{exoneradoLabel}</TableCell>
                    <TableCell data-mobile-keep>
                      <Badge variant={isActivo ? 'default' : 'secondary'}>
                        {estadoLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" data-mobile-keep data-mobile-actions>
                      <ClienteRowActions cliente={cliente} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {showEmptyState && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </div>
          </div>
        </CardContent>
        {totalFiltrados > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFiltrados}
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
      </Card>
    </div>
  );
};
