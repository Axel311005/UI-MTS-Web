import { monedaApi } from '../api/moneda.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateMonedaPayload {
  descripcion?: string;
  tipoCambio?: number;
  activo?: EstadoActivo;
}

type RawPatchMonedaResponse = Record<string, any> | null | undefined;

export const patchMoneda = async (
  id: number,
  payload: UpdateMonedaPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de moneda inválido');
  }

  const body: Record<string, unknown> = {};

  if (typeof payload.descripcion === 'string') {
    const trimmed = payload.descripcion.trim();
    if (trimmed.length > 0) {
      body.descripcion = trimmed;
    }
  }

  if (typeof payload.tipoCambio === 'number') {
    body.tipoCambio = payload.tipoCambio;
  }

  if (payload.activo) {
    body.activo = payload.activo;
  }

  if (Object.keys(body).length === 0) {
    throw new Error('No se proporcionaron datos para actualizar la moneda');
  }

  const { data } = await monedaApi.patch<RawPatchMonedaResponse>(`/${id}`, body);

  const monedaId = Number(
    (data as any)?.idMoneda ??
      (data as any)?.id_moneda ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(monedaId)) {
    // eslint-disable-next-line no-console
    console.error('[patchMoneda] Respuesta inesperada:', data);
    throw new Error('No se pudo actualizar la moneda');
  }

  return { monedaId, raw: data };
};

