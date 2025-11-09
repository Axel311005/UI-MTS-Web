import { landingSeguimientoApi } from '../api/landing.api';
import type { SeguimientoRecepcion } from '../types/seguimiento.types';

export const getSeguimientoByCodigo = async (
  codigoRecepcion: string
): Promise<SeguimientoRecepcion> => {
  const { data } = await landingSeguimientoApi.get<SeguimientoRecepcion>(
    `/public/${codigoRecepcion}`
  );
  return data;
};

