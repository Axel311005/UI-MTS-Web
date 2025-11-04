import { clasificacionItemApi } from '../api/clasificacionItem.api';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';

export const getClasificacionItemsAction = async () => {
  const { data } = await clasificacionItemApi.get<ClasificacionItem[]>('/');
  const items = Array.isArray(data) ? data : [];
  return items.filter((item) => item?.activo !== false);
};
