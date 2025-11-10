import { useNavigate } from "react-router";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal } from "@/shared/icons";

import type { Cita } from "../types/cita.interface";

interface Props {
  cita: Cita;
}

export function CitaRowActions({ cita }: Props) {
  const navigate = useNavigate();

  const resolveCitaId = () =>
    cita?.idCita ?? (cita as any)?.id ?? (cita as any)?.id_cita;

  const citaId = resolveCitaId();

  if (!citaId) {
    return null;
  }

  const handleView = () => {
    navigate(`/admin/citas/${citaId}`);
  };

  const handleEdit = () => {
    navigate(`/admin/citas/${citaId}/editar`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 p-0"
          aria-label={`Acciones para la cita ${citaId}`}
        >
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
