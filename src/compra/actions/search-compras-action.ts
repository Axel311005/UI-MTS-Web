import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';

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
): Promise<Compra[]> => {
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
    sortBy,
    sortDir,
  } = options ?? {};

  // Determinar si hay algún criterio
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
    page,
    limit,
    sortBy,
    sortDir,
  ].some((v) => v !== undefined && v !== null && String(v).trim?.() !== '');
  if (!hasAny) return [];

  const params: Record<string, unknown> = {};
  if (codigo_compra) params.codigo_compra = codigo_compra;
  if (codigoLike) params.codigoLike = codigoLike;

  if (bodegaNombre) params.bodegaNombre = bodegaNombre;
  if (empleadoNombre) params.empleadoNombre = empleadoNombre;
  if (tipo_pago) params.tipo_pago = tipo_pago;
  if (moneda) params.moneda = moneda;

  if (id_bodega !== undefined && id_bodega !== '') params.id_bodega = id_bodega;
  if (id_empleado !== undefined && id_empleado !== '')
    params.id_empleado = id_empleado;
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
  const to = dateTo ?? fechaFin;
  if (from) params.dateFrom = from;
  if (to) params.dateTo = to;

  if (minTotal !== undefined && minTotal !== '') params.minTotal = minTotal;
  if (maxTotal !== undefined && maxTotal !== '') params.maxTotal = maxTotal;

  if (page !== undefined && page !== '') params.page = page;
  if (limit !== undefined && limit !== '') params.limit = limit;
  if (sortBy) params.sortBy = sortBy; // enviar valor en minúscula según DTO
  if (sortDir) params.sortDir = sortDir;

  const response = await compraApi.get('/search', { params });
  const raw = response.data as unknown;
  if (Array.isArray(raw)) return raw as Compra[];
  if (raw && Array.isArray((raw as any).data))
    return (raw as any).data as Compra[];
  if (raw && Array.isArray((raw as any).results))
    return (raw as any).results as Compra[];
  return [];
};
