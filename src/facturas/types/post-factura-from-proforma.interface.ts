/**
 * Payload para crear una factura a partir de una proforma aprobada
 * Según la documentación de la API: POST /api/factura/from-proforma
 */
export interface PostFacturaFromProformaPayload {
  /** ID de la proforma aprobada */
  proformaId: number;
  /** ID de la recepción asociada */
  recepcionId: number;
  /** ID del tipo de pago */
  tipoPagoId: number;
  /** ID de la bodega */
  bodegaId: number;
  /** ID del consecutivo para la factura */
  consecutivoId: number;
  /** ID del empleado que genera la factura */
  empleadoId: number;
  /** Comentario opcional */
  comentario?: string;
  /** Porcentaje de descuento (0-100) */
  porcentajeDescuento: number;
}

