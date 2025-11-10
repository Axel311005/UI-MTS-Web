import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ClasificacionItem } from '../types/clasificacionItem.interface';
import { getClasificacionItemsAction } from '../actions/get-clasificacion-item';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseClasificacionItemOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useClasificacionItem = (options?: UseClasificacionItemOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<ClasificacionItem> | ClasificacionItem[]>({
    queryKey: ['clasificacionItems', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getClasificacionItemsAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
    placeholderData: (previousData) => previousData,
  });

  const clasificacionItems = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<ClasificacionItem>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<ClasificacionItem>).total ?? 0;
  }, [query.data]);

  return {
    clasificacionItems,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
