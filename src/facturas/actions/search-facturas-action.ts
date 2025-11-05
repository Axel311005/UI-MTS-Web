import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';

import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

interface SearchFacturaOptions extends PaginationParams {
  codigoFactura?: string; // exacto (compat)
  codigo_factura?: string; // exacto (backend expects snake_case)
  codigoLike?: string; // parcial
  clienteNombre?: string;
  empleadoNombre?: string;
  bodegaNombre?: string;
  estado?: string;
  anulada?: string | boolean;
  fechaInicio?: string | Date; // compat anterior
  fechaFin?: string | Date; // compat anterior
  dateFrom?: string | Date; // nuevo nombre
  dateTo?: string | Date; // nuevo nombre
  minTotal?: string | number;
  maxTotal?: string | number;
}

export const SearchFacturaAction = async (options: SearchFacturaOptions): Promise<PaginatedResponse<Factura>> => {
  // Normalizar valores (el objeto filters viene de URLSearchParams => strings)
  const {
    codigoFactura,
    codigo_factura,
    codigoLike,
    clienteNombre,
    empleadoNombre,
    bodegaNombre,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  } = options;

  // Determinar si hay al menos un criterio (incluyendo codigoFactura)
  const hasAny = [
    codigoFactura,
    codigo_factura,
    codigoLike,
    clienteNombre,
    empleadoNombre,
    bodegaNombre,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  ].some((v) => v !== undefined && v !== '' && v !== null);
  if (!hasAny) return [];

  const params: Record<string, unknown> = {};
  const codigoExacto = codigo_factura ?? codigoFactura;
  if (codigoExacto) params.codigo_factura = codigoExacto;
  if (codigoLike) params.codigoLike = codigoLike;
  if (clienteNombre) params.clienteNombre = clienteNombre;
  if (empleadoNombre) params.empleadoNombre = empleadoNombre;
  if (bodegaNombre) params.bodegaNombre = bodegaNombre;
  if (estado) params.estado = estado;
  if (anulada !== undefined) {
    params.anulada = anulada === true;
  }
  // Mapear fechas: preferir dateFrom/dateTo; mantener compat con fechaInicio/fechaFin
  const from = dateFrom ?? fechaInicio;
  const to = dateTo ?? fechaFin;
  if (from) params.dateFrom = from;
  if (to) params.dateTo = to;
  if (minTotal !== undefined && minTotal !== '') params.minTotal = minTotal;
  if (maxTotal !== undefined && maxTotal !== '') params.maxTotal = maxTotal;

  // Agregar paginación
  if (options.limit !== undefined) params.limit = options.limit;
  if (options.offset !== undefined) params.offset = options.offset;

  const response = await facturaApi.get('/search', { params });
  
  const raw = response.data;
  
  // Helper para filtrar facturas anuladas
  const filterAnuladas = (facturas: Factura[]): Factura[] => {
    return facturas.filter((factura) => {
      const isAnulada = factura.anulada === true;
      const isEstadoAnulado = typeof factura.estado === 'string' && factura.estado.toUpperCase() === 'ANULADA';
      return !isAnulada && !isEstadoAnulado;
    });
  };
  
  // Si viene con estructura paginada
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    const filtered = filterAnuladas((raw as any).data);
    return {
      ...raw,
      data: filtered,
      total: filtered.length,
    } as PaginatedResponse<Factura>;
  }
  if (Array.isArray(raw)) {
    const filtered = filterAnuladas(raw);
    return { data: filtered, total: filtered.length } as PaginatedResponse<Factura>;
  }
  if (raw && Array.isArray((raw as any).results)) {
    const filtered = filterAnuladas((raw as any).results);
    return { data: filtered, total: filtered.length } as PaginatedResponse<Factura>;
  }
  return { data: [], total: 0 } as PaginatedResponse<Factura>;
};
