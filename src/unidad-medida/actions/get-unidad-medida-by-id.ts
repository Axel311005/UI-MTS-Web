import { UnidadMedidaApi } from '../api/unidadMedida.api';
import type { UnidadMedida } from '../types/unidadMedida.interface';

export const getUnidadMedidaById = async (id: number) => {
  const { data } = await UnidadMedidaApi.get<UnidadMedida>(`/${id}`);
  return data;
};

