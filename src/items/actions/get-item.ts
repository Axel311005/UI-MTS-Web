import { itemApi } from '../api/item.api';
import type { ItemResponse } from '../types/item.response';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getItemAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await itemApi.get<ItemResponse[] | PaginatedResponse<ItemResponse>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  // Si el backend devuelve un objeto con data y total, lo retornamos así
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    return data as PaginatedResponse<ItemResponse>;
  }

  // Si devuelve directamente un array, lo envuelvemos
  return {
    data: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<ItemResponse>;
};
