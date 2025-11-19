import { UnidadMedidaApi } from '../api/unidadMedida.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateUnidadMedidaPayload {
  descripcion?: string;
  activo?: EstadoActivo;
}

type RawPatchUnidadMedidaResponse = Record<string, any> | null | undefined;

export const patchUnidadMedida = async (
  id: number,
  payload: UpdateUnidadMedidaPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de unidad de medida inválido');
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
      'No se proporcionaron datos para actualizar la unidad de medida'
    );
  }

  const { data } = await UnidadMedidaApi.patch<RawPatchUnidadMedidaResponse>(
    `/${id}`,
    body
  );

  const unidadMedidaId = Number(
    (data as any)?.idUnidadMedida ??
      (data as any)?.id_unidad_medida ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(unidadMedidaId)) {
    throw new Error('No se pudo actualizar la unidad de medida');
  }

  return { unidadMedidaId, raw: data };
};
