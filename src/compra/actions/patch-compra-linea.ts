import { compraLineaApi } from '../api/compra-linea.api';
import type { CreateCompraLineaPayload } from './post-compra-linea';

type RawResponse = Record<string, any>;

export const patchCompraLinea = async (
  id: number,
  payload: Partial<CreateCompraLineaPayload>
) => {
  const { data } = await compraLineaApi.patch<RawResponse>(`/${id}`, payload);
  const compraLineaId = Number(
    data?.idCompraLinea ?? data?.id_compra_linea ?? data?.id ?? data?.Id
  );
  if (!Number.isFinite(compraLineaId)) {
    throw new Error('No se recibió un id de compra línea válido');
  }
  return { compraLineaId, raw: data };
};


