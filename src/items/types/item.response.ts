import type { FacturaLinea } from '@/facturas/types/Factura.interface';

export type ItemEstado = 'ACTIVO' | 'INACTIVO';

export interface ItemResponse {
  idItem: number;
  clasificacion: Clasificacion;
  unidadMedida: Clasificacion;
  codigoItem: string;
  descripcion: string;
  tipo: string;
  precioBaseLocal: string;
  precioBaseDolar: string;
  precioAdquisicionLocal: string;
  precioAdquisicionDolar: string;
  esCotizable: boolean;
  ultimaSalida: Date;
  ultimoIngreso: Date;
  usuarioUltModif: string;
  fechaUltModif: Date;
  perecedero: boolean;
  fechaCreacion: Date;
  estado: ItemEstado;
  activo?: boolean;
  facturaLineas: FacturaLinea[];
  compraLineas: CompraLinea[];
  existencias: Existencia[];
}

export interface Clasificacion {
  idClasificacion?: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: Date;
  idUnidadMedida?: number;
}

export interface CompraLinea {
  idCompraLinea?: number;
  cantidad: string;
  precioUnitario: string;
  totalLinea: string;
  idFacturaLinea?: number;
}

export interface Existencia {
  idExistenciaBodega: number;
  cantDisponible: string;
  existenciaMaxima: string;
  existenciaMinima: string;
  puntoDeReorden: string;
}
