import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Filter, Eye, Edit, Trash2, Ruler } from '@/shared/icons';
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
import { useUnidadMedida } from '../hook/useUnidadMedida';
import { patchUnidadMedida } from '../actions/patch-unidad-medida';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDate } from '@/shared/utils/formatters';
import type { UnidadMedida } from '../types/unidadMedida.interface';
import { EstadoActivo } from '@/shared/types/status';

export function UnidadesMedidaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState('');
  const { unidadMedidas, totalItems = 0 } = useUnidadMedida({
    usePagination: true,
    limit,
    offset,
  });

  const filteredUnidades = useMemo<UnidadMedida[]>(() => {
    const items = unidadMedidas ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((unidad) => {
      const descripcion = unidad.descripcion?.toLowerCase() ?? '';
      return descripcion.includes(term);
    });
  }, [unidadMedidas, searchTerm]);

  const handleDelete = async (id: number) => {
    try {
      await patchUnidadMedida(id, { activo: EstadoActivo.INACTIVO });
      toast.success('Unidad de medida eliminada');
      await queryClient.invalidateQueries({ queryKey: ['unidadMedidas'] });
    } catch (error: any) {
      toast.error('No se pudo eliminar la unidad de medida');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Unidades de Medida
          </h1>
          <p className="text-muted-foreground">
            Gestiona las unidades de medida para tus productos
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => navigate('/admin/unidades-medida/nueva')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Unidad
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar unidades de medida..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
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
          <CardTitle>Lista de Unidades de Medida</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnidades.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No hay unidades de medida registradas
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnidades.map((unidad) => (
                <TableRow
                  key={unidad.idUnidadMedida}
                  className="table-row-hover"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span>{unidad.descripcion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        unidad.activo === EstadoActivo.ACTIVO
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {unidad.activo === EstadoActivo.ACTIVO
                        ? 'Activo'
                        : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(unidad.fechaCreacion)}</TableCell>
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
                              `/admin/unidades-medida/${unidad.idUnidadMedida}/editar`
                            )
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(unidad.idUnidadMedida)}
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
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        )}
      </Card>
    </div>
  );
}
