import { compraApi } from '../api/compra.api';
import type { CreateCompraPayload } from './post-compra';

type RawResponse = Record<string, any>;

export const patchCompra = async (id: number, payload: Partial<CreateCompraPayload> & { anulado?: boolean }) => {
  const { data } = await compraApi.patch<RawResponse>(`/${id}`, payload);
  const compraId = Number(data?.idCompra ?? data?.id_compra ?? data?.id ?? data?.Id);
  if (!Number.isFinite(compraId)) {
    // eslint-disable-next-line no-console
    console.error('[patchCompra] Respuesta inesperada:', data);
    throw new Error('No se recibió un id de compra válido');
  }
  return { compraId, raw: data };
};


