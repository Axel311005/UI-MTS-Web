import type { FacturaEstado } from "@/shared/types/status";

export interface Factura {
  id_factura: number;
  cliente: Cliente;
  tipoPago: TipoPago;
  moneda: Moneda;
  impuesto: Impuesto;
  bodega: Bodega;
  codigoFactura: string;
  fecha: Date;
  anulada: boolean;
  fechaAnulacion: string | null;
  estado: FacturaEstado;
  subtotal: number;
  porcentajeDescuento: number;
  totalDescuento: number;
  totalImpuesto: number;
  total: number;
  tipoCambioUsado: number;
  comentario: string;
  lineas: FacturaLinea[];
  consecutivo: Consecutivo | null;
}

export interface FacturaLinea {
  idFacturaLinea: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export interface TipoPago {
  idBodega?: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  idTipoPago?: number;
}

export interface Bodega {
  idBodega: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Cliente {
  idCliente: number;
  nombre: string;
  ruc: string;
  esExonerado: boolean;
  porcentajeExonerado: string;
  direccion: string;
  telefono: string;
  activo: boolean;
  notas: string;
  fechaUltModif: null;
  fechaCreacion: Date;
}

export interface Consecutivo {
  idConsecutivo: number;
  descripcion: string;
  activo: boolean;
  longitud: number;
  documento: string;
  mascara: string;
  valorInicial: number;
  valorFinal: number;
  ultimoValor: number;
  fechaCreacion: Date;
  fechaUlt: Date;
}

export interface Impuesto {
  idImpuesto: number;
  descripcion: string;
  porcentaje: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Moneda {
  idMoneda: number;
  descripcion: string;
  tipoCambio: string;
  activo: boolean;
  fechaCreacion: Date;
}
