import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Moneda } from '../types/Moneda.interface';
import { getMonedasAction } from '../actions/get-moneda';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseMonedaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useMoneda = (options?: UseMonedaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Moneda> | Moneda[]>({
    queryKey: ['monedas', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getMonedasAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 10, // No cachear cuando hay paginación
  });

  const monedas = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Moneda>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as unknown as PaginatedResponse<Moneda>).total ?? 0;
  }, [query.data]);

  return {
    monedas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
