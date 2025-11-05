import { clienteApi } from '../api/cliente.api';
import type { Cliente } from '../types/cliente.interface';
import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

export const getClientesAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await clienteApi.get<Cliente[] | PaginatedResponse<Cliente>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    return data as PaginatedResponse<Cliente>;
  }

  const filtered = Array.isArray(data) ? data.filter((c) => c.activo) : [];
  return {
    data: filtered,
    total: filtered.length,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<Cliente>;
};
