import type { Compra } from './Compra.interface';

export interface SearchCompra {
  data: Compra[];
  meta: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
