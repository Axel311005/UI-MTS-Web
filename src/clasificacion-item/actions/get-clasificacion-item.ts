import { clasificacionItemApi } from "../api/clasificacionItem.api";
import type { ClasificacionItem } from "../types/clasificacionItem.interface";


export const getClasificacionItemsAction = async () => {
  const { data: clasificacionItems } = await clasificacionItemApi.get<ClasificacionItem[]>('/');

  return clasificacionItems;
};
