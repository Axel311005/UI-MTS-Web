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
    const paged = data as PaginatedResponse<ItemResponse>;
    // Ordenar por fecha de creación DESC (más recientes primero)
    paged.data.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion || 0).getTime();
      const dateB = new Date(b.fechaCreacion || 0).getTime();
      return dateB - dateA; // DESC
    });
    return paged;
  }

  // Si devuelve directamente un array, aplicar paginación si se especificó
  const allItems = Array.isArray(data) ? data : [];
  // Ordenar por fecha de creación DESC (más recientes primero)
  allItems.sort((a, b) => {
    const dateA = new Date(a.fechaCreacion || 0).getTime();
    const dateB = new Date(b.fechaCreacion || 0).getTime();
    return dateB - dateA; // DESC
  });
  const total = allItems.length;
  
  // Aplicar paginación si se especificó
  let paginatedData = allItems;
  if (params?.limit !== undefined || params?.offset !== undefined) {
    const start = params?.offset ?? 0;
    const end = params?.limit !== undefined ? start + params.limit : undefined;
    paginatedData = allItems.slice(start, end);
  }
  
  return {
    data: paginatedData,
    total: total,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<ItemResponse>;
};
