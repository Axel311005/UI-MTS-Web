import { clienteApi } from '../api/cliente.api';
import type { Cliente } from '../types/cliente.interface';

export const getClientesAction = async () => {
  const { data: clientes } = await clienteApi.get<Cliente[]>('/');
  return clientes.filter((c) => c.activo);
};
