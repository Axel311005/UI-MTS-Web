import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

// Opciones ricas similares a las de facturas, con compat de nombres y soporte de ids
interface SearchCompraOptions {
  // Códigos
  codigo_compra?: string; // exacto (backend espera snake_case)
  codigoLike?: string; // parcial

  // Nombres (para mostrar en UI y/o filtrar por LIKE)
  bodegaNombre?: string;
  empleadoNombre?: string;
  tipo_pago?: string;
  moneda?: string;

  // Ids (si el selector devuelve id, enviamos estos)
  id_bodega?: number | string;
  id_empleado?: number | string;
  id_tipo_pago?: number | string;
  id_moneda?: number | string;

  // Estado / anulado
  estado?: string;
  anulado?: string | boolean;

  // Fechas y montos
  fechaInicio?: string | Date; // compat
  fechaFin?: string | Date; // compat
  dateFrom?: string | Date;
  dateTo?: string | Date;
  minTotal?: string | number;
  maxTotal?: string | number;

  // Paginación y ordenamiento (usar valores que backend espera)
  page?: number | string;
  limit?: number | string;
  offset?: number | string;
  // Backend espera valores string del enum: 'fecha' | 'total' | 'codigo_compra' | 'bodega' | 'empleado' | 'tipo_pago' | 'moneda'
  sortBy?:
    | 'fecha'
    | 'total'
    | 'codigo_compra'
    | 'bodega'
    | 'empleado'
    | 'tipo_pago'
    | 'moneda';
  sortDir?: 'ASC' | 'DESC';
}

export const SearchComprasAction = async (
  options: SearchCompraOptions
): Promise<PaginatedResponse<Compra>> => {
  const {
    codigo_compra,
    codigoLike,
    bodegaNombre,
    empleadoNombre,
    tipo_pago,
    moneda,
    id_bodega,
    id_empleado,
    id_tipo_pago,
    id_moneda,
    estado,
    anulado,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
    page,
    limit,
    offset,
  } = options ?? {};

  // Determinar si hay algún criterio (excluir paginación y ordenamiento)
  const hasAny = [
    codigo_compra,
    codigoLike,
    bodegaNombre,
    empleadoNombre,
    tipo_pago,
    moneda,
    id_bodega,
    id_empleado,
    id_tipo_pago,
    id_moneda,
    estado,
    anulado,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  ].some((v) => v !== undefined && v !== null && String(v).trim?.() !== '');
  if (!hasAny) return { data: [], total: 0 } as PaginatedResponse<Compra>;

  const params: Record<string, unknown> = {};
  if (codigo_compra) params.codigo_compra = codigo_compra;
  if (codigoLike) params.codigoLike = codigoLike;

  if (bodegaNombre) params.bodegaNombre = bodegaNombre;
  if (tipo_pago) params.tipo_pago = tipo_pago;
  if (moneda) params.moneda = moneda;

  if (id_bodega !== undefined && id_bodega !== '') params.id_bodega = id_bodega;
  // Priorizar ID del empleado sobre nombre
  if (id_empleado !== undefined && id_empleado !== '') {
    params.id_empleado = id_empleado;
  } else if (empleadoNombre) {
    // Mantener compatibilidad con nombre si no hay ID
    params.empleadoNombre = empleadoNombre;
  }
  if (id_tipo_pago !== undefined && id_tipo_pago !== '')
    params.id_tipo_pago = id_tipo_pago;
  if (id_moneda !== undefined && id_moneda !== '') params.id_moneda = id_moneda;

  if (estado) params.estado = estado;
  if (anulado !== undefined) {
    params.anulado =
      typeof anulado === 'string'
        ? anulado.toLowerCase() === 'true'
        : !!anulado;
  }

  // Fechas: preferir dateFrom/dateTo; mantener compat con fechaInicio/fechaFin
  const from = dateFrom ?? fechaInicio;
  let to = dateTo ?? fechaFin;
  
  // Si dateTo es una fecha sin hora, agregar el tiempo al final del día para incluir todo el día
  if (to && typeof to === 'string' && to.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Formato YYYY-MM-DD, agregar tiempo al final del día
    to = `${to}T23:59:59`;
  }
  
  if (from) params.dateFrom = from;
  if (to) params.dateTo = to;

  if (minTotal !== undefined && minTotal !== '') params.minTotal = minTotal;
  if (maxTotal !== undefined && maxTotal !== '') params.maxTotal = maxTotal;

  // Paginación: el backend espera page y limit, no offset
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined && limit !== undefined) {
    // Convertir offset a page (page = (offset / limit) + 1)
    const pageNum = Math.floor(Number(offset) / Number(limit)) + 1;
    params.page = pageNum;
  } else if (page !== undefined && page !== '') {
    // Si viene page directamente, usarlo
    params.page = page;
  }
  
  const response = await compraApi.get('/search', { params });
  const raw = response.data as unknown;
  
  // Ordenar por fecha DESC (más recientes primero) en el frontend
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    (raw as any).data.sort((a: Compra, b: Compra) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA; // DESC
    });
  } else if (Array.isArray(raw)) {
    raw.sort((a: Compra, b: Compra) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA; // DESC
    });
  }
  
  // Helper para filtrar compras anuladas
  const filterAnuladas = (compras: Compra[]): Compra[] => {
    return compras.filter((compra) => {
      const isAnulado = compra.anulado === true;
      const isEstadoAnulado = typeof compra.estado === 'string' && compra.estado.toUpperCase() === 'ANULADA';
      return !isAnulado && !isEstadoAnulado;
    });
  };
  
  // Si viene con estructura paginada (con meta)
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    const filtered = filterAnuladas((raw as any).data);
    const meta = (raw as any).meta;
    return {
      data: filtered,
      total: meta?.total ?? filtered.length,
      limit: meta?.limit ?? params.limit,
      page: meta?.page ?? params.page,
      totalPages: meta?.totalPages ?? Math.ceil((meta?.total ?? filtered.length) / (meta?.limit ?? params.limit ?? 10)),
    } as PaginatedResponse<Compra>;
  }
  if (Array.isArray(raw)) {
    const filtered = filterAnuladas(raw);
    return { data: filtered, total: filtered.length } as PaginatedResponse<Compra>;
  }
  if (raw && Array.isArray((raw as any).results)) {
    const filtered = filterAnuladas((raw as any).results);
    return { data: filtered, total: filtered.length } as PaginatedResponse<Compra>;
  }
  return { data: [], total: 0 } as PaginatedResponse<Compra>;
};
