import { ProformaApi } from '../api/proforma.api';

export interface CreateProformaPayload {
  idTramiteSeguro: number;
  idMoneda: number;
  idImpuesto?: number | null;
  fecha?: string | Date;
  observaciones?: string;
}

export const postProformaAction = async (payload: CreateProformaPayload) => {
  if (!payload?.idTramiteSeguro || !payload?.idMoneda) {
    throw new Error('Faltan campos requeridos: idTramiteSeguro y idMoneda');
  }
  const { data } = await ProformaApi.post('/', payload);
  return data;
};
