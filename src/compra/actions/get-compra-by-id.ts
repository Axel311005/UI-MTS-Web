import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';

export const getCompraById = async (id: number) => {
  const { data } = await compraApi.get<Compra>(`/${id}`);
  return data;
};


