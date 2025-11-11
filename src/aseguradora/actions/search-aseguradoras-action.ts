import { AseguradoraApi } from '../api/aseguradora.api';
import type { Aseguradora } from '../types/aseguradora.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

interface SearchAseguradorasOptions extends PaginationParams {
  q?: string; // Texto de búsqueda
}

export const SearchAseguradorasAction = async (
  options: SearchAseguradorasOptions
): Promise<PaginatedResponse<Aseguradora>> => {
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

  const response = await AseguradoraApi.get<PaginatedResponse<Aseguradora>>('/', {
    params,
  });

  const raw = response.data;

  // Filtrar solo aseguradoras activas
  const filterActivas = (aseguradoras: Aseguradora[]): Aseguradora[] => {
    return aseguradoras.filter((a) => a.activo === EstadoActivo.ACTIVO);
  };

  // Si viene con estructura paginada
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
    const filtered = filterActivas(raw.data);
    return {
      data: filtered,
      total: raw.total ?? filtered.length,
      limit: raw.limit ?? params.limit,
      offset: raw.offset ?? params.offset,
    } as PaginatedResponse<Aseguradora>;
  }

  // Si viene como array simple
  if (Array.isArray(raw)) {
    const filtered = filterActivas(raw);
    return {
      data: filtered,
      total: filtered.length,
      limit: params.limit,
      offset: params.offset ?? 0,
    } as PaginatedResponse<Aseguradora>;
  }

  return { 
    data: [], 
    total: 0, 
    limit: typeof params.limit === 'number' ? params.limit : undefined, 
    offset: typeof params.offset === 'number' ? params.offset : 0 
  };
};

