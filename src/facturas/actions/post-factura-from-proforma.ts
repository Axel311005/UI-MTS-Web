import { facturaApi } from '../api/factura.api';

// Acción para crear una factura a partir de una proforma
export const postFacturaFromProformaAction = async (
  payload: Record<string, any>
) => {
  if (!payload || typeof payload !== 'object')
    throw new Error('Payload inválido');
  const { data } = await facturaApi.post('/from-proforma', payload);
  return data;
};
