import { motivoCitaApi } from '../api/motivo-cita.api';
import type { UpdateMotivoCitaPayload, MotivoCita } from '../types/motivo-cita.interface';

export const patchMotivoCitaAction = async (
  id: number,
  payload: UpdateMotivoCitaPayload
): Promise<MotivoCita> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de motivo de cita inválido');
  }
  const { data } = await motivoCitaApi.patch<MotivoCita>(`/${id}`, payload);
  return data;
};

