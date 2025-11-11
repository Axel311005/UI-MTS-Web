import { itemApi } from '../api/item.api';
import type { ItemResponse } from '../types/item.response';

export const getItemById = async (id: number) => {
  const { data } = await itemApi.get<ItemResponse>(`/${id}`);
  return data;
};
