import { cotizacionApi } from '../api/cotizacion.api';
import type { Cotizacion } from '../types/cotizacion.interface';

export const getCotizacionByIdAction = async (id: number): Promise<Cotizacion> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de cotización inválido');
  }

  try {
    const { data } = await cotizacionApi.get<Cotizacion>(`/${id}`);

    if (!data) {
      throw new Error('No se encontró la cotización solicitada');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener la cotización');
  }
};

