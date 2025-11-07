import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RecepcionSeguimiento } from '../types/recepcion-seguimiento.interface';
import { getRecepcionSeguimientoAction } from '../actions/get-recepcion-seguimiento';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseRecepcionSeguimientoOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useRecepcionSeguimiento = (
  options?: UseRecepcionSeguimientoOptions
) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<
    PaginatedResponse<RecepcionSeguimiento> | RecepcionSeguimiento[]
  >({
    queryKey: [
      'recepcion-seguimiento',
      paginationParams?.limit,
      paginationParams?.offset,
    ],
    queryFn: () => getRecepcionSeguimientoAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const seguimientos = useMemo(() => {
    if (!query.data) return [] as RecepcionSeguimiento[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<RecepcionSeguimiento>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<RecepcionSeguimiento>).total ?? 0;
  }, [query.data]);

  return {
    seguimientos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

