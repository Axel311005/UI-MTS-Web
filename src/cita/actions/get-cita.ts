import { citaApi } from '../api/cita.api';
import type { Cita } from '../types/cita.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getCitasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await citaApi.get<Cita[] | PaginatedResponse<Cita>>('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  ) {
    const paged = data as PaginatedResponse<Cita>;
    const pageData = paged.data || [];
    // Ordenar por fecha de creación DESC (más recientes primero)
    pageData.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion || 0).getTime();
      const dateB = new Date(b.fechaCreacion || 0).getTime();
      return dateB - dateA; // DESC
    });

    const limitValue = params?.limit ?? paged.limit ?? pageData.length;
    const offsetValue = params?.offset ?? paged.offset ?? 0;

    let totalValue = paged.total ?? 0;
    const coverage = offsetValue + pageData.length;

    if (!totalValue || totalValue <= coverage) {
      if (limitValue > 0 && pageData.length === limitValue) {
        totalValue = coverage + limitValue;
      } else {
        totalValue = coverage;
      }
    }

    return {
      ...paged,
      data: pageData,
      total: totalValue,
      limit: limitValue,
      offset: offsetValue,
    } as PaginatedResponse<Cita>;
  }

  const allItems = Array.isArray(data) ? data : [];
  // Ordenar por fecha de creación DESC (más recientes primero)
  allItems.sort((a, b) => {
    const dateA = new Date(a.fechaCreacion || 0).getTime();
    const dateB = new Date(b.fechaCreacion || 0).getTime();
    return dateB - dateA; // DESC
  });
  const limitValue = params?.limit;
  const offsetValue = params?.offset ?? 0;

  let paginatedData = allItems;
  let totalValue = allItems.length;

  if (limitValue !== undefined || offsetValue > 0) {
    const serverAppliedPagination =
      limitValue !== undefined && allItems.length <= limitValue;

    if (serverAppliedPagination) {
      const coverage = offsetValue + paginatedData.length;
      if (limitValue > 0 && allItems.length === limitValue) {
        totalValue = coverage + limitValue;
      } else {
        totalValue = coverage;
      }
    } else {
      const start = offsetValue;
      const end = limitValue !== undefined ? start + limitValue : undefined;
      paginatedData = allItems.slice(start, end);
      const coverage = offsetValue + paginatedData.length;
      totalValue = Math.max(allItems.length, coverage);
    }
  }

  return {
    data: paginatedData,
    total: totalValue,
    limit: limitValue,
    offset: offsetValue,
  } as PaginatedResponse<Cita>;
};

