import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/ui/pagination';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { AseguradoraSearch } from '../ui/AseguradoraSearch';
import { useAseguradora } from '../hook/useAseguradora';
import type { Aseguradora } from '../types/aseguradora.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import { toast } from 'sonner';
import { patchAseguradoraAction } from '../actions/patch-aseguradora';
import { EstadoActivo } from '@/shared/types/status';
import { SearchAseguradorasAction } from '../actions/search-aseguradoras-action';

export default function AseguradorasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const searchValue = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(searchValue.trim(), 300);
  const hasSearch = debouncedQuery.length > 0;

  const {
    aseguradoras = [],
    totalItems = 0,
    isLoading,
    refetch,
  } = useAseguradora({
    usePagination: !hasSearch,
    limit: !hasSearch ? limit : undefined,
    offset: !hasSearch ? offset : undefined,
  });

  // Búsqueda usando el backend cuando hay término de búsqueda
  const { data: aseguradorasFiltradasResponse, isLoading: isLoadingSearch } =
    useQuery<PaginatedResponse<Aseguradora>>({
      queryKey: ['aseguradoras.search', debouncedQuery, limit, offset],
      queryFn: () =>
        SearchAseguradorasAction({
          q: debouncedQuery,
          limit,
          offset,
        }),
      enabled: hasSearch,
      staleTime: 1000 * 60 * 5,
    });

  const aseguradorasFiltradas = useMemo(() => {
    if (!aseguradorasFiltradasResponse) return [];
    if (Array.isArray(aseguradorasFiltradasResponse))
      return aseguradorasFiltradasResponse;
    return aseguradorasFiltradasResponse.data || [];
  }, [aseguradorasFiltradasResponse]);

  const totalFiltradas = useMemo(() => {
    if (!hasSearch) return totalItems;
    if (!aseguradorasFiltradasResponse) return 0;
    if (Array.isArray(aseguradorasFiltradasResponse))
      return aseguradorasFiltradasResponse.length;
    return aseguradorasFiltradasResponse.total ?? 0;
  }, [hasSearch, totalItems, aseguradorasFiltradasResponse]);

  // Determinar qué aseguradoras mostrar
  const displayedAseguradoras = useMemo(() => {
    if (hasSearch) return aseguradorasFiltradas;
    return aseguradoras;
  }, [hasSearch, aseguradorasFiltradas, aseguradoras]);

  const isLoadingData = hasSearch ? isLoadingSearch : isLoading;

  useEffect(() => {
    if (isLoadingData) return;
    const computedTotalPages = totalFiltradas
      ? Math.ceil(totalFiltradas / pageSize)
      : 1;

    if (totalFiltradas === 0) {
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
  }, [isLoadingData, page, pageSize, searchParams, setSearchParams, totalFiltradas]);

  const totalPages = totalFiltradas ? Math.ceil(totalFiltradas / pageSize) : 1;
  const showEmptyState = !isLoadingData && totalFiltradas === 0;

  const handleDelete = async (idAseguradora: number, descripcion: string) => {
    if (deletingId) return;
    const confirmDelete = window.confirm(
      `¿Eliminar la aseguradora "${descripcion}"? Se marcará como inactiva.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(idAseguradora);
      await patchAseguradoraAction(idAseguradora, {
        activo: EstadoActivo.INACTIVO,
      });
      toast.success('Aseguradora eliminada');
      await refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar la aseguradora';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Aseguradoras</h1>
          <p className="text-muted-foreground text-left">
            Gestión de aseguradoras
          </p>
        </div>
        <Button onClick={() => navigate('/admin/aseguradoras/nueva')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva aseguradora
        </Button>
      </div>

      <AseguradoraSearch containerClassName="w-full max-w-sm" />
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Lista de aseguradoras</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm">
                    Cargando aseguradoras...
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingData &&
                displayedAseguradoras.map((aseguradora) => (
                  <TableRow
                    key={aseguradora.idAseguradora}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium">
                      {aseguradora.descripcion}
                    </TableCell>
                    <TableCell>{aseguradora.telefono || '—'}</TableCell>
                    <TableCell>{aseguradora.direccion || '—'}</TableCell>
                    <TableCell>{aseguradora.contacto || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/aseguradoras/editar/${aseguradora.idAseguradora}`
                            )
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              aseguradora.idAseguradora,
                              aseguradora.descripcion
                            )
                          }
                          aria-label={`Eliminar ${aseguradora.descripcion}`}
                          disabled={deletingId === aseguradora.idAseguradora}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmptyState && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron aseguradoras.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalFiltradas > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFiltradas}
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
              params.delete('page');
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
}
