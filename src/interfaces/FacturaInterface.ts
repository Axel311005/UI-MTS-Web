export interface Factura {
  id: number;
  numero: string;
  cliente: string;
  fecha: string;
  vencimiento: string;
  total: number;
  estado: string;
  tipoPago: string;
  moneda: string;
  bodega: string;
  impuesto: string;
}

