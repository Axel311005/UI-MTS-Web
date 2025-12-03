import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
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

import type { Bodega } from '../types/bodega.interface';
import { useBodega } from '../hook/useBodega';
import { patchBodegaAction } from '../actions/patch-bodega';
import { EstadoActivo } from '@/shared/types/status';

export function BodegasPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState('');
  const {
    bodegas,
    totalItems = 0,
    isLoading,
  } = useBodega({
    usePagination: true,
    limit,
    offset,
  });

  const filteredBodegas = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (bodegas || []).filter((b) =>
      b.descripcion.toLowerCase().includes(term)
    );
  }, [bodegas, searchTerm]);

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

  const handleDelete = async (bodega: Bodega) => {
    let dismiss: string | number | undefined;
    try {
      dismiss = toast.loading('Eliminando bodega...');
      await patchBodegaAction(bodega.idBodega, {
        activo: EstadoActivo.INACTIVO,
      });
      toast.success('Bodega eliminada');
      await queryClient.invalidateQueries({
        queryKey: ['bodegas'],
        exact: false,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo eliminar la bodega';
      toast.error(message);
    } finally {
      if (dismiss !== undefined) {
        toast.dismiss(dismiss);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Bodegas
          </h1>
          <p className="text-muted-foreground">
            Gestiona las bodegas del sistema
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => navigate('/admin/bodegas/nueva')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Bodega
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar bodegas..."
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
          <CardTitle>Lista de Bodegas</CardTitle>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>Cargando...</TableCell>
                </TableRow>
              ) : filteredBodegas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    {searchTerm
                      ? 'No se encontraron bodegas'
                      : 'No hay bodegas registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBodegas.map((bodega) => (
                  <TableRow key={bodega.idBodega} className="table-row-hover">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        <span>{bodega.descripcion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bodega.activo === 'ACTIVO' ? 'default' : 'secondary'
                        }
                      >
                        {bodega.activo === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(bodega.fechaCreacion).toLocaleDateString()}
                    </TableCell>
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
                              navigate(`/bodegas/editar/${bodega.idBodega}`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(bodega)}
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
            totalPages={Math.max(Math.ceil(totalItems / pageSize), 1)}
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
