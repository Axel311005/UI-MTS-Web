import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExistenciaBodegasAction } from '../actions/get-existencia-bodega';
import type { ExistenciaBodega } from '../types/existenciaBodega.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseExistenciaBodegaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

// Nota: usamos un queryKey único para no colisionar con el de bodega
export const useExistenciaBodega = (options?: UseExistenciaBodegaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<ExistenciaBodega> | ExistenciaBodega[]>({
    queryKey: ['existencia-bodega', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getExistenciaBodegasAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
    placeholderData: (previousData) => previousData,
  });

  const existencias = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<ExistenciaBodega>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<ExistenciaBodega>).total ?? 0;
  }, [query.data]);

  return {
    existencias,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// Compatibilidad hacia atrás si en algún lugar se importó useBodega
export const useBodega = useExistenciaBodega;
