import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Pencil, Eye } from 'lucide-react';
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
import { useCotizacion } from '../hook/useCotizacion';
import { CotizacionSearchBar } from '../ui/CotizacionSearchBar';
import type { Cotizacion } from '../types/cotizacion.interface';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { CotizacionEstado } from '@/shared/types/status';
import { formatMoney } from '@/shared/utils/formatters';

const estadoVariant: Record<CotizacionEstado, 'default' | 'destructive'> = {
  [CotizacionEstado.GENERADA]: 'default',
  [CotizacionEstado.CADUCADA]: 'destructive',
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString('es-ES')
    : '—';
};

export default function CotizacionesPage() {
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
    cotizaciones = [],
    totalItems = 0,
    isLoading,
  } = useCotizacion({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filtered = useMemo<Cotizacion[]>(() => {
    const list = cotizaciones ?? [];
    if (!debounced) return list;
    return list.filter((c) => {
      const codigo = c.codigoCotizacion?.toLowerCase?.() ?? '';
      const cliente = c.nombreCliente?.toLowerCase?.() ?? '';
      const estado = (c.estado ?? '').toString().toLowerCase();
      return (
        codigo.includes(debounced) ||
        cliente.includes(debounced) ||
        estado.includes(debounced)
      );
    });
  }, [cotizaciones, debounced]);

  const totalFiltered = shouldUsePagination ? totalItems : filtered.length;

  const paginated = useMemo(() => {
    if (shouldUsePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, shouldUsePagination]);

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmpty = !isLoading && totalFiltered === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Cotizaciones</h1>
          <p className="text-muted-foreground">
            Gestión de cotizaciones generadas por clientes
          </p>
        </div>
      </div>

      <CotizacionSearchBar
        containerClassName="w-full max-w-md"
        className="w-full"
        placeholder="Buscar por código, cliente o estado"
      />

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm">
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginated.map((cotizacion) => (
                  <TableRow
                    key={cotizacion.idCotizacion}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium">
                      {cotizacion.codigoCotizacion ?? '—'}
                    </TableCell>
                    <TableCell>
                      {cotizacion.nombreCliente ??
                        cotizacion.cliente?.nombre ??
                        '—'}
                    </TableCell>
                    <TableCell>{cotizacion.cliente?.ruc ?? '—'}</TableCell>
                    <TableCell>{formatDate(cotizacion.fecha)}</TableCell>
                    <TableCell>
                      {cotizacion.total
                        ? formatMoney(Number(cotizacion.total))
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {cotizacion.estado ? (
                        <Badge
                          variant={
                            estadoVariant[cotizacion.estado] ?? 'outline'
                          }
                        >
                          {cotizacion.estado}
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
                          onClick={() =>
                            navigate(`/cotizaciones/${cotizacion.idCotizacion}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/cotizaciones/${cotizacion.idCotizacion}/editar`
                            )
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
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron cotizaciones.
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
