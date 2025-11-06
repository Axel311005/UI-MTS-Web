import { ProformaApi } from '../api/proforma.api';
import type { Proforma } from '../types/proforoma.interface';

export const getProformaByIdAction = async (
  idProforma: number
): Promise<Proforma> => {
  if (!Number.isFinite(idProforma) || idProforma <= 0) {
    throw new Error('ID de proforma inválido');
  }
  try {
    const { data } = await ProformaApi.get<Proforma>(`/${idProforma}`);
    if (!data) throw new Error('No se encontró la proforma');
    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('No se pudo obtener la proforma');
  }
};
