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

  const items = Array.isArray(data) ? data : [];
  // Filtrar facturas anuladas (por campo anulada o estado ANULADA)
  const filtered = items.filter((factura) => {
    const isAnulada = factura.anulada === true;
    const isEstadoAnulado = typeof factura.estado === 'string' && factura.estado.toUpperCase() === 'ANULADA';
    return !isAnulada && !isEstadoAnulado;
  });
  
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<Factura>;
};
