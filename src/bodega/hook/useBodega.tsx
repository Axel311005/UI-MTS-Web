import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBodegasAction } from '../actions/get-bodega';
import type { Bodega } from '../types/bodega.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseBodegaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useBodega = (options?: UseBodegaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Bodega> | Bodega[]>({
    queryKey: ['bodegas', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getBodegasAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
  });

  const bodegas = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Bodega>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Bodega>).total ?? 0;
  }, [query.data]);

  return {
    bodegas,
    totalItems,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
