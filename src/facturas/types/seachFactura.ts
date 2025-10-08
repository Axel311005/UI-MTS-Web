import type { Factura } from './Factura.interface';

export interface SearchFactura {
  data: Factura[];
  meta: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
