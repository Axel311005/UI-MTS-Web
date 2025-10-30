import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Edit, Eye, Trash2 } from '@/shared/icons';
import type { Compra } from '../types/Compra.interface';
import { patchCompra } from '../actions/patch-compra';

interface Props {
  compra: Compra;
}

export default function CompraRowActions({ compra }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const resolveCompraId = () =>
    (compra as any)?.id_compra ?? (compra as any)?.id ?? (compra as any)?.idCompra;

  const requireNumber = (label: string, value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Compra sin ${label}`);
    }
    return parsed;
  };

  const onView = () => {
    const id = resolveCompraId();
    if (id) navigate(`/compras/${id}`);
  };

  const onEdit = () => {
    const id = resolveCompraId();
    if (id) navigate(`/compras/${id}/editar`);
  };

  const onDelete = async () => {
    if (isProcessing) return;
    const id = resolveCompraId();
    if (!id) return;

    const confirmed = window.confirm('¿Deseas anular esta compra?');
    if (!confirmed) return;

    setIsProcessing(true);
    const dismiss = toast.loading('Anulando compra...');
    try {
      const payload = {
        // En compras no tenemos proveedor en el tipo aún, enviamos mínimos requeridos
        tipoPagoId: requireNumber('tipo de pago', (compra as any)?.tipoPago?.idTipoPago ?? 0),
        monedaId: requireNumber('moneda', (compra as any)?.moneda?.idMoneda ?? 0),
        impuestoId: requireNumber('impuesto', (compra as any)?.impuesto?.idImpuesto ?? 0),
        bodegaId: requireNumber('bodega', (compra as any)?.bodega?.idBodega ?? 0),
        consecutivoId: Number((compra as any)?.consecutivo?.idConsecutivo ?? 0) || 0,
        empleadoId: 1,
        estado: 'ANULADA' as const,
        porcentajeDescuento: Number((compra as any)?.porcentajeDescuento ?? 0) || 0,
        tipoCambioUsado: Number((compra as any)?.tipoCambioUsado ?? 0) || 0,
        comentario: (compra as any)?.comentario ?? '',
        anulado: true,
        fechaAnulacion: new Date().toISOString(),
      };
      await patchCompra(Number(id), payload);
      toast.success('Compra anulada');
      await queryClient.invalidateQueries({ queryKey: ['compras'], exact: false });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo anular la compra';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isProcessing}
          aria-label={`Acciones para compra ${(compra as any)?.codigoCompra ?? ''}`}
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
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={onDelete} disabled={isProcessing}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


