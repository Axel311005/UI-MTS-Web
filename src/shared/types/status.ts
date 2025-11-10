export const FacturaEstado = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  ANULADA: 'ANULADA',
} as const;

export type FacturaEstado = (typeof FacturaEstado)[keyof typeof FacturaEstado];

export const CajaEstado = {
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
  ANULADA: 'ANULADA',
} as const;

export type CajaEstado = (typeof CajaEstado)[keyof typeof CajaEstado];

export const CitaEstado = {
  PROGRAMADA: 'PROGRAMADA',
  CONFIRMADA: 'CONFIRMADA',
  EN_PROCESO: 'EN PROCESO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
} as const;

export type CitaEstado = (typeof CitaEstado)[keyof typeof CitaEstado];

export const CompraEstado = {
  PENDIENTE: 'PENDIENTE',
  COMPLETADA: 'COMPLETADA',
  ANULADA: 'ANULADA',
} as const;

export type CompraEstado = (typeof CompraEstado)[keyof typeof CompraEstado];

export const CotizacionEstado = {
  GENERADA: 'GENERADA',
  CADUCADA: 'CADUCADA',
} as const;

export type CotizacionEstado =
  (typeof CotizacionEstado)[keyof typeof CotizacionEstado];

export const RecepcionEstado = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN PROCESO',
  FINALIZADO: 'FINALIZADO',
  ENTREGADO: 'ENTREGADO',
} as const;

export type RecepcionEstado =
  (typeof RecepcionEstado)[keyof typeof RecepcionEstado];

export const RecepcionSeguimientoEstado = {
  PENDIENTE_DIAGNOSTICO: 'PENDIENTE DE DIAGNOSTICO',
  ESPERA_APROBACION: 'ESPERA APROBACION',
  EN_REPARACION: 'EN REPARACION',
  EN_ESPERA_REPUESTOS: 'EN ESPERA REPUESTOS',
  PRUEBAS: 'PRUEBAS',
  LISTO_PARA_ENTREGAR: 'LISTO PARA ENTREGAR',
  CANCELADO: 'CANCELADO',
} as const;

export type RecepcionSeguimientoEstado =
  (typeof RecepcionSeguimientoEstado)[keyof typeof RecepcionSeguimientoEstado];

export const TramiteSeguroEstado = {
  INICIADO: 'INICIADO',
  EN_REVISION: 'EN REVISION',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  CERRADO: 'CERRADO',
  PENDIENTE_DE_PAGO: 'PENDIENTE DE PAGO',
} as const;

export type TramiteSeguroEstado =
  (typeof TramiteSeguroEstado)[keyof typeof TramiteSeguroEstado];

export const EstadoActivo = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
} as const;

export type EstadoActivo = (typeof EstadoActivo)[keyof typeof EstadoActivo];

export const ItemTipo = {
  PRODUCTO: 'PRODUCTO',
  SERVICIO: 'SERVICIO',
} as const;

export type ItemTipo = (typeof ItemTipo)[keyof typeof ItemTipo];
