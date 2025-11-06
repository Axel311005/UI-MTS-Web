import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVehiculoAction } from '../actions/get-vehiculo';
import type { Vehiculo } from '../types/vehiculo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseVehiculoOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useVehiculo = (options?: UseVehiculoOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Vehiculo> | Vehiculo[]>({
    queryKey: ['vehiculos', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getVehiculoAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const vehiculos = useMemo(() => {
    if (!query.data) return [] as Vehiculo[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Vehiculo>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Vehiculo>).total ?? 0;
  }, [query.data]);

  return {
    vehiculos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
