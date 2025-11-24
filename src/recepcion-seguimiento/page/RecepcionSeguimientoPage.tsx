import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Plus, Pencil } from 'lucide-react';
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
import { useRecepcionSeguimiento } from '../hook/useRecepcionSeguimiento';
import { RecepcionSeguimientoSearchBar } from '../ui/RecepcionSeguimientoSearchBar';
import type { RecepcionSeguimiento } from '../types/recepcion-seguimiento.interface';
import { useDebounce } from '@/shared/hooks/use-debounce';

const estadoVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  'PENDIENTE DE DIAGNOSTICO': 'secondary',
  'ESPERA APROBACION': 'default',
  'EN REPARACION': 'default',
  'EN ESPERA REPUESTOS': 'secondary',
  PRUEBAS: 'outline',
  'LISTO PARA ENTREGAR': 'default',
  CANCELADO: 'destructive',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString()
    : '—';
};

export default function RecepcionSeguimientoPage() {
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
    seguimientos = [],
    totalItems = 0,
    isLoading,
  } = useRecepcionSeguimiento({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filtered = useMemo<RecepcionSeguimiento[]>(() => {
    const list = seguimientos ?? [];
    if (!debounced) return list;
    return list.filter((s) => {
      const codigo = s.recepcion?.codigoRecepcion?.toLowerCase?.() ?? '';
      const estado = (s.estado ?? '').toString().toLowerCase();
      const descripcion = (s.descripcion ?? '').toString().toLowerCase();
      return (
        codigo.includes(debounced) ||
        estado.includes(debounced) ||
        descripcion.includes(debounced)
      );
    });
  }, [seguimientos, debounced]);

  const totalFiltered = shouldUsePagination ? totalItems : filtered.length;

  const paginated = useMemo(() => {
    if (shouldUsePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, shouldUsePagination]);

  useEffect(() => {
    if (isLoading) return;
    const computedTotal = totalFiltered
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
    if (page > computedTotal) {
      const last = Math.max(1, computedTotal);
      const params = new URLSearchParams(searchParams);
      if (last > 1) params.set('page', last.toString());
      else params.delete('page');
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const totalPages = Math.max(1, totalFiltered > 0 ? Math.ceil(totalFiltered / pageSize) : 1);
  const showEmpty = !isLoading && totalFiltered === 0;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-left">
            Seguimiento de Recepciones
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
            Gestión del seguimiento de recepciones de vehículos
          </p>
        </div>
        <Button 
          onClick={() => navigate('/recepcion-seguimiento/nueva')}
          className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo seguimiento
        </Button>
      </div>

      <RecepcionSeguimientoSearchBar
        containerClassName="w-full max-w-md"
        className="w-full"
        placeholder="Buscar por recepción, estado o descripción"
      />

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de seguimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recepción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm">
                    Cargando seguimientos...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginated.map((s) => (
                  <TableRow
                    key={s.idRecepcionSeguimiento}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium">
                      {s.recepcion?.codigoRecepcion ?? '—'}
                    </TableCell>
                    <TableCell>{formatDate(s.fecha)}</TableCell>
                    <TableCell>
                      {s.estado ? (
                        <Badge
                          variant={
                            estadoVariant[s.estado] ??
                            estadoVariant[s.estado.replace(/\s+/g, '_')] ??
                            'outline'
                          }
                        >
                          {s.estado}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {s.descripcion ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/recepcion-seguimiento/editar/${s.idRecepcionSeguimiento}`
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron seguimientos.
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

