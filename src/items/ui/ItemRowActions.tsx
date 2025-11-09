import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { ItemResponse } from '../types/item.response';

import { patchItem } from '../actions/patch-item';
import { EstadoActivo } from '@/shared/types/status';
import { useQueryClient } from '@tanstack/react-query';

interface ItemRowActionsProps {
  item: ItemResponse;
}

export function ItemRowActions({ item }: ItemRowActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onView = () => {
    navigate(`/admin/productos/${item.idItem}`);
  };

  const onEdit = () => {
    navigate(`/admin/productos/${item.idItem}/editar`);
  };

  const onDelete = async () => {
    const confirm = window.confirm(
      '¿Seguro que deseas eliminar este producto?'
    );
    if (!confirm) return;
    const dismiss = toast.loading('Eliminando producto...');
    try {
      await patchItem(item.idItem, {
        clasificacionId: item.clasificacion?.idClasificacion ?? 0,
        unidadMedidaId: item.unidadMedida?.idUnidadMedida ?? 0,
        codigoItem: item.codigoItem,
        descripcion: item.descripcion,
        tipo: item.tipo,
        precioBaseLocal: Number(item.precioBaseLocal),
        precioBaseDolar: Number(item.precioBaseDolar),
        precioAdquisicionLocal: Number(item.precioAdquisicionLocal),
        precioAdquisicionDolar: Number(item.precioAdquisicionDolar),
        esCotizable: item.esCotizable,
        ultimaSalida: item.ultimaSalida
          ? new Date(item.ultimaSalida).toISOString()
          : null,
        ultimoIngreso: item.ultimoIngreso
          ? new Date(item.ultimoIngreso).toISOString()
          : null,
        usuarioUltModif: item.usuarioUltModif,
        fechaUltModif: item.fechaUltModif
          ? new Date(item.fechaUltModif).toISOString()
          : null,
        perecedero: item.perecedero,
        activo: EstadoActivo.INACTIVO,
      });
      toast.success('Producto eliminado correctamente');
      await queryClient.invalidateQueries({
        queryKey: ['items'],
        exact: false,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo eliminar el producto';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
