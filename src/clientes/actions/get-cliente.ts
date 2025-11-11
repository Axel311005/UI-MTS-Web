import { clienteApi } from '../api/cliente.api';
import type { Cliente } from '../types/cliente.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

export const getClientesAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await clienteApi.get<Cliente[] | PaginatedResponse<Cliente>>(
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
    // Filtrar clientes activos en la página actual pero mantener el total del backend
    const paged = data as PaginatedResponse<Cliente>;
    const filteredPage = (paged.data || []).filter(
      (c) => c.activo === EstadoActivo.ACTIVO
    );
    // Ordenar por fecha de creación DESC (más recientes primero)
    filteredPage.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion || 0).getTime();
      const dateB = new Date(b.fechaCreacion || 0).getTime();
      return dateB - dateA; // DESC
    });
    const limitValue = params?.limit ?? paged.limit ?? filteredPage.length;
    const offsetValue = params?.offset ?? paged.offset ?? 0;

    let totalValue = paged.total ?? 0;
    const coverage = offsetValue + filteredPage.length;

    if (!totalValue || totalValue <= coverage) {
      if (limitValue > 0 && filteredPage.length === limitValue) {
        totalValue = coverage + limitValue;
      } else {
        totalValue = coverage;
      }
    }

    return {
      ...paged,
      data: filteredPage,
      total: totalValue,
      limit: limitValue,
      offset: offsetValue,
    } as PaginatedResponse<Cliente>;
  }

  // Si viene como array simple, filtrar activos y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  const filtered = allItems.filter((c) => c.activo === EstadoActivo.ACTIVO);
  // Ordenar por fecha de creación DESC (más recientes primero)
  filtered.sort((a, b) => {
    const dateA = new Date(a.fechaCreacion || 0).getTime();
    const dateB = new Date(b.fechaCreacion || 0).getTime();
    return dateB - dateA; // DESC
  });

  const limitValue = params?.limit;
  const offsetValue = params?.offset ?? 0;

  let paginatedData = filtered;
  let totalValue = filtered.length;

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
      paginatedData = filtered.slice(start, end);
      const coverage = offsetValue + paginatedData.length;
      totalValue = Math.max(filtered.length, coverage);
    }
  }

  return {
    data: paginatedData,
    total: totalValue,
    limit: limitValue,
    offset: offsetValue,
  } as PaginatedResponse<Cliente>;
};