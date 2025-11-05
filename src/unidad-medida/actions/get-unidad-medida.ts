import { UnidadMedidaApi } from '../api/unidadMedida.api';
import type { UnidadMedida } from '../types/unidadMedida.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getUnidadMedidasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await UnidadMedidaApi.get<UnidadMedida[] | PaginatedResponse<UnidadMedida>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar unidades de medida activas también en respuestas paginadas
    const filtered = (data as PaginatedResponse<UnidadMedida>).data.filter((item) => item?.activo !== false);
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<UnidadMedida>;
  }

  // Si viene como array simple, filtrar activos y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  const filtered = allItems.filter((item) => item?.activo !== false);
  const total = filtered.length;
  
  // Aplicar paginación si se especificó
  let paginatedData = filtered;
  if (params?.limit !== undefined || params?.offset !== undefined) {
    const start = params?.offset ?? 0;
    const end = params?.limit !== undefined ? start + params.limit : undefined;
    paginatedData = filtered.slice(start, end);
  }
  
  return {
    data: paginatedData,
    total: total,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<UnidadMedida>;
};
