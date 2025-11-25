import { tallerApi } from '@/shared/api/tallerApi';
import { EstadoActivo } from '@/shared/types/status';

export interface CreateClientePayload {
  primerNombre: string | null;
  primerApellido: string | null;
  ruc: string | null;
  esExonerado: boolean;
  porcentajeExonerado: number;
  direccion: string;
  telefono: string;
  activo: EstadoActivo;
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
    throw new Error('No se recibió un id de cliente válido');
  }

  return { clienteId, raw: data };
};
