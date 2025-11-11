import { tallerApi } from '@/shared/api/tallerApi';

export interface CreateFacturaLineaPayload {
  facturaId: number;
  itemId: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export const postFacturaLinea = async (payload: CreateFacturaLineaPayload) => {
  // Backend contract requires EXACT camelCase fields only
  const body = {
    facturaId: Number(payload.facturaId),
    itemId: Number(payload.itemId),
    cantidad: Number(payload.cantidad),
    precioUnitario: Number(payload.precioUnitario),
    totalLinea: Number(payload.totalLinea),
  } as const;
  try {
    // eslint-disable-next-line no-console
    console.log('[postFacturaLinea] sending body:', body);
    const { data } = await tallerApi.post('/factura-linea', body);
    // eslint-disable-next-line no-console
    console.log('Factura linea creada:', data);
    return data;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[postFacturaLinea] error:', {
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
};
