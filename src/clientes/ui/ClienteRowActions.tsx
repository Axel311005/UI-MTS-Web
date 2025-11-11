import { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EstadoActivo } from '@/shared/types/status';
import type { Cliente } from '../types/cliente.interface';
import { patchCliente } from '../actions/patch-cliente';
import { toNumberOrZero } from './cliente-form.types';

interface ClienteRowActionsProps {
  cliente: Cliente;
}

export function ClienteRowActions({ cliente }: ClienteRowActionsProps) {
  const clienteId = cliente.idCliente;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const onViewProfile = () => {
    navigate(`/admin/clientes/${clienteId}`);
  };

  const onEdit = () => {
    navigate(`/admin/clientes/${clienteId}/editar`);
  };

  const onDelete = async () => {
    if (processing) return;
    const confirmed = window.confirm(
      '¿Deseas marcar este cliente como inactivo?'
    );
    if (!confirmed) return;

    setProcessing(true);
    const dismiss = toast.loading('Marcando cliente inactivo...');
    try {
      const payload = {
        primerNombre: cliente.primerNombre ?? null,
        primerApellido: cliente.primerApellido ?? null,
        ruc: cliente.ruc ?? '',
        esExonerado: Boolean(cliente.esExonerado),
        porcentajeExonerado: cliente.esExonerado
          ? toNumberOrZero(String(cliente.porcentajeExonerado ?? '0'))
          : 0,
        direccion: cliente.direccion ?? '',
        telefono: cliente.telefono ?? '',
        activo: EstadoActivo.INACTIVO,
        notas: cliente.notas ?? '',
      };

      await patchCliente(clienteId, payload);
      toast.success('Cliente marcado como inactivo');

      await queryClient.invalidateQueries({
        queryKey: ['clientes'],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ['clientes.detail', clienteId],
        exact: false,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar el estado del cliente';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onViewProfile}>
          <Eye className="mr-2 h-4 w-4" />
          Ver perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={onDelete}
          disabled={processing}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
