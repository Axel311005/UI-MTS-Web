import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Recepcion } from '../types/recepcion.interface';
import { getRecepcionAction } from '../actions/get-recepcion';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseRecepcionOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useRecepcion = (options?: UseRecepcionOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Recepcion> | Recepcion[]>({
    queryKey: [
      'recepciones',
      paginationParams?.limit,
      paginationParams?.offset,
    ],
    queryFn: () => getRecepcionAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const recepciones = useMemo(() => {
    if (!query.data) return [] as Recepcion[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Recepcion>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Recepcion>).total ?? 0;
  }, [query.data]);

  return {
    recepciones,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
