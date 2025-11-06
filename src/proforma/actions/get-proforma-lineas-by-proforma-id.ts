import { ProformaLineasApi } from '../api/proforma-lineas.api';
import type { ProformaLinea } from '../types/proforomaLinea.interface';

export const getProformaLineasByProformaIdAction = async (
  idProforma: number
): Promise<ProformaLinea[]> => {
  if (!Number.isFinite(idProforma) || idProforma <= 0) {
    throw new Error('ID de proforma inválido');
  }
  try {
    // Obtener todas las líneas y filtrar por idProforma en el cliente
    // ya que el backend no soporta filtrar por idProforma directamente
    const { data } = await ProformaLineasApi.get<ProformaLinea[]>('/');
    const allLineas = Array.isArray(data) ? data : [];
    // Filtrar las líneas que pertenecen a esta proforma
    return allLineas.filter(
      (linea) => linea.proforma?.idProforma === idProforma
    );
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('No se pudieron obtener las líneas de la proforma');
  }
};
