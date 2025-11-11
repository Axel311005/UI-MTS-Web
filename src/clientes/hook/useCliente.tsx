import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientesAction } from '../actions/get-cliente';
import type { Cliente } from '../types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseClienteOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useCliente = (options?: UseClienteOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Cliente> | Cliente[]>({
    queryKey: ['clientes', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getClientesAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear para que siempre recargue cuando cambian los parámetros
  });

  const clientes = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as unknown as PaginatedResponse<Cliente>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as unknown as PaginatedResponse<Cliente>).total ?? 0;
  }, [query.data]);

  return {
    clientes,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
