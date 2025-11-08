import { cotizacionApi } from '../api/cotizacion.api';
import type { UpdateCotizacionPayload } from '../types/cotizacion.interface';

export const patchCotizacionAction = async (
  id: number,
  payload: UpdateCotizacionPayload
) => {
  if (!id) {
    throw new Error('ID de cotización inválido');
  }
  const { data } = await cotizacionApi.patch(`/${id}`, payload);
  return data;
};

