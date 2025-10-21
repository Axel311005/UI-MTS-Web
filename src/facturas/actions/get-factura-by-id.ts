import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';

export const getFacturaById = async (id: number) => {
  const { data } = await facturaApi.get<Factura>(`/${id}`);
  return data;
};
