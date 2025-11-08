import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCotizacionesAction } from '../actions/get-cotizacion';
import type { Cotizacion } from '../types/cotizacion.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseCotizacionOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useCotizacion = (options?: UseCotizacionOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Cotizacion> | Cotizacion[]>({
    queryKey: ['cotizaciones', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getCotizacionesAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
  });

  const cotizaciones = useMemo(() => {
    if (!query.data) return [] as Cotizacion[];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Cotizacion>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Cotizacion>).total ?? 0;
  }, [query.data]);

  return {
    cotizaciones,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

