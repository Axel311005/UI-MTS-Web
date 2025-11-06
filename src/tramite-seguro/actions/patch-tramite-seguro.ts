import { TramiteSeguroApi } from '../api/tramiteSeguro.api';
import { TramiteSeguroEstado } from '@/shared/types/status';

export interface UpdateTramiteSeguroPayload {
  idVehiculo?: number;
  idCliente?: number;
  idAseguradora?: number;
  numeroTramite?: string;
  estado?: TramiteSeguroEstado;
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
  observaciones?: string;
}

export const patchTramiteSeguroAction = async (
  idTramiteSeguro: number,
  payload: UpdateTramiteSeguroPayload
) => {
  if (!Number.isFinite(idTramiteSeguro))
    throw new Error('ID de trámite inválido');
  const { data } = await TramiteSeguroApi.patch(`/${idTramiteSeguro}`, payload);
  return data;
};
