import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateFacturaLineaPayload {
  id: number; // requerido para PATCH
  facturaId: number;
  itemId: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export const patchFacturaLinea = async (payload: CreateFacturaLineaPayload) => {
  // Backend contract requires EXACT camelCase fields only
  const body = {
    facturaId: Number(payload.facturaId),
    itemId: Number(payload.itemId),
    cantidad: Number(payload.cantidad),
    precioUnitario: Number(payload.precioUnitario),
    totalLinea: Number(payload.totalLinea),
  } as const;
  try {
    console.log('[patchFacturaLinea] sending body:', body);
    if (!payload.id) {
      throw new Error('patchFacturaLinea: id es requerido para actualizar');
    }
    const url = `/factura-linea/${payload.id}`;
    const { data } = await tallerApi.patch(url, body);

    console.log('Factura linea editada:', data);
    return data;
  } catch (err: any) {
    console.error('[patchFacturaLinea] error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
};
