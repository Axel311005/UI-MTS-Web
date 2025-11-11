import { monedaApi } from '../api/moneda.api';
import type { Moneda } from '../types/Moneda.interface';

export const getMonedaById = async (id: number) => {
  const { data } = await monedaApi.get<Moneda>(`/${id}`);
  return data;
};

