import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMotivosCitaAction } from '../actions/get-motivo-cita';
import type { MotivoCita } from '../types/motivo-cita.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseMotivoCitaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useMotivoCita = (options?: UseMotivoCitaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<MotivoCita> | MotivoCita[]>({
    queryKey: ['motivosCita', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getMotivosCitaAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const motivosCita = useMemo(() => {
    if (!query.data) return [] as MotivoCita[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<MotivoCita>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<MotivoCita>).total ?? 0;
  }, [query.data]);

  return {
    motivosCita,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

