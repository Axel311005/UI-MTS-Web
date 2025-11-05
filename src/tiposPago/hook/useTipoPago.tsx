import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTipoPagosAction } from '../actions/get-tipo-pago';
import type { TipoPago } from '../types/tipoPago.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseTipoPagoOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useTipoPago = (options?: UseTipoPagoOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<TipoPago> | TipoPago[]>({
    queryKey: ['tipoPagos', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getTipoPagosAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 10, // No cachear cuando hay paginación
  });

  const tipoPagos = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as PaginatedResponse<TipoPago>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as PaginatedResponse<TipoPago>).total ?? 0;
  }, [query.data]);

  return {
    tipoPagos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
