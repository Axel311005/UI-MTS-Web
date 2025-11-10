import { vehiculoApi } from '../api/vehiculo.api';
import type { Vehiculo } from '../types/vehiculo.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

interface SearchVehiculosOptions extends PaginationParams {
  q?: string; // Texto de búsqueda
}

export const SearchVehiculosAction = async (
  options: SearchVehiculosOptions
): Promise<PaginatedResponse<Vehiculo>> => {
  const { q, limit, offset } = options;

  // Si no hay término de búsqueda, retornar vacío
  if (!q || q.trim().length === 0) {
    return { data: [], total: 0, limit: limit ?? 10, offset: offset ?? 0 };
  }

  const params: Record<string, unknown> = {};
  
  // Agregar parámetro de búsqueda
  if (q) {
    params.q = q.trim();
  }

  // Agregar paginación
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  const response = await vehiculoApi.get<PaginatedResponse<Vehiculo>>('/', {
    params,
  });

  const raw = response.data;

  // Filtrar solo vehículos activos
  const filterActivos = (vehiculos: Vehiculo[]): Vehiculo[] => {
    return vehiculos.filter((v) => v.activo === EstadoActivo.ACTIVO);
  };

  // Si viene con estructura paginada
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
    const filtered = filterActivos(raw.data);
    return {
      data: filtered,
      total: raw.total ?? filtered.length,
      limit: raw.limit ?? params.limit,
      offset: raw.offset ?? params.offset,
    } as PaginatedResponse<Vehiculo>;
  }

  // Si viene como array simple
  if (Array.isArray(raw)) {
    const filtered = filterActivos(raw);
    return {
      data: filtered,
      total: filtered.length,
      limit: params.limit,
      offset: params.offset ?? 0,
    } as PaginatedResponse<Vehiculo>;
  }

  return { 
    data: [], 
    total: 0, 
    limit: typeof params.limit === 'number' ? params.limit : undefined, 
    offset: typeof params.offset === 'number' ? params.offset : 0 
  };
};

