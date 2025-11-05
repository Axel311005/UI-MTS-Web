import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UnidadMedida } from '../types/unidadMedida.interface';
import { getUnidadMedidasAction } from '../actions/get-unidad-medida';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseUnidadMedidaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useUnidadMedida = (options?: UseUnidadMedidaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<UnidadMedida> | UnidadMedida[]>({
    queryKey: ['unidadMedidas', paginationParams],
    queryFn: () => getUnidadMedidasAction(paginationParams),
    staleTime: 1000 * 60 * 10,
  });

  const unidadMedidas = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<UnidadMedida>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<UnidadMedida>).total ?? 0;
  }, [query.data]);

  return {
    unidadMedidas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
