import { itemApi } from '../api/item.api';
import type { ItemResponse } from '../types/item.response';

export const getItemAction = async () => {
  const { data: items } = await itemApi.get<ItemResponse[]>('/');

  return items;
};
