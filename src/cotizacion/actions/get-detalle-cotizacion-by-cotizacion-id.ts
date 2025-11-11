import { detalleCotizacionApi } from '../api/detalle-cotizacion.api';
import type { DetalleCotizacion } from '../types/detalle-cotizacion.interface';

export const getDetalleCotizacionByCotizacionIdAction = async (
  idCotizacion: number
): Promise<DetalleCotizacion[]> => {
  if (!Number.isFinite(idCotizacion) || idCotizacion <= 0) {
    throw new Error('ID de cotización inválido');
  }
  try {
    // Obtener todos los detalles y filtrar por idCotizacion en el cliente
    // ya que el backend puede no soportar filtrar por idCotizacion directamente
    const { data } = await detalleCotizacionApi.get<DetalleCotizacion[]>('/');
    const allDetalles = Array.isArray(data) ? data : [];
    // Filtrar los detalles que pertenecen a esta cotización
    return allDetalles.filter(
      (detalle) => detalle.cotizacion?.idCotizacion === idCotizacion
    );
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('No se pudieron obtener los detalles de la cotización');
  }
};

