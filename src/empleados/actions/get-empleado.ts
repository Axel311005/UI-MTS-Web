import { empleadoApi } from '../api/empleado.api';
import type { Empleado } from '../types/empleado.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getEmpleadosAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await empleadoApi.get<Empleado[] | PaginatedResponse<Empleado>>(
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
    // Mostrar todos los empleados (activos e inactivos)
    const paged = data as PaginatedResponse<Empleado>;
    const allPage = paged.data || [];
    // Ordenar por fecha de creación DESC (más recientes primero)
    allPage.sort((a, b) => {
      const dateA = new Date(a.fecha_creacion || 0).getTime();
      const dateB = new Date(b.fecha_creacion || 0).getTime();
      return dateB - dateA; // DESC
    });
    const limitValue = params?.limit ?? paged.limit ?? allPage.length;
    const offsetValue = params?.offset ?? paged.offset ?? 0;

    return {
      ...paged,
      data: allPage,
      limit: limitValue,
      offset: offsetValue,
    } as PaginatedResponse<Empleado>;
  }

  // Si viene como array simple, mostrar todos (activos e inactivos)
  const allItems = Array.isArray(data) ? data : [];
  // Ordenar por fecha de creación DESC (más recientes primero)
  allItems.sort((a, b) => {
    const dateA = new Date(a.fecha_creacion || 0).getTime();
    const dateB = new Date(b.fecha_creacion || 0).getTime();
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
  } as PaginatedResponse<Empleado>;
};

