import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Receipt,
} from '@/shared/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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
import { useImpuesto } from '../hook/useImpuesto';
import { patchImpuesto } from '../actions/patch-impuesto';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDate } from '@/shared/utils/formatters';
import type { Impuesto } from '../types/impuesto.interface';
import { EstadoActivo } from '@/shared/types/status';

export function ImpuestoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState('');
  const { impuestos, totalItems = 0 } = useImpuesto({
    usePagination: true,
    limit,
    offset,
  });

  const filteredImpuestos = useMemo<Impuesto[]>(() => {
    const items = impuestos ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((impuesto) => {
      const descripcion = impuesto.descripcion?.toLowerCase() ?? '';
      return descripcion.includes(term);
    });
  }, [impuestos, searchTerm]);

  // Validar página cuando cambian los datos
  useEffect(() => {
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
  }, [page, pageSize, searchParams, setSearchParams, totalItems]);

  const handleDelete = async (id: number) => {
    try {
      await patchImpuesto(id, { activo: EstadoActivo.INACTIVO });
      toast.success('Impuesto eliminado');
      await queryClient.invalidateQueries({ queryKey: ['impuestos'] });
    } catch (error: any) {
      toast.error('No se pudo eliminar el impuesto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Impuestos
          </h1>
          <p className="text-muted-foreground text-left">
            Gestiona los impuestos para tus transacciones
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => navigate('/admin/impuestos/nuevo')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Impuesto
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar impuestos..."
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
          <CardTitle>Lista de Impuestos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Porcentaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImpuestos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No hay impuestos registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredImpuestos.map((impuesto) => (
                  <TableRow
                    key={impuesto.idImpuesto}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span>{impuesto.descripcion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {Number(impuesto.porcentaje).toLocaleString('es-PY', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          impuesto.activo === EstadoActivo.ACTIVO
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {impuesto.activo === EstadoActivo.ACTIVO
                          ? 'Activo'
                          : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(impuesto.fechaCreacion)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/admin/impuestos/${impuesto.idImpuesto}/editar`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(impuesto.idImpuesto)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
