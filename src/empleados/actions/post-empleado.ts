import { empleadoApi } from '../api/empleado.api';
import { EstadoActivo } from '@/shared/types/status';

export interface CreateEmpleadoPayload {
  primerNombre: string;
  primerApellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  activo?: EstadoActivo;
}

export const createEmpleadoAction = async (payload: CreateEmpleadoPayload) => {
  const { data } = await empleadoApi.post('/', {
    ...payload,
    activo: payload.activo || EstadoActivo.ACTIVO,
  });
  return data;
};

