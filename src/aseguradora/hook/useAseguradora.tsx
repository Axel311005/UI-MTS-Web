import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAseguradoraAction } from '../actions/get-aseguradora';
import type { Aseguradora } from '../types/aseguradora.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseAseguradoraOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useAseguradora = (options?: UseAseguradoraOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Aseguradora> | Aseguradora[]>({
    queryKey: [
      'aseguradoras',
      paginationParams?.limit,
      paginationParams?.offset,
    ],
    queryFn: () => getAseguradoraAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const aseguradoras = useMemo(() => {
    if (!query.data) return [] as Aseguradora[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Aseguradora>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Aseguradora>).total ?? 0;
  }, [query.data]);

  return {
    aseguradoras,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
