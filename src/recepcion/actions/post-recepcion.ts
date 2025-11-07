import { RecepcionApi } from '../api/recepcion.api';
import { RecepcionEstado } from '@/shared/types/status';

export interface CreateRecepcionPayload {
  idVehiculo: number;
  idEmpleado: number;
  fechaRecepcion?: string | Date;
  observaciones?: string;
  estado?: RecepcionEstado;
  fechaEntregaEstimada?: string | Date;
  fechaEntregaReal?: string | Date;
}

export const postRecepcionAction = async (payload: CreateRecepcionPayload) => {
  if (
    !payload?.idVehiculo ||
    !payload?.idEmpleado
  ) {
    throw new Error(
      'Faltan campos requeridos: idVehiculo e idEmpleado'
    );
  }
  const body = {
    ...payload,
    estado: payload.estado ?? RecepcionEstado.PENDIENTE,
  };
  const { data } = await RecepcionApi.post('/', body);
  return data;
};
