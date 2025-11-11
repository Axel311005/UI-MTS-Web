import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TramiteSeguro } from '../types/tramiteSeguro.interface';
import { getTramiteSeguroAction } from '../actions/get-tramite-seguro';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseTramiteSeguroOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useTramiteSeguro = (options?: UseTramiteSeguroOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<TramiteSeguro> | TramiteSeguro[]>({
    queryKey: [
      'tramiteSeguros',
      paginationParams?.limit,
      paginationParams?.offset,
    ],
    queryFn: () => getTramiteSeguroAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const tramiteSeguros = useMemo(() => {
    if (!query.data) return [] as TramiteSeguro[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<TramiteSeguro>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<TramiteSeguro>).total ?? 0;
  }, [query.data]);

  return {
    tramiteSeguros,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
