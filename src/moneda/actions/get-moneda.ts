import { monedaApi } from '../api/moneda.api';
import type { Moneda } from '../types/Moneda.interface';
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

const normalize = (m: any): Moneda => ({
  ...(m as Moneda),
  activo: coerceActivo((m as any)?.activo ?? (m as any)?.estado),
});

export const getMonedasAction = async (params?: PaginationParams) => {
  const queryParams: Record<string, number> = {};
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const { data } = await monedaApi.get<Moneda[] | PaginatedResponse<Moneda>>(
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
    const page = (data as PaginatedResponse<Moneda>).data.map(normalize);
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
    } as PaginatedResponse<Moneda>;
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
  } as PaginatedResponse<Moneda>;
};
