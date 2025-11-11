import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';

import type { PaginationParams, PaginatedResponse } from '@/shared/types/pagination';

interface SearchFacturaOptions extends PaginationParams {
  codigoFactura?: string; // exacto (compat)
  codigo_factura?: string; // exacto (backend expects snake_case)
  codigoLike?: string; // parcial
  clienteNombre?: string; // deprecated, usar id_cliente
  clienteId?: string | number; // ID del cliente
  empleadoNombre?: string; // deprecated, usar id_empleado
  empleadoId?: string | number; // ID del empleado
  bodegaNombre?: string;
  monedaNombre?: string; // deprecated, usar id_moneda
  monedaId?: string | number; // ID de la moneda
  tipoPagoNombre?: string; // deprecated, usar id_tipo_pago
  tipoPagoId?: string | number; // ID del tipo de pago
  estado?: string;
  anulada?: string | boolean;
  fechaInicio?: string | Date; // compat anterior
  fechaFin?: string | Date; // compat anterior
  dateFrom?: string | Date; // nuevo nombre
  dateTo?: string | Date; // nuevo nombre
  minTotal?: string | number;
  maxTotal?: string | number;
  page?: number;
}

export const SearchFacturaAction = async (options: SearchFacturaOptions): Promise<PaginatedResponse<Factura>> => {
  // Normalizar valores (el objeto filters viene de URLSearchParams => strings)
  const {
    codigoFactura,
    codigo_factura,
    codigoLike,
    clienteNombre,
    clienteId,
    empleadoNombre,
    empleadoId,
    bodegaNombre,
    monedaNombre,
    monedaId,
    tipoPagoNombre,
    tipoPagoId,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
    limit,
    offset,
  } = options;

  // Determinar si hay al menos un criterio (incluyendo codigoFactura)
  const hasAny = [
    codigoFactura,
    codigo_factura,
    codigoLike,
    clienteNombre,
    clienteId,
    empleadoNombre,
    empleadoId,
    bodegaNombre,
    monedaNombre,
    monedaId,
    tipoPagoNombre,
    tipoPagoId,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  ].some((v) => v !== undefined && v !== '' && v !== null);
  if (!hasAny) return { data: [], total: 0 };

  const params: Record<string, unknown> = {};
  const codigoExacto = codigo_factura ?? codigoFactura;
  if (codigoExacto) params.codigo_factura = codigoExacto;
  if (codigoLike) params.codigoLike = codigoLike;
  // Priorizar ID del cliente sobre nombre
  if (clienteId) {
    const idNum = typeof clienteId === 'string' ? Number(clienteId) : clienteId;
    if (Number.isFinite(idNum)) {
      params.id_cliente = idNum;
    }
  } else if (clienteNombre) {
    // Mantener compatibilidad con nombre si no hay ID
    params.clienteNombre = clienteNombre;
  }
  // Priorizar ID del empleado sobre nombre
  if (empleadoId) {
    const idNum = typeof empleadoId === 'string' ? Number(empleadoId) : empleadoId;
    if (Number.isFinite(idNum)) {
      params.id_empleado = idNum;
    }
  } else if (empleadoNombre) {
    // Mantener compatibilidad con nombre si no hay ID
    params.empleadoNombre = empleadoNombre;
  }
  // Priorizar ID de la moneda sobre nombre
  if (monedaId !== undefined && monedaId !== null && monedaId !== '') {
    const idNum = typeof monedaId === 'string' ? Number(monedaId) : monedaId;
    if (Number.isFinite(idNum) && idNum > 0) {
      params.id_moneda = idNum;
    }
  } else if (monedaNombre) {
    // Mantener compatibilidad con nombre si no hay ID
    params.moneda = monedaNombre;
  }
  // Priorizar ID del tipo de pago sobre nombre
  if (tipoPagoId !== undefined && tipoPagoId !== null && tipoPagoId !== '') {
    const idNum = typeof tipoPagoId === 'string' ? Number(tipoPagoId) : tipoPagoId;
    if (Number.isFinite(idNum) && idNum > 0) {
      params.id_tipo_pago = idNum;
    }
  } else if (tipoPagoNombre) {
    // Mantener compatibilidad con nombre si no hay ID
    params.tipo_pago = tipoPagoNombre;
  }
  if (bodegaNombre) params.bodegaNombre = bodegaNombre;
  if (estado) params.estado = estado;
  if (anulada !== undefined) {
    params.anulada = anulada === true;
  }
  // Mapear fechas: preferir dateFrom/dateTo; mantener compat con fechaInicio/fechaFin
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

  // Agregar paginación: el backend espera page y limit, no offset
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined && limit !== undefined) {
    // Convertir offset a page (page = (offset / limit) + 1)
    const page = Math.floor(offset / limit) + 1;
    params.page = page;
  } else if (options.page !== undefined) {
    // Si viene page directamente, usarlo
    params.page = options.page;
  }

  const response = await facturaApi.get('/search', { params });
  
  const raw = response.data;
  
  // Ordenar por fecha ASC (más antiguas primero) en el frontend
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    (raw as any).data.sort((a: Factura, b: Factura) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateA - dateB; // ASC
    });
  } else if (Array.isArray(raw)) {
    raw.sort((a: Factura, b: Factura) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateA - dateB; // ASC
    });
  }
  
  // Helper para filtrar facturas anuladas
  const filterAnuladas = (facturas: Factura[]): Factura[] => {
    return facturas.filter((factura) => {
      const isAnulada = factura.anulada === true;
      const isEstadoAnulado = typeof factura.estado === 'string' && factura.estado.toUpperCase() === 'ANULADA';
      return !isAnulada && !isEstadoAnulado;
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
