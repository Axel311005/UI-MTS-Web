import { motivoCitaApi } from '../api/motivo-cita.api';
import type { MotivoCita } from '../types/motivo-cita.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getMotivosCitaAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await motivoCitaApi.get<MotivoCita[] | PaginatedResponse<MotivoCita>>(
    '/',
    {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    }
  );

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  ) {
    const paged = data as PaginatedResponse<MotivoCita>;
    return paged;
  }

  const allItems = Array.isArray(data) ? data : [];
  return {
    data: allItems,
    total: allItems.length,
    limit: params?.limit,
    offset: params?.offset ?? 0,
  } as PaginatedResponse<MotivoCita>;
};

