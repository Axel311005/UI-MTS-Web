import { facturaApi } from '../api/factura.api';

export const getFacturaPdfAction = async (id: number): Promise<Blob> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de factura inválido');
  }

  try {
    const { data } = await facturaApi.get(`/${id}/factura-recibo-pdf`, {
      responseType: 'blob',
    });

    if (!data) {
      throw new Error('No se pudo obtener el PDF de la factura');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener el PDF de la factura');
  }
};
