import { vehiculoApi } from '../api/vehiculo.api';
import type { Vehiculo } from '../types/vehiculo.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

// Devuelve una respuesta paginada, con lógica de total de respaldo cuando el backend no lo provee bien.
export const getVehiculoAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await vehiculoApi.get<
    Vehiculo[] | PaginatedResponse<Vehiculo>
  >('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  // Caso paginado del backend
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  ) {
    const paged = data as PaginatedResponse<Vehiculo>;
    const pageData = (paged.data || []).filter(
      (vehiculo) => vehiculo.activo === EstadoActivo.ACTIVO
    );
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
    } as PaginatedResponse<Vehiculo>;
  }

  // Caso array simple: aplicar paginación en el cliente
  const allItems = Array.isArray(data) ? data : [];
  const filteredItems = allItems.filter(
    (vehiculo) => vehiculo.activo === EstadoActivo.ACTIVO
  );
  // Ordenar por fecha de creación DESC (más recientes primero)
  filteredItems.sort((a, b) => {
    const dateA = new Date(a.fechaCreacion || 0).getTime();
    const dateB = new Date(b.fechaCreacion || 0).getTime();
    return dateB - dateA; // DESC
  });
  const limitValue = params?.limit;
  const offsetValue = params?.offset ?? 0;

  let paginatedData = filteredItems;
  let totalValue = filteredItems.length;

  if (limitValue !== undefined || offsetValue > 0) {
    const serverAppliedPagination =
      limitValue !== undefined && filteredItems.length <= limitValue;

    if (serverAppliedPagination) {
      const coverage = offsetValue + paginatedData.length;
      if (limitValue > 0 && filteredItems.length === limitValue) {
        totalValue = coverage + limitValue;
      } else {
        totalValue = coverage;
      }
    } else {
      const start = offsetValue;
      const end = limitValue !== undefined ? start + limitValue : undefined;
      paginatedData = filteredItems.slice(start, end);
      const coverage = offsetValue + paginatedData.length;
      totalValue = Math.max(filteredItems.length, coverage);
    }
  }

  return {
    data: paginatedData,
    total: totalValue,
    limit: limitValue,
    offset: offsetValue,
  } as PaginatedResponse<Vehiculo>;
};
