// Configuration for Facturas filters UI: select options and badge labels
// Keeping these centralized lets us reuse and lazy-load UI without duplicating strings.

export const selectOptions = {
  cliente: [
    'Todos los clientes',
    'Cliente ABC S.A.',
    'Empresa XYZ Ltda.',
    'Corporación 123',
  ],
  estado: ['Todos los estados', 'Pagada', 'Pendiente', 'Vencida'],
  tipoPago: [
    'Todos los tipos',
    'Efectivo',
    'Transferencia',
    'Crédito',
    'Tarjeta',
  ],
  moneda: ['Todas las monedas', 'CRC', 'USD', 'EUR'],
  bodega: ['Todas las bodegas', 'Bodega Central', 'Bodega Norte', 'Bodega Sur'],
  impuesto: ['Todos los impuestos', 'IVA 13%', 'IVA 4%', 'Exento'],
} as const;

export type SelectOptions = typeof selectOptions;

export const badgeLabelMap: Record<string, string> = {
  codigoFactura: 'Código Factura',
  cliente: 'Cliente',
  estado: 'Estado',
  tipoPago: 'Tipo de Pago',
  moneda: 'Moneda',
  bodega: 'Bodega',
  impuesto: 'Impuesto',
  fechaDesde: 'Desde',
  fechaHasta: 'Hasta',
  montoMin: 'Monto Min',
  montoMax: 'Monto Max',
};
