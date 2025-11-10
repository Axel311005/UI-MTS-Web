import { clienteApi } from '../api/cliente.api';
import type { Cliente } from '../types/cliente.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

interface SearchClientesOptions extends PaginationParams {
  q?: string; // Texto de búsqueda
}

export const SearchClientesAction = async (
  options: SearchClientesOptions
): Promise<PaginatedResponse<Cliente>> => {
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

  const response = await clienteApi.get<PaginatedResponse<Cliente>>('/', {
    params,
  });

  const raw = response.data;

  // Filtrar solo clientes activos
  const filterActivos = (clientes: Cliente[]): Cliente[] => {
    return clientes.filter((c) => c.activo === EstadoActivo.ACTIVO);
  };

  // Si viene con estructura paginada
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray(raw.data)) {
    const filtered = filterActivos(raw.data);
    return {
      data: filtered,
      total: raw.total ?? filtered.length,
      limit: raw.limit ?? params.limit,
      offset: raw.offset ?? params.offset,
    } as PaginatedResponse<Cliente>;
  }

  // Si viene como array simple
  if (Array.isArray(raw)) {
    const filtered = filterActivos(raw);
    return {
      data: filtered,
      total: filtered.length,
      limit: params.limit,
      offset: params.offset ?? 0,
    } as PaginatedResponse<Cliente>;
  }

  return { 
    data: [], 
    total: 0, 
    limit: typeof params.limit === 'number' ? params.limit : undefined, 
    offset: typeof params.offset === 'number' ? params.offset : 0 
  };
};

