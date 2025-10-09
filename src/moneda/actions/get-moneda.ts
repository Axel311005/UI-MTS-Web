import { monedaApi } from '../api/moneda.api';
import type { Moneda } from '../types/Moneda.interface';

export const getMonedasAction = async () => {
  const { data: monedas } = await monedaApi.get<Moneda[]>('/');

  return monedas;
};
