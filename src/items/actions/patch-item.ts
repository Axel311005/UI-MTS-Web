import { itemApi } from '../api/item.api';
import type { CreateItemPayload } from './post-item';

export type UpdateItemPayload = CreateItemPayload;

export const patchItem = async (id: number, payload: UpdateItemPayload) => {
  const { data } = await itemApi.patch(`/` + id, payload);
  return data;
};
