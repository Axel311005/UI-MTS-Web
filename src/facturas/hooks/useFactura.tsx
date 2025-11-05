import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFacturasAction } from '../actions/get-facturas';
import type { Factura } from '../types/Factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseFacturaOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useFactura = (options?: UseFacturaOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Factura> | Factura[]>({
    queryKey: ['facturas', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getFacturasAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
  });

  const facturas = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Factura>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<Factura>).total ?? 0;
  }, [query.data]);

  return {
    facturas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
