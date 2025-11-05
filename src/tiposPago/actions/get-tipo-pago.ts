import { tipoPagoApi } from '../api/tipoPago.api';
import type { TipoPago } from '../types/tipoPago.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getTipoPagosAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await tipoPagoApi.get<TipoPago[] | PaginatedResponse<TipoPago>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    // Filtrar tipos de pago activos también en respuestas paginadas
    const filtered = (data as PaginatedResponse<TipoPago>).data.filter((item) => (item?.activo ?? false) === true);
    return {
      ...data,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<TipoPago>;
  }

  const items = Array.isArray(data) ? data : [];
  const filtered = items.filter((item) => (item?.activo ?? false) === true);
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<TipoPago>;
};
