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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { Edit, Eye, FileText, Trash2, Receipt } from '@/shared/icons';
import { useAuthStore } from '@/auth/store/auth.store';

import { patchFactura } from '../actions/patch-factura';
import { getFacturaReciboPdfAction } from '../actions/get-factura-recibo-pdf';
import { getFacturaPdfAction } from '../actions/get-factura-pdf';
import { downloadPdf } from '../utils/download-pdf';
import type { Factura } from '../types/Factura.interface';
import { FacturaEstado } from '@/shared/types/status';

interface Props {
  factura: Factura;
}

export default function FacturaRowActions({ factura }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const empleadoId = useAuthStore((state) => state.user?.empleado?.id ?? 1);
  const hasPdfAccess = useAuthStore((state) =>
    state.hasAnyRole(['gerente', 'vendedor'])
  );

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
    if (id) navigate(`/admin/facturas/${id}`);
  };

  const handleDownloadReciboPdf = async () => {
    if (isDownloadingPdf) return;
    const id = resolveFacturaId();
    if (!id) return;

    setIsDownloadingPdf(true);
    const dismiss = toast.loading('Generando PDF del recibo...');
    try {
      const blob = await getFacturaReciboPdfAction(Number(id));
      const filename = `recibo-${factura.codigoFactura || `FAC-${id}`}.pdf`;
      downloadPdf(blob, filename);
      toast.success('PDF del recibo descargado exitosamente');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo generar el PDF del recibo');
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadFacturaPdf = async () => {
    if (isDownloadingPdf) return;
    const id = resolveFacturaId();
    if (!id) return;

    setIsDownloadingPdf(true);
    const dismiss = toast.loading('Generando PDF de la factura...');
    try {
      const blob = await getFacturaPdfAction(Number(id));
      const filename = `factura-${factura.codigoFactura || `FAC-${id}`}.pdf`;
      downloadPdf(blob, filename);
      toast.success('PDF de la factura descargado exitosamente');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo generar el PDF de la factura');
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsDownloadingPdf(false);
    }
  };

  const onEdit = () => {
    const id = resolveFacturaId();
    if (id) navigate(`/admin/facturas/${id}/editar`);
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
        estado: FacturaEstado.ANULADA,
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
        {hasPdfAccess && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isDownloadingPdf}>
              <FileText className="mr-2 h-4 w-4" />
              Generar PDF
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={handleDownloadReciboPdf}
                disabled={isDownloadingPdf}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Descargar Recibo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadFacturaPdf}
                disabled={isDownloadingPdf}
              >
                <FileText className="mr-2 h-4 w-4" />
                Descargar Factura
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
