import { impuestoApi } from '../api/impuesto.api';
import type { Impuesto } from '../types/impuesto.interface';

export const getImpuestoById = async (id: number) => {
  const { data } = await impuestoApi.get<Impuesto>(`/${id}`);
  return data;
};

