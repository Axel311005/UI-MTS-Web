import { RecepcionApi } from '../api/recepcion.api';
import type { Recepcion } from '../types/recepcion.interface';

export const getRecepcionByIdAction = async (
  idRecepcion: number
): Promise<Recepcion> => {
  if (!Number.isFinite(idRecepcion) || idRecepcion <= 0) {
    throw new Error('ID de recepción inválido');
  }

  try {
    const { data } = await RecepcionApi.get<Recepcion>(`/${idRecepcion}`);

    if (!data) {
      throw new Error('No se encontró la recepción solicitada');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener la recepción');
  }
};
