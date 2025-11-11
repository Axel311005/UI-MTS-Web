import { UnidadMedidaApi } from '../api/unidadMedida.api';
import type { UnidadMedida } from '../types/unidadMedida.interface';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/shared/types/pagination';
import { EstadoActivo } from '@/shared/types/status';

const coerceActivo = (raw: any): EstadoActivo => {
  if (raw === true) return EstadoActivo.ACTIVO;
  if (raw === false) return EstadoActivo.INACTIVO;
  const s = String(raw).toUpperCase();
  return s === EstadoActivo.INACTIVO
    ? EstadoActivo.INACTIVO
    : EstadoActivo.ACTIVO;
};

const normalize = (u: any): UnidadMedida => ({
  ...(u as UnidadMedida),
  activo: coerceActivo((u as any)?.activo ?? (u as any)?.estado),
});

export const getUnidadMedidasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await UnidadMedidaApi.get<
    UnidadMedida[] | PaginatedResponse<UnidadMedida>
  >('/', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as any).data)
  ) {
    const page = (data as PaginatedResponse<UnidadMedida>).data.map(normalize);
    const filtered = page.filter(
      (item) => item?.activo === EstadoActivo.ACTIVO
    );
    // Ordenar por fecha de creación DESC (más recientes primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.fechaCreacion || 0).getTime();
      const dateB = new Date(b.fechaCreacion || 0).getTime();
      return dateB - dateA; // DESC
    });
    return {
      ...(data as any),
      data: filtered,
      total: (data as any)?.total ?? filtered.length,
    } as PaginatedResponse<UnidadMedida>;
  }

  // Si viene como array simple, filtrar activos y aplicar paginación
  const allItems = Array.isArray(data) ? data.map(normalize) : [];
  const filtered = allItems.filter(
    (item) => item?.activo === EstadoActivo.ACTIVO
  );
  // Ordenar por fecha de creación DESC (más recientes primero)
  filtered.sort((a, b) => {
    const dateA = new Date(a.fechaCreacion || 0).getTime();
    const dateB = new Date(b.fechaCreacion || 0).getTime();
    return dateB - dateA; // DESC
  });
  const total = filtered.length;

  // Aplicar paginación si se especificó
  let paginatedData = filtered;
  if (params?.limit !== undefined || params?.offset !== undefined) {
    const start = params?.offset ?? 0;
    const end = params?.limit !== undefined ? start + params.limit : undefined;
    paginatedData = filtered.slice(start, end);
  }

  return {
    data: paginatedData,
    total: total,
    limit: params?.limit,
    offset: params?.offset,
  } as PaginatedResponse<UnidadMedida>;
};
