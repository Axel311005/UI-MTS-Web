import { compraLineaApi } from '../api/compra-linea.api';

export interface CreateCompraLineaPayload {
  compraId: number;
  itemId: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

type RawCreateResponse = Record<string, any>;

export const postCompraLinea = async (payload: CreateCompraLineaPayload) => {
  const { data } = await compraLineaApi.post<RawCreateResponse>('/', payload);
  const compraLineaId = Number(
    data?.idCompraLinea ?? data?.id_compra_linea ?? data?.id ?? data?.Id
  );
  if (!Number.isFinite(compraLineaId)) {
    // eslint-disable-next-line no-console
    console.error('[postCompraLinea] Respuesta inesperada:', data);
    throw new Error('No se recibió un id de compra línea válido');
  }
  return { compraLineaId, raw: data };
};


