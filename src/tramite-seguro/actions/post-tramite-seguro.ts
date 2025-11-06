import { TramiteSeguroApi } from '../api/tramiteSeguro.api';
import { TramiteSeguroEstado } from '@/shared/types/status';

export interface CreateTramiteSeguroPayload {
  idVehiculo: number;
  idCliente: number;
  idAseguradora: number;
  numeroTramite: string;
  estado?: TramiteSeguroEstado;
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
  observaciones?: string;
}

export const postTramiteSeguroAction = async (
  payload: CreateTramiteSeguroPayload
) => {
  if (
    !payload?.idVehiculo ||
    !payload?.idCliente ||
    !payload?.idAseguradora ||
    !payload?.numeroTramite
  ) {
    throw new Error(
      'Faltan campos requeridos: idVehiculo, idCliente, idAseguradora y numeroTramite'
    );
  }
  const body = {
    ...payload,
    estado: payload.estado ?? TramiteSeguroEstado.INICIADO,
  };
  const { data } = await TramiteSeguroApi.post('/', body);
  return data;
};
