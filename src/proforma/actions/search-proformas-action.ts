import { ProformaApi } from '../api/proforma.api';
import type { Proforma } from '../types/proforoma.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface SearchProformaOptions {
  // Códigos
  codigo_proforma?: string; // exacto
  codigoLike?: string; // parcial

  // Nombres (para mostrar en UI y/o filtrar por LIKE)
  clienteNombre?: string;
  aseguradoraNombre?: string;
  vehiculoPlaca?: string;
  vehiculoMarca?: string;
  numeroTramite?: string;
  moneda?: string;
  observacionLike?: string;

  // Ids (si el selector devuelve id, enviamos estos)
  id_cliente?: number | string;
  id_aseguradora?: number | string;
  id_moneda?: number | string;
  id_tramite?: number | string;
  id_vehiculo?: number | string;

  // Estado / factura
  tramiteEstado?: string;
  hasFactura?: boolean | string;

  // Fechas y montos
  dateFrom?: string | Date;
  dateTo?: string | Date;
  minTotal?: string | number;
  maxTotal?: string | number;

  // Paginación y ordenamiento
  page?: number | string;
  limit?: number | string;
  offset?: number | string;
  sortBy?: 'fecha' | 'total' | 'codigo_proforma' | 'cliente' | 'aseguradora' | 'moneda' | 'numero_tramite' | 'vehiculo';
  sortDir?: 'ASC' | 'DESC';
}

export const SearchProformasAction = async (
  options: SearchProformaOptions
): Promise<PaginatedResponse<Proforma>> => {
  const {
    codigo_proforma,
    codigoLike,
    clienteNombre,
    aseguradoraNombre,
    vehiculoPlaca,
    vehiculoMarca,
    numeroTramite,
    moneda,
    observacionLike,
    id_cliente,
    id_aseguradora,
    id_moneda,
    id_tramite,
    id_vehiculo,
    tramiteEstado,
    hasFactura,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
    page,
    limit,
    offset,
    sortBy,
    sortDir,
  } = options ?? {};

  // Determinar si hay algún criterio (excluir paginación y ordenamiento)
  const hasAny = [
    codigo_proforma,
    codigoLike,
    clienteNombre,
    aseguradoraNombre,
    vehiculoPlaca,
    vehiculoMarca,
    numeroTramite,
    moneda,
    observacionLike,
    id_cliente,
    id_aseguradora,
    id_moneda,
    id_tramite,
    id_vehiculo,
    tramiteEstado,
    hasFactura,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  ].some((v) => v !== undefined && v !== null && String(v).trim?.() !== '');

  if (!hasAny) return { data: [], total: 0 } as PaginatedResponse<Proforma>;

  const params: Record<string, unknown> = {};
  if (codigo_proforma) params.codigo_proforma = codigo_proforma;
  if (codigoLike) params.codigoLike = codigoLike;

  if (clienteNombre) params.clienteNombre = clienteNombre;
  if (aseguradoraNombre) params.aseguradoraNombre = aseguradoraNombre;
  if (vehiculoPlaca) params.vehiculoPlaca = vehiculoPlaca;
  if (vehiculoMarca) params.vehiculoMarca = vehiculoMarca;
  if (numeroTramite) params.numeroTramite = numeroTramite;
  if (moneda) params.moneda = moneda;
  if (observacionLike) params.observacionLike = observacionLike;

  if (id_cliente !== undefined && id_cliente !== '') params.id_cliente = id_cliente;
  if (id_aseguradora !== undefined && id_aseguradora !== '') params.id_aseguradora = id_aseguradora;
  if (id_moneda !== undefined && id_moneda !== '') params.id_moneda = id_moneda;
  if (id_tramite !== undefined && id_tramite !== '') params.id_tramite = id_tramite;
  if (id_vehiculo !== undefined && id_vehiculo !== '') params.id_vehiculo = id_vehiculo;

  if (tramiteEstado) params.tramiteEstado = tramiteEstado;
  if (hasFactura !== undefined) {
    params.hasFactura = hasFactura === true || hasFactura === 'true';
  }

  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;

  if (minTotal !== undefined && minTotal !== '') params.minTotal = minTotal;
  if (maxTotal !== undefined && maxTotal !== '') params.maxTotal = maxTotal;

  // Agregar paginación: el backend espera page y limit, no offset
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined && limit !== undefined) {
    const pageNum = Math.floor(Number(offset) / Number(limit)) + 1;
    params.page = pageNum;
  } else if (page !== undefined) {
    params.page = page;
  }

  if (sortBy) params.sortBy = sortBy;
  if (sortDir) params.sortDir = sortDir;

  const response = await ProformaApi.get('/search', { params });

  const raw = response.data;

  // Si viene con estructura paginada (con meta)
  if (raw && typeof raw === 'object' && 'data' in raw && 'meta' in raw) {
    return {
      data: raw.data || [],
      total: raw.meta?.total || 0,
    } as PaginatedResponse<Proforma>;
  }

  // Si viene como array simple
  if (Array.isArray(raw)) {
    return {
      data: raw,
      total: raw.length,
    } as PaginatedResponse<Proforma>;
  }

  // Fallback
  return { data: [], total: 0 } as PaginatedResponse<Proforma>;
};

