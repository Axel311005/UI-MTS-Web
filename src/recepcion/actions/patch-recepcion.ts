import { RecepcionApi } from '../api/recepcion.api';
import { RecepcionEstado } from '@/shared/types/status';

export interface UpdateRecepcionPayload {
  idVehiculo?: number;
  idEmpleado?: number;
  fechaRecepcion?: string | Date;
  observaciones?: string;
  estado?: RecepcionEstado;
  fechaEntregaEstimada?: string | Date;
  fechaEntregaReal?: string | Date | null;
}

export const patchRecepcionAction = async (
  idRecepcion: number,
  payload: UpdateRecepcionPayload
) => {
  if (!Number.isFinite(idRecepcion))
    throw new Error('ID de recepción inválido');
  const { data } = await RecepcionApi.patch(`/${idRecepcion}`, payload);
  return data;
};
