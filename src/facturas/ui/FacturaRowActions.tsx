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
import { Edit, Eye, FileText, Trash2 } from '@/shared/icons';
import { useAuthStore } from '@/auth/store/auth.store';

import { patchFactura } from '../actions/patch-factura';
import type { Factura } from '../types/Factura.interface';

interface Props {
  factura: Factura;
}

export default function FacturaRowActions({ factura }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const empleadoId = useAuthStore((state) => state.user?.empleado?.id ?? 1);

  const resolveFacturaId = () =>
    (factura as any)?.id_factura ??
    (factura as any)?.id ??
    (factura as any)?.idFactura;

  const requireNumber = (label: string, value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Factura sin ${label}`);
    }
    return parsed;
  };

  const onView = () => {
    const id = resolveFacturaId();
    if (id) navigate(`/facturas/${id}`);
  };
  const onPdf = () => {};
  const onEdit = () => {
    const id = resolveFacturaId();
    if (id) navigate(`/facturas/${id}/editar`);
  };
  const onDelete = async () => {
    if (isProcessing) return;
    const id = resolveFacturaId();
    if (!id) return;

    const confirmed = window.confirm('¿Deseas anular esta factura?');
    if (!confirmed) return;

    setIsProcessing(true);
    const dismiss = toast.loading('Anulando factura...');
    try {
      const payload = {
        clienteId: requireNumber(
          'cliente asociado',
          factura.cliente?.idCliente
        ),
        tipoPagoId: requireNumber('tipo de pago', factura.tipoPago?.idTipoPago),
        monedaId: requireNumber('moneda', factura.moneda?.idMoneda),
        impuestoId: requireNumber('impuesto', factura.impuesto?.idImpuesto),
        bodegaId: requireNumber('bodega', factura.bodega?.idBodega),
        consecutivoId: requireNumber(
          'consecutivo',
          factura.consecutivo?.idConsecutivo
        ),
        empleadoId,
        estado: 'ANULADA' as const,
        porcentajeDescuento: requireNumber(
          'porcentaje de descuento',
          factura.porcentajeDescuento ?? 0
        ),
        tipoCambioUsado: requireNumber(
          'tipo de cambio',
          factura.tipoCambioUsado ?? 0
        ),
        comentario: factura.comentario ?? '',
        anulada: true,
        fechaAnulacion: new Date().toISOString(),
      };
      await patchFactura(Number(id), payload);
      toast.success('Factura anulada');
      await queryClient.invalidateQueries({
        queryKey: ['facturas'],
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: ['facturas.search'],
        exact: false,
      });
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo anular la factura';
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
        <DropdownMenuItem
          className="text-destructive"
          onClick={onDelete}
          disabled={isProcessing}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
