import { AseguradoraApi } from '../api/aseguradora.api';
import type { Aseguradora } from '../types/aseguradora.interface';

export const getAseguradoraByIdAction = async (id: number) => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('ID de aseguradora inválido');
  }

  const { data } = await AseguradoraApi.get<Aseguradora>(`/${id}`);
  return data;
};
