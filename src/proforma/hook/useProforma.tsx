import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Proforma } from '../types/proforoma.interface';
import { getProformaAction } from '../actions/get-proforma';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseProformaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useProforma = (options?: UseProformaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Proforma> | Proforma[]>({
    queryKey: ['proformas', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getProformaAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const proformas = useMemo(() => {
    if (!query.data) return [] as Proforma[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Proforma>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Proforma>).total ?? 0;
  }, [query.data]);

  return {
    proformas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
