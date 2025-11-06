import { ProformaLineasApi } from '../api/proforma-lineas.api';

export interface CreateProformaLineaPayload {
  idProforma: number;
  idItem: number;
  cantidad: number;
  precioUnitario: number;
}

export const postProformaLineaAction = async (
  payload: CreateProformaLineaPayload
) => {
  if (!payload?.idProforma || !payload?.idItem) {
    throw new Error('Faltan campos requeridos: idProforma e idItem');
  }
  const { data } = await ProformaLineasApi.post('/', payload);
  return data;
};
