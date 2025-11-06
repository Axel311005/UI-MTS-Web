import { ProformaLineasApi } from '../api/proforma-lineas.api';

export interface UpdateProformaLineaPayload {
  idProforma?: number;
  idItem?: number;
  cantidad?: number;
  precioUnitario?: number;
  totalLinea?: number;
}

export const patchProformaLineaAction = async (
  idProformaLineas: number,
  payload: UpdateProformaLineaPayload
) => {
  if (!Number.isFinite(idProformaLineas))
    throw new Error('ID de línea inválido');
  const { data } = await ProformaLineasApi.patch(
    `/${idProformaLineas}`,
    payload
  );
  return data;
};
