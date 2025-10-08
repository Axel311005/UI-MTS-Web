import { facturaApi } from '../api/factura.api';
import type { Factura } from '../types/Factura.interface';

interface SearchFacturaOptions {
  codigoFactura?: string; // exacto
  codigoLike?: string; // parcial
  clienteNombre?: string;
  bodegaNombre?: string;
  estado?: string;
  anulada?: string | boolean;
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
  minTotal?: string | number;
  maxTotal?: string | number;
}

export const SearchFacturaAction = async (options: SearchFacturaOptions) => {
  // Normalizar valores (el objeto filters viene de URLSearchParams => strings)
  const {
    codigoFactura,
    codigoLike,
    clienteNombre,
    bodegaNombre,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    minTotal,
    maxTotal,
  } = options;

  // Determinar si hay al menos un criterio (incluyendo codigoFactura)
  const hasAny = [
    codigoFactura,
    codigoLike,
    clienteNombre,
    bodegaNombre,
    estado,
    anulada,
    fechaInicio,
    fechaFin,
    minTotal,
    maxTotal,
  ].some((v) => v !== undefined && v !== '' && v !== null);
  if (!hasAny) return [];

  const params: Record<string, unknown> = {};
  if (codigoFactura) params.codigoFactura = codigoFactura;
  if (codigoLike) params.codigoLike = codigoLike;
  if (clienteNombre) params.clienteNombre = clienteNombre;
  if (bodegaNombre) params.bodegaNombre = bodegaNombre;
  if (estado) params.estado = estado;
  if (anulada !== undefined) {
    params.anulada = anulada === true;
  }
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;
  if (minTotal !== undefined && minTotal !== '') params.minTotal = minTotal;
  if (maxTotal !== undefined && maxTotal !== '') params.maxTotal = maxTotal;

  const response = await facturaApi.get('/search', { params });
  // Debug
  // eslint-disable-next-line no-console
  console.log('[SearchFacturaAction] GET /search', {
    requestedParams: params,
    url: facturaApi.getUri({ url: '/search', params }),
    raw: response.data,
  });

  const raw = response.data;
  if (Array.isArray(raw)) return raw as Factura[];
  if (raw && Array.isArray(raw.data)) return raw.data as Factura[];
  if (raw && Array.isArray(raw.results)) return raw.results as Factura[];
  return [];
};
