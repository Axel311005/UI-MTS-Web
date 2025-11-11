import { clienteApi } from '../api/cliente.api';
import type { Cliente } from '../types/cliente.interface';

export const getClienteById = async (id: number) => {
  const { data } = await clienteApi.get<Cliente>(`/${id}`);
  return data;
};
