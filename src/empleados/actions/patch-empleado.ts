import { empleadoApi } from '../api/empleado.api';

export interface UpdateEmpleadoPayload {
  primerNombre?: string;
  primerApellido?: string;
  cedula?: string;
  telefono?: string;
  direccion?: string;
  activo?: string; // ACTIVO o INACTIVO
}

export const patchEmpleadoAction = async (
  idEmpleado: number,
  payload: UpdateEmpleadoPayload
) => {
  if (!Number.isFinite(idEmpleado)) {
    throw new Error('ID de empleado inválido');
  }
  const { data } = await empleadoApi.patch(`/${idEmpleado}`, payload);
  return data;
};

