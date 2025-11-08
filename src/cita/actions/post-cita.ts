import { citaApi } from '../api/cita.api';
import type { CreateCitaPayload } from '../types/cita.interface';

export const postCitaAction = async (payload: CreateCitaPayload) => {
  if (!payload?.idCliente || !payload?.idVehiculo || !payload?.idMotivoCita || !payload?.fechaInicio) {
    throw new Error('Faltan campos requeridos: idCliente, idVehiculo, idMotivoCita y fechaInicio');
  }
  const { data } = await citaApi.post('/', payload);
  return data;
};

