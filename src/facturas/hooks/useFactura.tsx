import { useQuery } from '@tanstack/react-query';
import { getFacturasAction } from '../actions/get-facturas';
import type { Factura } from '../types/Factura.interface';

export const useFactura = () => {
  const query = useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: getFacturasAction,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  return {
    facturas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
