import { citaApi } from '../api/cita.api';
import type { Cita } from '../types/cita.interface';

export const getCitaByIdAction = async (id: number): Promise<Cita> => {
  const { data } = await citaApi.get<Cita>(`/${id}`);
  return data;
};

