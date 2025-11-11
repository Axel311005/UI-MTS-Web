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
    
    // Ordenar por fecha ASC (más antiguas primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateA - dateB; // ASC
    });
    
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<Compra>;
  }

  // Si viene como array simple, filtrar anuladas y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  // Filtrar compras anuladas (por campo anulado o estado ANULADA)
  const filtered = allItems.filter((compra) => {
    const isAnulado = compra.anulado === true;
    const isEstadoAnulado = typeof compra.estado === 'string' && compra.estado.toUpperCase() === 'ANULADA';
    return !isAnulado && !isEstadoAnulado;
  });
  
  // Ordenar por fecha ASC (más antiguas primero)
  filtered.sort((a, b) => {
    const dateA = new Date(a.fecha).getTime();
    const dateB = new Date(b.fecha).getTime();
    return dateA - dateB; // ASC
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
  } as PaginatedResponse<Compra>;
};


