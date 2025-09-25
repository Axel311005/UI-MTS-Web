import type { Factura } from '@/facturas/interfaces/FacturaInterface';
import type { Filter } from '@/facturas/interfaces/FilterState';

const SENTINELS = new Set<string>([
  'Todos los estados',
  'Todos los tipos',
  'Todos los clientes',
  'Todas las monedas',
  'Todas las bodegas',
  'Todos los impuestos',
  '',
]);

export interface FilterParams {
  items: Factura[];
  filters: Filter;
  search: string;
}

export function filterFacturas({ items, filters, search }: FilterParams) {
  const s = (search ?? '').toLowerCase();

  const parseDate = (v: string) => (v ? new Date(v) : undefined);
  const from = parseDate(filters.fechaDesde);
  const to = parseDate(filters.fechaHasta);

  const min = filters.montoMin
    ? Number.parseFloat(filters.montoMin)
    : undefined;
  const max = filters.montoMax
    ? Number.parseFloat(filters.montoMax)
    : undefined;

  return items.filter((f) => {
    // texto
    const matchesText =
      !s ||
      f.numero.toLowerCase().includes(s) ||
      f.cliente.toLowerCase().includes(s);

    // selects con sentinelas
    const byCodigo =
      !filters.codigoFactura || f.numero.includes(filters.codigoFactura);
    const byCliente =
      SENTINELS.has(filters.cliente) || f.cliente === filters.cliente;
    const byEstado =
      SENTINELS.has(filters.estado) || f.estado === filters.estado;
    const byTipo =
      SENTINELS.has(filters.tipoPago) || f.tipoPago === filters.tipoPago;
    const byMoneda =
      SENTINELS.has(filters.moneda) || f.moneda === filters.moneda;
    const byBodega =
      SENTINELS.has(filters.bodega) || f.bodega === filters.bodega;
    const byImpuesto =
      SENTINELS.has(filters.impuesto) || f.impuesto === filters.impuesto;

    // fechas (inclusive)
    const date = new Date(f.fecha);
    const byFrom = !from || date >= from;
    const byTo = !to || date <= to;

    // montos
    const byMin = min === undefined || f.total >= min;
    const byMax = max === undefined || f.total <= max;

    return (
      matchesText &&
      byCodigo &&
      byCliente &&
      byEstado &&
      byTipo &&
      byMoneda &&
      byBodega &&
      byImpuesto &&
      byFrom &&
      byTo &&
      byMin &&
      byMax
    );
  });
}
