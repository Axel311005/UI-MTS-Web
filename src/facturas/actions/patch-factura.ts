import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateFacturaPayload {
  clienteId: number;
  tipoPagoId: number;
  monedaId: number;
  impuestoId: number;
  bodegaId: number;
  consecutivoId: number;
  empleadoId: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADA';
  porcentajeDescuento: number;
  tipoCambioUsado: number;
  comentario: string;
  anulada?: boolean;
  fechaAnulacion?: string | null;
}

// No confíes en un solo nombre; el backend puede cambiarlo
type RawCreateFacturaResponse = Record<string, any>;

export const patchFactura = async (
  id: number,
  payload: CreateFacturaPayload
) => {
  // Most backends expect the id in the URL for PATCH (e.g., /factura/:id)
  const { data } = await tallerApi.patch<RawCreateFacturaResponse>(
    `/factura/${id}`,
    payload
  );

  const facturaId = Number(
    data?.idFactura ?? data?.id_factura ?? data?.id ?? data?.Id
  );

  if (!Number.isFinite(facturaId)) {
    console.error('[patchFactura] Respuesta inesperada:', data);
    throw new Error('No se recibió un id de factura válido');
  }

  return { facturaId, raw: data };
};
