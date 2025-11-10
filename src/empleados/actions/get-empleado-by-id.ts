import { empleadoApi } from '../api/empleado.api';
import type { Empleado } from '../types/empleado.interface';

export const getEmpleadoById = async (id: number) => {
  const { data } = await empleadoApi.get<Empleado>(`/${id}`);
  return data;
};

