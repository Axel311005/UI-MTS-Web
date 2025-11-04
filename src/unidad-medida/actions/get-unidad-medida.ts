import { UnidadMedidaApi } from '../api/unidadMedida.api';
import type { UnidadMedida } from '../types/unidadMedida.interface';

export const getUnidadMedidasAction = async () => {
  const { data } = await UnidadMedidaApi.get<UnidadMedida[]>('/');
  const items = Array.isArray(data) ? data : [];
  return items.filter((item) => item?.activo !== false);
};
