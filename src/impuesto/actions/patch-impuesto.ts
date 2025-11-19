import { impuestoApi } from '../api/impuesto.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateImpuestoPayload {
  descripcion?: string;
  porcentaje?: number;
  activo?: EstadoActivo;
}

type RawPatchImpuestoResponse = Record<string, any> | null | undefined;

export const patchImpuesto = async (
  id: number,
  payload: UpdateImpuestoPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de impuesto inválido');
  }

  const body: Record<string, unknown> = {};

  if (typeof payload.descripcion === 'string') {
    const trimmed = payload.descripcion.trim();
    if (trimmed.length > 0) {
      body.descripcion = trimmed;
    }
  }

  if (typeof payload.porcentaje === 'number') {
    body.porcentaje = payload.porcentaje;
  }

  if (payload.activo) {
    body.activo = payload.activo;
  }

  if (Object.keys(body).length === 0) {
    throw new Error('No se proporcionaron datos para actualizar el impuesto');
  }

  const { data } = await impuestoApi.patch<RawPatchImpuestoResponse>(`/${id}`, body);

  const impuestoId = Number(
    (data as any)?.idImpuesto ??
      (data as any)?.id_impuesto ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(impuestoId)) {
    throw new Error('No se pudo actualizar el impuesto');
  }

  return { impuestoId, raw: data };
};

