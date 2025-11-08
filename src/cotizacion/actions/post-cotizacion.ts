import { cotizacionApi } from '../api/cotizacion.api';
import type { CreateCotizacionPayload } from '../types/cotizacion.interface';

export const postCotizacionAction = async (payload: CreateCotizacionPayload) => {
  if (!payload?.idCliente || !payload?.idConsecutivo) {
    throw new Error('Faltan campos requeridos: idCliente e idConsecutivo');
  }
  const { data } = await cotizacionApi.post('/', payload);
  return data;
};

