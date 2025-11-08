import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Impuesto } from '../types/impuesto.interface';
import { getImpuestoAction } from '../actions/get-impuesto';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseImpuestoOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useImpuesto = (options?: UseImpuestoOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Impuesto> | Impuesto[]>({
    queryKey: ['impuestos', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getImpuestoAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 10, // No cachear cuando hay paginación
  });

  const impuestos = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<Impuesto>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as unknown as PaginatedResponse<Impuesto>).total ?? 0;
  }, [query.data]);

  return {
    impuestos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
