import { cotizacionApi } from '../api/cotizacion.api';
import type { Cotizacion } from '../types/cotizacion.interface';

export const getCotizacionByIdAction = async (id: number): Promise<Cotizacion> => {
  const { data } = await cotizacionApi.get<Cotizacion>(`/${id}`);
  return data;
};

