import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';

export const getFacturasAction = async () => {
  const { data: facturas } = await facturaApi.get<Factura[]>('/');

  return facturas;
};
