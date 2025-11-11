import { RecepcionSeguimientoApi } from '../api/recepcion-seguimiento.api';
import type { RecepcionSeguimientoEstado } from '@/shared/types/status';

export interface UpdateRecepcionSeguimientoPayload {
  idRecepcion?: number;
  fecha?: string | Date;
  estado?: RecepcionSeguimientoEstado;
  descripcion?: string;
}

export const patchRecepcionSeguimientoAction = async (
  id: number,
  payload: UpdateRecepcionSeguimientoPayload
) => {
  const { data } = await RecepcionSeguimientoApi.patch(`/${id}`, payload);
  return data;
};

