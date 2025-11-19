import { tallerApi } from '@/shared/api/tallerApi';
import type { CreateClientePayload } from './post-cliente';

export type UpdateClientePayload = CreateClientePayload;

type RawUpdateClienteResponse = Record<string, any>;

export const patchCliente = async (
  id: number,
  payload: UpdateClientePayload
) => {
  const { data } = await tallerApi.patch<RawUpdateClienteResponse>(
    `/cliente/${id}`,
    payload
  );

  const clienteId = Number(
    data?.idCliente ?? data?.id_cliente ?? data?.id ?? id
  );

  if (!Number.isFinite(clienteId)) {
    throw new Error('No se pudo confirmar la actualización del cliente');
  }

  return { clienteId, raw: data };
};
