import { ProformaLineasApi } from '../api/proforma-lineas.api';
import type { ProformaLinea } from '../types/proforomaLinea.interface';

export const getProformaLineaByIdAction = async (
  idProformaLineas: number
): Promise<ProformaLinea> => {
  if (!Number.isFinite(idProformaLineas) || idProformaLineas <= 0) {
    throw new Error('ID de línea de proforma inválido');
  }
  try {
    const { data } = await ProformaLineasApi.get<ProformaLinea>(
      `/${idProformaLineas}`
    );
    if (!data) throw new Error('No se encontró la línea de proforma');
    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('No se pudo obtener la línea de proforma');
  }
};

