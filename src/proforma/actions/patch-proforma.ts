import { ProformaApi } from '../api/proforma.api';

export interface UpdateProformaPayload {
  idTramiteSeguro?: number;
  idMoneda?: number;
  idImpuesto?: number | null;
  fecha?: string | Date;
  observaciones?: string;
}

export const patchProformaAction = async (
  idProforma: number,
  payload: UpdateProformaPayload
) => {
  if (!Number.isFinite(idProforma)) throw new Error('ID de proforma inválido');
  const { data } = await ProformaApi.patch(`/${idProforma}`, payload);
  return data;
};
