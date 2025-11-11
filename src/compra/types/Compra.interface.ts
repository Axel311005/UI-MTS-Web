export interface Compra {
  idCompra: number;
  moneda: Moneda;
  tipoPago: TipoPago;
  impuesto: Impuesto;
  bodega: Bodega;
  codigoCompra: string;
  fecha: string; // ISO
  estado: string; // PENDIENTE | COMPLETADA | ANULADA
  anulado: boolean;
  fechaAnulacion: string | null;
  subtotal: number | string;
  totalImpuesto: number | string;
  porcentajeDescuento: number | string;
  totalDescuento: number | string;
  total: number | string;
  tipoCambioUsado: number | string;
  comentario: string;
  lineas: CompraLinea[];
}

export interface CompraLinea {
  idCompraLinea: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export interface Moneda {
  idMoneda: number;
  descripcion: string;
  tipoCambio: string;
  simbolo?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface TipoPago {
  idTipoPago: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface Impuesto {
  idImpuesto: number;
  descripcion: string;
  porcentaje: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface Bodega {
  idBodega: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
}
