import { bodegaApi } from '../api/bodega.api';
import type { Bodega } from '../types/bodega.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getBodegasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await bodegaApi.get<Bodega[] | PaginatedResponse<Bodega>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar bodegas activas también en respuestas paginadas
    const filtered = (data as PaginatedResponse<Bodega>).data.filter((b) => b.activo === 'ACTIVO');
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<Bodega>;
  }

  const filtered = Array.isArray(data) ? (data || []).filter((b) => b.activo === 'ACTIVO') : [];
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<Bodega>;
};
