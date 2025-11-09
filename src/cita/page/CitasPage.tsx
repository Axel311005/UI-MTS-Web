import { useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Pencil, Eye } from 'lucide-react';
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
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/ui/pagination';
import { useCita } from '../hook/useCita';
import { CitaSearchBar } from '../ui/CitaSearchBar';
import type { Cita } from '../types/cita.interface';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { CitaEstado } from '@/shared/types/status';
import {
  getClienteNombre,
  getClienteSearchText,
} from '@/clientes/utils/cliente.utils';

const estadoVariant: Record<
  CitaEstado,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  [CitaEstado.PROGRAMADA]: 'default',
  [CitaEstado.CONFIRMADA]: 'secondary',
  [CitaEstado.EN_PROCESO]: 'outline',
  [CitaEstado.FINALIZADA]: 'default',
  [CitaEstado.CANCELADA]: 'destructive',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
};

export default function CitasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('q') || '';
  const debounced = useDebounce(initialSearch.trim().toLowerCase(), 300);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const shouldUsePagination = debounced.length === 0;

  const {
    citas = [],
    totalItems = 0,
    isLoading,
  } = useCita({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filtered = useMemo<Cita[]>(() => {
    const list = citas ?? [];
    if (!debounced) return list;
    return list.filter((c) => {
      const clienteSearchText = c.cliente
        ? getClienteSearchText(c.cliente)
        : '';
      const vehiculoPlaca = c.vehiculo?.placa?.toLowerCase?.() ?? '';
      const motivo = c.motivoCita?.descripcion?.toLowerCase?.() ?? '';
      const estado = (c.estado ?? '').toString().toLowerCase();
      return (
        clienteSearchText.includes(debounced) ||
        vehiculoPlaca.includes(debounced) ||
        motivo.includes(debounced) ||
        estado.includes(debounced)
      );
    });
  }, [citas, debounced]);

  const totalFiltered = shouldUsePagination ? totalItems : filtered.length;

  const paginated = useMemo(() => {
    if (shouldUsePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, shouldUsePagination]);

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmpty = !isLoading && totalFiltered === 0;

  // Sincronizar página con URL cuando cambian los datos
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Citas</h1>
          <p className="text-muted-foreground">
            Gestión de citas agendadas por clientes
          </p>
        </div>
        <Button onClick={() => navigate('/admin/citas/nueva')}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Cita
        </Button>
      </div>

      <CitaSearchBar
        containerClassName="w-full max-w-md"
        className="w-full"
        placeholder="Buscar por cliente, vehículo, motivo o estado"
      />

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm">
                    Cargando citas...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginated.map((cita) => (
                  <TableRow key={cita.idCita} className="table-row-hover">
                    <TableCell className="font-medium">
                      {cita.cliente ? getClienteNombre(cita.cliente) : '—'}
                    </TableCell>
                    <TableCell>
                      {cita.vehiculo?.placa
                        ? `${cita.vehiculo.placa} — ${cita.vehiculo.marca} ${cita.vehiculo.modelo}`
                        : '—'}
                    </TableCell>
                    <TableCell>{cita.motivoCita?.descripcion ?? '—'}</TableCell>
                    <TableCell>{formatDate(cita.fechaInicio)}</TableCell>
                    <TableCell>{formatDate(cita.fechaFin)}</TableCell>
                    <TableCell className="uppercase">
                      {cita.canal ?? '—'}
                    </TableCell>
                    <TableCell>
                      {cita.estado ? (
                        <Badge
                          variant={estadoVariant[cita.estado] ?? 'outline'}
                        >
                          {cita.estado.replace('_', ' ')}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/citas/${cita.idCita}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/citas/${cita.idCita}/editar`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron citas.
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
}
