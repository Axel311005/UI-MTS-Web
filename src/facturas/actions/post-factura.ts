import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateFacturaPayload {
  clienteId: number;
  tipoPagoId: number;
  monedaId: number;
  impuestoId: number;
  bodegaId: number;
  consecutivoId: number;
  empleadoId: number;
  proformaId?: number | null;
  recepcionId?: number | null;
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADA';
  porcentajeDescuento: number;
  tipoCambioUsado: number;
  comentario: string;
  anulada?: boolean;
  fechaAnulacion?: string | null;
}

// No confíes en un solo nombre; el backend puede cambiarlo
type RawCreateFacturaResponse = Record<string, any>;

/** Devuelve { facturaId, raw } para que arriba no dependas del nombre exacto */
export const postFactura = async (payload: CreateFacturaPayload) => {
  const { data } = await tallerApi.post<RawCreateFacturaResponse>(
    '/factura',
    payload
  );

  const facturaId = Number(
    data?.idFactura ?? data?.id_factura ?? data?.id ?? data?.Id
  );

  if (!Number.isFinite(facturaId)) {
    // log opcional para ver exactamente qué llegó
    // eslint-disable-next-line no-console
    console.error('[postFactura] Respuesta inesperada:', data);
    throw new Error('No se recibió un id de factura válido');
  }

  return { facturaId, raw: data };
};
