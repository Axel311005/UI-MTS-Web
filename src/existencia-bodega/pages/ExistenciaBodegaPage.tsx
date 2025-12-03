import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Pagination } from '@/shared/components/ui/pagination';
import { useExistenciaBodega } from '../hook/useExistenciaBodega';

export function ExistenciaBodegaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState('');
  const { existencias, totalItems = 0, isLoading } = useExistenciaBodega({
    usePagination: true,
    limit,
    offset,
  });

  const filteredExistencias = useMemo(() => {
    if (!existencias) return [];
    const term = searchTerm.toLowerCase();
    return existencias.filter(
      (existencia) =>
        existencia.item.descripcion.toLowerCase().includes(term) ||
        existencia.item.codigoItem.toLowerCase().includes(term) ||
        existencia.bodega.descripcion.toLowerCase().includes(term)
    );
  }, [existencias, searchTerm]);

  // Validar página cuando cambian los datos
  useEffect(() => {
    if (isLoading) return;
    const computedTotalPages = totalItems
      ? Math.ceil(totalItems / pageSize)
      : 1;

    if (totalItems === 0) {
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
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalItems]);

  const getStockStatus = (cant: string, min: string, reorden: string) => {
    const cantidad = parseFloat(cant);
    const minima = parseFloat(min);
    const puntoReorden = parseFloat(reorden);

    if (cantidad <= minima) {
      return {
        label: 'Crítico',
        variant: 'destructive' as const,
        icon: AlertTriangle,
      };
    } else if (cantidad <= puntoReorden) {
      return {
        label: 'Bajo',
        variant: 'secondary' as const,
        icon: AlertTriangle,
      };
    }
    return { label: 'Normal', variant: 'default' as const, icon: Package };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Inventario
          </h1>
          <p className="text-muted-foreground">
            Gestiona las existencias de productos en bodegas
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => navigate('/admin/existencia-bodega/nueva')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Existencia
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por item, código o bodega..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const params = new URLSearchParams(searchParams);
              params.delete('page');
              setSearchParams(params, { replace: true });
            }}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Existencias por Bodega</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Bodega</TableHead>
                  <TableHead className="text-center">Disponible</TableHead>
                  <TableHead className="text-center">Min</TableHead>
                  <TableHead className="text-center">Max</TableHead>
                  <TableHead className="text-center">Reorden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExistencias.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      {searchTerm
                        ? 'No se encontraron existencias'
                        : 'No hay existencias registradas'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExistencias.map((existencia) => {
                    const status = getStockStatus(
                      existencia.cantDisponible,
                      existencia.existenciaMinima,
                      existencia.puntoDeReorden
                    );
                    const StatusIcon = status.icon;

                    return (
                      <TableRow
                        key={existencia.idExistenciaBodega}
                        className="table-row-hover"
                      >
                        <TableCell className="font-mono text-sm">
                          {existencia.item.codigoItem}
                        </TableCell>
                        <TableCell className="font-medium">
                          {existencia.item.descripcion}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{existencia.bodega.descripcion}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {existencia.cantDisponible}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {existencia.existenciaMinima}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {existencia.existenciaMaxima}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {existencia.puntoDeReorden}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/existencia-bodega/editar/${existencia.idExistenciaBodega}`
                                  )
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalItems / pageSize)}
            pageSize={pageSize}
            totalItems={totalItems}
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
}
