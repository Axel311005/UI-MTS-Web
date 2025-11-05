import { clasificacionItemApi } from '../api/clasificacionItem.api';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getClasificacionItemsAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await clasificacionItemApi.get<ClasificacionItem[] | PaginatedResponse<ClasificacionItem>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar clasificaciones activas también en respuestas paginadas
    const filtered = (data as PaginatedResponse<ClasificacionItem>).data.filter((item) => item?.activo !== false);
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<ClasificacionItem>;
  }

  const items = Array.isArray(data) ? data : [];
  const filtered = items.filter((item) => item?.activo !== false);
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<ClasificacionItem>;
};
