import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateClientePayload {
  nombre: string;
  ruc: string;
  esExonerado: boolean;
  porcentajeExonerado: number;
  direccion: string;
  telefono: string;
  activo: boolean;
  notas: string;
}

type RawCreateClienteResponse = Record<string, any>;

export const postCliente = async (payload: CreateClientePayload) => {
  const { data } = await tallerApi.post<RawCreateClienteResponse>(
    '/cliente',
    payload
  );

  const clienteId = Number(
    data?.idCliente ?? data?.id_cliente ?? data?.id ?? data?.Id
  );

  if (!Number.isFinite(clienteId)) {
    // eslint-disable-next-line no-console
    console.error('[postCliente] Respuesta inesperada:', data);
    throw new Error('No se recibió un id de cliente válido');
  }

  return { clienteId, raw: data };
};
