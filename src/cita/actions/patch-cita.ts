import { citaApi } from '../api/cita.api';
import type { UpdateCitaPayload } from '../types/cita.interface';

export const patchCitaAction = async (
  id: number,
  payload: UpdateCitaPayload
) => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de cita inválido');
  }
  const { data } = await citaApi.patch(`/${id}`, payload);
  return data;
};

