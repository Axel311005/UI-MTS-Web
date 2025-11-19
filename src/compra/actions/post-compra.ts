import { compraApi } from '../api/compra.api';

export interface CreateCompraPayload {
  monedaId: number;
  tipoPagoId: number;
  impuestoId: number;
  bodegaId: number;
  consecutivoId: number;
  empleadoId: number;
  estado: 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
  porcentajeDescuento: number;
  tipoCambioUsado: number;
  comentario: string;
}

type RawCreateCompraResponse = Record<string, any>;

export const postCompra = async (payload: CreateCompraPayload) => {
  const { data } = await compraApi.post<RawCreateCompraResponse>('/', payload);

  const compraId = Number(
    data?.idCompra ?? data?.id_compra ?? data?.id ?? data?.Id
  );

  if (!Number.isFinite(compraId)) {
    throw new Error('No se recibió un id de compra válido');
  }

  return { compraId, raw: data };
};


