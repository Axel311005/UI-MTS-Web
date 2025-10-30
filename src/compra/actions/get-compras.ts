import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';

export const getComprasAction = async () => {
  const { data } = await compraApi.get<Compra[]>('/');
  // Asumimos que el endpoint devuelve todas; el filtro de activas lo haremos en capa UI
  return data;
};


