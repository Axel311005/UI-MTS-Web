import { Edit, Eye, MoreHorizontal, ShieldAlert } from 'lucide-react';
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

interface ItemRowActionsProps {
  item: ItemResponse;
}

export function ItemRowActions({ item }: ItemRowActionsProps) {
  const navigate = useNavigate();

  const onView = () => {
    navigate(`/productos/${item.idItem}`);
  };

  const onEdit = () => {
    navigate(`/productos/${item.idItem}/editar`);
  };

  const onToggleActive = () => {
    toast.info('Pronto podrás actualizar el estado del producto.');
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
        <DropdownMenuItem onClick={onToggleActive}>
          <ShieldAlert className="mr-2 h-4 w-4" />
          Actualizar estado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
