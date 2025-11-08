import { motivoCitaApi } from '../api/motivo-cita.api';
import type { CreateMotivoCitaPayload, MotivoCita } from '../types/motivo-cita.interface';

export const postMotivoCitaAction = async (
  payload: CreateMotivoCitaPayload
): Promise<MotivoCita> => {
  if (!payload?.descripcion || payload.descripcion.trim() === '') {
    throw new Error('La descripción del motivo de cita es requerida');
  }
  const { data } = await motivoCitaApi.post<MotivoCita>('/', payload);
  return data;
};

