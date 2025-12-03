import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';

export const getFacturasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await facturaApi.get<Factura[] | PaginatedResponse<Factura>>(
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
    // Filtrar facturas anuladas también en respuestas paginadas pero mantener el total del backend
    const paged = data as PaginatedResponse<Factura>;
    const filteredPage = (paged.data || []).filter((factura) => {
      const isAnulada = factura.anulada === true;
      const isEstadoAnulado =
        typeof factura.estado === 'string' &&
        factura.estado.toUpperCase() === 'ANULADA';
      return !isAnulada && !isEstadoAnulado;
    });
    
    // Ordenar por fecha DESC (más recientes primero)
    filteredPage.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA; // DESC
    });
    
    const limitValue = params?.limit ?? paged.limit ?? filteredPage.length;
    const offsetValue = params?.offset ?? paged.offset ?? 0;

    let totalValue = paged.total ?? 0;
    const coverage = offsetValue + filteredPage.length;
    const removedCount = paged.data.length - filteredPage.length;
    const originalDataLength = paged.data.length;

    // Ajustar el total para excluir facturas anuladas del conteo
    // Si la página filtrada no está llena, es la última página
    if (filteredPage.length < limitValue) {
      // Es la última página, el total es la cobertura (número de facturas válidas)
      totalValue = coverage;
    } else if (originalDataLength < limitValue) {
      // La página original no está llena (última página del backend)
      totalValue = coverage;
    } else if (totalValue > 0) {
      // Hay más páginas, ajustar el total excluyendo anuladas
      if (removedCount > 0) {
        // Hay facturas anuladas en esta página, estimar el total válido
        const validRate =
          originalDataLength > 0 ? filteredPage.length / originalDataLength : 1;
        const estimatedValidTotal = Math.ceil(totalValue * validRate);

        // Si la página filtrada está llena, probablemente hay más páginas
        if (filteredPage.length === limitValue) {
          totalValue = Math.max(estimatedValidTotal, coverage + limitValue);
        } else {
          // La página no está llena, usar la cobertura
          totalValue = coverage;
        }
      } else if (totalValue <= coverage) {
        // No hay items removidos pero el total es menor/igual a la cobertura
        if (limitValue > 0 && filteredPage.length === limitValue) {
          totalValue = coverage + limitValue;
        } else {
          totalValue = coverage;
        }
      } else {
        // totalValue > coverage y no hay items removidos en esta página
        // Pero el total del backend puede incluir anuladas en otras páginas
        // Si la página filtrada está llena, mantener el total del backend
        // Si no está llena, usar la cobertura
        if (filteredPage.length < limitValue) {
          totalValue = coverage;
        }
        // Si está llena, mantener totalValue del backend (puede haber más páginas válidas)
      }
    } else {
      // No hay total del backend, estimar
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
    } as PaginatedResponse<Factura>;
  }

  // Si viene como array simple, filtrar anuladas y aplicar paginación
  const allItems = Array.isArray(data) ? data : [];
  // Filtrar facturas anuladas (por campo anulada o estado ANULADA)
  const filtered = allItems.filter((factura) => {
    const isAnulada = factura.anulada === true;
    const isEstadoAnulado =
      typeof factura.estado === 'string' &&
      factura.estado.toUpperCase() === 'ANULADA';
    return !isAnulada && !isEstadoAnulado;
  });
  
  // Ordenar por fecha DESC (más recientes primero)
  filtered.sort((a, b) => {
    const dateA = new Date(a.fecha).getTime();
    const dateB = new Date(b.fecha).getTime();
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
  } as PaginatedResponse<Factura>;
};
