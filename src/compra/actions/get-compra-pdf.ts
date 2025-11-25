import { compraApi } from '../api/compra.api';

export const getCompraPdfAction = async (id: number): Promise<Blob> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de compra inválido');
  }

  try {
    const { data } = await compraApi.get(`/report/compras/${id}`, {
      responseType: 'blob',
    });

    if (!data) {
      throw new Error('No se pudo obtener el PDF de la compra');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener el PDF de la compra');
  }
};

