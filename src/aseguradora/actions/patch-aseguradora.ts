import { AseguradoraApi } from '../api/aseguradora.api';
import { EstadoActivo } from '@/shared/types/status';

export interface UpdateAseguradoraPayload {
  descripcion?: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
  activo?: EstadoActivo;
}

export const patchAseguradoraAction = async (
  idAseguradora: number,
  payload: UpdateAseguradoraPayload
) => {
  if (!Number.isFinite(idAseguradora))
    throw new Error('ID de aseguradora inválido');
  const { data } = await AseguradoraApi.patch(`/${idAseguradora}`, payload);
  return data;
};
