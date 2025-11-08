import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getClienteNombre, getClienteSearchText } from '../utils/cliente.utils';

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

  const debouncedSearch = useDebounce(searchTerm.trim().toLowerCase(), 300);

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const shouldUsePagination = debouncedSearch.length === 0;

  const {
    clientes = [],
    totalItems = 0,
    isLoading,
  } = useCliente({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  // Para búsqueda, usamos los datos de la página actual (ya paginados del backend o frontend)
  const filteredClientes = useMemo<Cliente[]>(() => {
    const items = clientes ?? [];
    if (!debouncedSearch) return items;

    return items.filter((cliente) => {
      const searchText = getClienteSearchText(cliente);
      return searchText.includes(debouncedSearch);
    });
  }, [clientes, debouncedSearch]);

  const totalFiltered = useMemo(() => {
    if (shouldUsePagination) return totalItems;
    return filteredClientes.length;
  }, [filteredClientes, totalItems, shouldUsePagination]);

  const paginatedClientes = useMemo(() => {
    if (shouldUsePagination) return filteredClientes;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClientes.slice(startIndex, endIndex);
  }, [filteredClientes, page, pageSize, shouldUsePagination]);

  useEffect(() => {
    if (isLoading) return;
    const computedTotalPages = totalFiltered
      ? Math.ceil(totalFiltered / pageSize)
      : 1;

    if (totalFiltered === 0) {
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
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmptyState = !isLoading && totalFiltered === 0;

  return (
    <div className="space-y-6">
      <ClienteHeader onNewClient={() => navigate('/clientes/nuevo')} />

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
        <div className="animate-in fade-in-50 slide-in-from-top-1">
          <ClienteFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Exonerado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClientes.map((cliente) => {
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
                    <TableCell>{cliente.ruc || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {telefono}
                      </div>
                    </TableCell>
                    <TableCell>{direccion}</TableCell>
                    <TableCell>{exoneradoLabel}</TableCell>
                    <TableCell>
                      <Badge variant={isActivo ? 'default' : 'secondary'}>
                        {estadoLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
        </CardContent>
        {totalFiltered > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFiltered}
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
