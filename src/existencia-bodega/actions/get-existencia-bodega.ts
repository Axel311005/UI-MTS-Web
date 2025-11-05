import { existenciaBodegaApi } from "../api/existenciaBodega.api";
import type { ExistenciaBodega } from "../types/existenciaBodega.interface";
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getExistenciaBodegasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await existenciaBodegaApi.get<ExistenciaBodega[] | PaginatedResponse<ExistenciaBodega>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar existencias donde item y bodega estén activos
    const filtered = (data as PaginatedResponse<ExistenciaBodega>).data.filter((existencia) => {
      const itemActivo = existencia.item?.activo !== false;
      const bodegaActiva = existencia.bodega?.activo === true || existencia.bodega?.activo === 'ACTIVO';
      return itemActivo && bodegaActiva;
    });
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<ExistenciaBodega>;
  }

  const items = Array.isArray(data) ? data : [];
  // Filtrar existencias donde item y bodega estén activos
  const filtered = items.filter((existencia) => {
    const itemActivo = existencia.item?.activo !== false;
    const bodegaActiva = existencia.bodega?.activo === true || existencia.bodega?.activo === 'ACTIVO';
    return itemActivo && bodegaActiva;
  });
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<ExistenciaBodega>;
};
