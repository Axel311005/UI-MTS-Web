import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getComprasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await compraApi.get<Compra[] | PaginatedResponse<Compra>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar compras anuladas también en respuestas paginadas
    const filtered = (data as PaginatedResponse<Compra>).data.filter((compra) => {
      const isAnulado = compra.anulado === true;
      const isEstadoAnulado = typeof compra.estado === 'string' && compra.estado.toUpperCase() === 'ANULADA';
      return !isAnulado && !isEstadoAnulado;
    });
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<Compra>;
  }

  const items = Array.isArray(data) ? data : [];
  // Filtrar compras anuladas (por campo anulado o estado ANULADA)
  const filtered = items.filter((compra) => {
    const isAnulado = compra.anulado === true;
    const isEstadoAnulado = typeof compra.estado === 'string' && compra.estado.toUpperCase() === 'ANULADA';
    return !isAnulado && !isEstadoAnulado;
  });
  
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<Compra>;
};


