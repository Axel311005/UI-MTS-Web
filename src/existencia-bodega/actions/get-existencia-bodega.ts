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
      const itemActivo = existencia.item?.activo === 'ACTIVO' || (typeof existencia.item?.activo === 'boolean' && existencia.item?.activo === true);
      const bodegaActiva = existencia.bodega?.activo === 'ACTIVO' || (typeof existencia.bodega?.activo === 'boolean' && existencia.bodega?.activo === true);
      return itemActivo && bodegaActiva;
    });
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<ExistenciaBodega>;
  }

  // Si viene como array simple, filtrar activos y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  // Filtrar existencias donde item y bodega estén activos
  const filtered = allItems.filter((existencia) => {
    const itemActivo = existencia.item?.activo === 'ACTIVO' || (typeof existencia.item?.activo === 'boolean' && existencia.item?.activo === true);
    const bodegaActiva = existencia.bodega?.activo === 'ACTIVO' || (typeof existencia.bodega?.activo === 'boolean' && existencia.bodega?.activo === true);
    return itemActivo && bodegaActiva;
  });
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
  } as PaginatedResponse<ExistenciaBodega>;
};
