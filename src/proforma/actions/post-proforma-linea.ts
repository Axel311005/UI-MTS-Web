import { ProformaLineasApi } from '../api/proforma-lineas.api';

export interface CreateProformaLineaPayload {
  idProforma: number;
  idItem: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea?: number; // Opcional, se calcula si no se proporciona
}

export const postProformaLineaAction = async (
  payload: CreateProformaLineaPayload
) => {
  if (!payload?.idProforma || !payload?.idItem) {
    throw new Error('Faltan campos requeridos: idProforma e idItem');
  }
  // Calcular totalLinea si no se proporciona
  const totalLinea = payload.totalLinea ?? (payload.cantidad * payload.precioUnitario);
  
  const cleanPayload = {
    idProforma: payload.idProforma,
    idItem: payload.idItem,
    cantidad: payload.cantidad,
    precioUnitario: payload.precioUnitario,
    totalLinea: totalLinea,
  };
  
  const { data } = await ProformaLineasApi.post('/', cleanPayload);
  return data;
};
