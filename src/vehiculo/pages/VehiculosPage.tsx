import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/ui/pagination';
import { useVehiculo } from '../hook/useVehiculo';
import type { Vehiculo } from '../types/vehiculo.interface';
import { VehiculoSearch } from '../ui/VehiculoSearch';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { patchVehiculoAction } from '../actions/patch-vehiculo';
import { EstadoActivo } from '@/shared/types/status';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { getClienteNombre, getClienteSearchText } from '@/clientes/utils/cliente.utils';

export const VehiculosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const debouncedQuery = useDebounce(query, 300);
  const shouldUsePagination = debouncedQuery.length === 0;

  const {
    vehiculos = [],
    totalItems = 0,
    isLoading,
    refetch,
  } = useVehiculo({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filteredVehiculos = useMemo<Vehiculo[]>(() => {
    const items = vehiculos ?? [];
    if (!debouncedQuery) return items;
    return items.filter((v) => {
      const placa = v.placa?.toLowerCase?.() ?? '';
      const marca = v.marca?.toLowerCase?.() ?? '';
      const modelo = v.modelo?.toLowerCase?.() ?? '';
      const color = v.color?.toLowerCase?.() ?? '';
      const anio =
        v.anio !== undefined && v.anio !== null
          ? String(v.anio).toLowerCase()
          : '';
      const cliente = v.cliente ? getClienteSearchText(v.cliente) : '';
      return (
        placa.includes(debouncedQuery) ||
        marca.includes(debouncedQuery) ||
        modelo.includes(debouncedQuery) ||
        color.includes(debouncedQuery) ||
        anio.includes(debouncedQuery) ||
        cliente.includes(debouncedQuery)
      );
    });
  }, [vehiculos, debouncedQuery]);

  const totalFiltered = shouldUsePagination
    ? totalItems
    : filteredVehiculos.length;

  const paginatedVehiculos = useMemo(() => {
    if (shouldUsePagination) return filteredVehiculos;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredVehiculos.slice(startIndex, endIndex);
  }, [filteredVehiculos, page, pageSize, shouldUsePagination]);

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
      const params = new URLSearchParams(searchParams);
      if (computedTotalPages > 1) {
        params.set('page', computedTotalPages.toString());
      } else {
        params.delete('page');
      }
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const handleDelete = async (idVehiculo: number, placa: string) => {
    if (deletingId) return;
    const confirmDelete = window.confirm(
      `¿Eliminar el vehículo ${placa}? Se marcará como inactivo.`
    );
    if (!confirmDelete) return;
    try {
      setDeletingId(idVehiculo);
      await patchVehiculoAction(idVehiculo, {
        activo: EstadoActivo.INACTIVO,
      });
      toast.success('Vehículo eliminado');
      await refetch();
    } catch (error) {
      toast.error('No se pudo eliminar el vehículo');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmptyState = !isLoading && totalFiltered === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Vehículos</h1>
          <p className="text-muted-foreground">
            Listado de vehículos registrados
          </p>
        </div>
        <Button onClick={() => navigate('/admin/vehiculos/nuevo')}>
          Nuevo vehículo
        </Button>
      </div>

      <VehiculoSearch />
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Lista de Vehículos</CardTitle>
            <div className="w-full max-w-sm"></div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVehiculos.map((v) => (
                <TableRow key={v.idVehiculo} className="table-row-hover">
                  <TableCell className="font-medium">{v.placa}</TableCell>
                  <TableCell>{v.marca || '—'}</TableCell>
                  <TableCell>{v.modelo || '—'}</TableCell>
                  <TableCell>{v.anio ?? '—'}</TableCell>
                  <TableCell>{v.color || '—'}</TableCell>
                  <TableCell>{v.cliente ? getClienteNombre(v.cliente) : '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        v.activo === EstadoActivo.ACTIVO
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {v.activo === EstadoActivo.ACTIVO ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/vehiculos/${v.idVehiculo}/editar`)
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${v.placa}`}
                        onClick={() => handleDelete(v.idVehiculo, v.placa)}
                        disabled={deletingId === v.idVehiculo}
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
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron vehículos.
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
              if (newPage > 1) params.set('page', newPage.toString());
              else params.delete('page');
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete('page');
              if (newSize !== 10) params.set('pageSize', newSize.toString());
              else params.delete('pageSize');
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default VehiculosPage;
