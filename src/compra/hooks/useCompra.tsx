import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComprasAction } from '../actions/get-compras';
import type { Compra } from '../types/Compra.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseCompraOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useCompra = (options?: UseCompraOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Compra> | Compra[]>({
    queryKey: ['compras', paginationParams],
    queryFn: () => getComprasAction(paginationParams),
    staleTime: 1000 * 60 * 5,
  });

  const compras = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Compra>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Compra>).total ?? 0;
  }, [query.data]);

  return {
    compras,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
