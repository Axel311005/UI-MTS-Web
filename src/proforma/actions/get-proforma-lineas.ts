import { ProformaLineasApi } from '../api/proforma-lineas.api';
import type { ProformaLinea } from '../types/proforomaLinea.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getProformaLineasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await ProformaLineasApi.get<
    ProformaLinea[] | PaginatedResponse<ProformaLinea>
  >('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  ) {
    const paged = data as PaginatedResponse<ProformaLinea>;
    const pageData = paged.data || [];

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
    } as PaginatedResponse<ProformaLinea>;
  }

  const allItems = Array.isArray(data) ? data : [];
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
  } as PaginatedResponse<ProformaLinea>;
};
