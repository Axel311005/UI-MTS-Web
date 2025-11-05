import { clasificacionItemApi } from '../api/clasificacionItem.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateClasificacionItemPayload {
  descripcion?: string;
  activo?: EstadoActivo;
}

type RawPatchClasificacionItemResponse = Record<string, any> | null | undefined;

export const patchClasificacionItem = async (
  id: number,
  payload: UpdateClasificacionItemPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de clasificación inválido');
  }

  const body: Record<string, unknown> = {};

  if (typeof payload.descripcion === 'string') {
    const trimmed = payload.descripcion.trim();
    if (trimmed.length > 0) {
      body.descripcion = trimmed;
    }
  }

  if (payload.activo) {
    body.activo = payload.activo;
  }

  if (Object.keys(body).length === 0) {
    throw new Error(
      'No se proporcionaron datos para actualizar la clasificación'
    );
  }

  const { data } =
    await clasificacionItemApi.patch<RawPatchClasificacionItemResponse>(
      `/${id}`,
      body
    );

  const clasificacionId = Number(
    (data as any)?.idClasificacion ??
      (data as any)?.id_clasificacion ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(clasificacionId)) {
    // eslint-disable-next-line no-console
    console.error('[patchClasificacionItem] Respuesta inesperada:', data);
    throw new Error('No se pudo actualizar la clasificación');
  }

  return { clasificacionId, raw: data };
};
