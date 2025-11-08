import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmpleadosAction } from '../actions/get-empleado';
import type { Empleado } from '../types/empleado.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseEmpleadoOptions {
  limit?: number;
  offset?: number;
  usePagination?: boolean;
}

export const useEmpleado = (options?: UseEmpleadoOptions) => {
  const paginationParams = options?.usePagination
    ? { limit: options.limit ?? 10, offset: options.offset ?? 0 }
    : undefined;

  const query = useQuery<PaginatedResponse<Empleado> | Empleado[]>({
    queryKey: ['empleados', paginationParams?.limit, paginationParams?.offset],
    queryFn: () => getEmpleadosAction(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear para que siempre recargue cuando cambian los parámetros
  });

  const empleados = useMemo(() => {
    if (!query.data) return [];
    if (Array.isArray(query.data)) return query.data;
    return (query.data as unknown as PaginatedResponse<Empleado>).data || [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;
    if (Array.isArray(query.data)) return query.data.length;
    return (query.data as unknown as PaginatedResponse<Empleado>).total ?? 0;
  }, [query.data]);

  return {
    empleados,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

