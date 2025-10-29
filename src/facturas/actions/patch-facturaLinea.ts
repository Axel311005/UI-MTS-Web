import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateFacturaLineaPayload {
  id?: number;
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
    const url = payload.id ? `/factura-linea/${payload.id}` : '/factura-linea';
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
