import type { TramiteSeguro } from '@/tramite-seguro/types/tramiteSeguro.interface';

export interface Proforma {
  idProforma: number;
  tramiteSeguro: TramiteSeguro; // unified type with vehiculo, cliente, etc.
  consecutivo: Consecutivo;
  moneda: Moneda;
  impuesto: Impuesto | null;
  codigoProforma: string;
  fecha: Date | string;
  subtotal: number | string;
  totalImpuesto: number | string;
  observaciones: string;
  totalEstimado: number | string;
}

export interface Consecutivo {
  idConsecutivo: number;
  descripcion: string;
  activo: string;
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
  activo: string;
  fechaCreacion: Date;
}

export interface Moneda {
  idMoneda: number;
  descripcion: string;
  tipoCambio: string;
  activo: string;
  simbolo: string;
  fechaCreacion: Date;
}

// Removed duplicate TramiteSeguro interface; canonical version imported above.
