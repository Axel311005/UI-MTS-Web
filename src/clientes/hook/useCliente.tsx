import { useQuery } from '@tanstack/react-query';
import { getClientesAction } from '../actions/get-cliente';

import type {  Cliente } from '../types/cliente.interface';

export const useCliente = () => {
  const query = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: getClientesAction,
    staleTime: 1000 * 60 * 5,
  });
  return {
    clientes: query.data,
  };
};
