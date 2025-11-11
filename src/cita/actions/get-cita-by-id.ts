import { citaApi } from '../api/cita.api';
import type { Cita } from '../types/cita.interface';

export const getCitaByIdAction = async (id: number): Promise<Cita> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de cita inválido');
  }

  try {
    const { data } = await citaApi.get<Cita>(`/${id}`);

    if (!data) {
      throw new Error('No se encontró la cita solicitada');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener la cita');
  }
};

