import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCitasAction } from '../actions/get-cita';
import type { Cita } from '../types/cita.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseCitaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useCita = (options?: UseCitaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Cita> | Cita[]>({
    queryKey: ['citas', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getCitasAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const citas = useMemo(() => {
    if (!query.data) return [] as Cita[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Cita>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Cita>).total ?? 0;
  }, [query.data]);

  return {
    citas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

