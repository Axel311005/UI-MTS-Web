import { citaApi } from '../api/cita.api';
import type { Cita } from '../types/cita.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { CitaEstado } from '@/shared/types/status';

interface SearchCitasOptions extends PaginationParams {
  q?: string; // Texto de búsqueda
  estado?: CitaEstado; // Filtro por estado
}

export const SearchCitasAction = async (
  options: SearchCitasOptions
): Promise<PaginatedResponse<Cita>> => {
  const { q, estado, limit, offset } = options;

  const params: Record<string, unknown> = {};

  // Agregar parámetro de búsqueda
  if (q && q.trim().length > 0) {
    params.q = q.trim();
  }

  // Agregar filtro de estado
  if (estado) {
    params.estado = estado;
  }

  // Agregar paginación
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;

  const response = await citaApi.get<PaginatedResponse<Cita>>('/', {
    params,
  });

  const raw = response.data;

  // Si viene con estructura paginada
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
    return {
      data: raw.data,
      total: raw.total ?? raw.data.length,
      limit: raw.limit ?? params.limit,
      offset: raw.offset ?? params.offset,
    } as PaginatedResponse<Cita>;
  }

  // Si viene como array simple
  if (Array.isArray(raw)) {
    return {
      data: raw,
      total: raw.length,
      limit: typeof params.limit === 'number' ? params.limit : undefined,
      offset: typeof params.offset === 'number' ? params.offset : 0,
    } as PaginatedResponse<Cita>;
  }

  return { 
    data: [], 
    total: 0, 
    limit: typeof params.limit === 'number' ? params.limit : undefined, 
    offset: typeof params.offset === 'number' ? params.offset : 0 
  };
};

