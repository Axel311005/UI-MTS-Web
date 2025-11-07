import { RecepcionSeguimientoApi } from '../api/recepcion-seguimiento.api';
import type { RecepcionSeguimiento } from '../types/recepcion-seguimiento.interface';

export const getRecepcionSeguimientoByIdAction = async (
  id: number
): Promise<RecepcionSeguimiento> => {
  const { data } = await RecepcionSeguimientoApi.get<RecepcionSeguimiento>(
    `/${id}`
  );
  return data;
};

