import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getFacturasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await facturaApi.get<Factura[] | PaginatedResponse<Factura>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar facturas anuladas también en respuestas paginadas
    const filtered = (data as PaginatedResponse<Factura>).data.filter((factura) => {
      const isAnulada = factura.anulada === true;
      const isEstadoAnulado = typeof factura.estado === 'string' && factura.estado.toUpperCase() === 'ANULADA';
      return !isAnulada && !isEstadoAnulado;
    });
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<Factura>;
  }

  // Si viene como array simple, filtrar anuladas y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  // Filtrar facturas anuladas (por campo anulada o estado ANULADA)
  const filtered = allItems.filter((factura) => {
    const isAnulada = factura.anulada === true;
    const isEstadoAnulado = typeof factura.estado === 'string' && factura.estado.toUpperCase() === 'ANULADA';
    return !isAnulada && !isEstadoAnulado;
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
  } as PaginatedResponse<Factura>;
};
