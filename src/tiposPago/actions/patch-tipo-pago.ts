import { tipoPagoApi } from '../api/tipoPago.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateTipoPagoPayload {
  descripcion?: string;
  activo?: EstadoActivo;
}

type RawPatchTipoPagoResponse = Record<string, any> | null | undefined;

export const patchTipoPago = async (
  id: number,
  payload: UpdateTipoPagoPayload
) => {
  if (!Number.isFinite(id)) {
    throw new Error('ID de tipo de pago inválido');
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
      'No se proporcionaron datos para actualizar el tipo de pago'
    );
  }

  const { data } = await tipoPagoApi.patch<RawPatchTipoPagoResponse>(
    `/${id}`,
    body
  );

  const tipoPagoId = Number(
    (data as any)?.idTipoPago ??
      (data as any)?.id_tipo_pago ??
      (data as any)?.id ??
      id
  );

  if (!Number.isFinite(tipoPagoId)) {
    throw new Error('No se pudo actualizar el tipo de pago');
  }

  return { tipoPagoId, raw: data };
};
