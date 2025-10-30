import { compraApi } from '../api/compra.api';
import type { Compra } from '../types/Compra.interface';

export type SearchComprasParams = {
  estado?: string;
  anulado?: boolean;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  page?: number;
  limit?: number;
  sortBy?: 'FECHA' | 'TOTAL';
  sortDir?: 'ASC' | 'DESC';
};

export const SearchComprasAction = async (
  params: SearchComprasParams
): Promise<Compra[]> => {
  const { data } = await compraApi.get<Compra[]>('/', {
    params,
  });
  return data ?? [];
};


