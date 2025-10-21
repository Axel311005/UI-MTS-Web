import { consecutivoApi } from '../api/item.api';
import type { ItemResponse } from '../types/item.response';

export const getItemAction = async () => {
  const { data: items } = await consecutivoApi.get<ItemResponse[]>('/');

  return items;
};
