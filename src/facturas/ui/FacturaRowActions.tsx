import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Edit, Eye, FileText, Trash2 } from '@/shared/icons';
import { useNavigate } from 'react-router';
import type { Factura } from '../types/Factura.interface';

interface Props {
  factura: Factura;
}

export default function FacturaRowActions({ factura }: Props) {
  const navigate = useNavigate();
  const onView = () => {};
  const onPdf = () => {};
  const onEdit = () => {
    const id =
      (factura as any)?.id_factura ??
      (factura as any)?.id ??
      (factura as any)?.idFactura;
    if (id) navigate(`/facturas/${id}/editar`);
  };
  const onDelete = () => {};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Acciones para factura ${factura.codigoFactura}`}
        >
          <span className="sr-only">Abrir menú</span>
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Generar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
