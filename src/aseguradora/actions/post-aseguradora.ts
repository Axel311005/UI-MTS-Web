import { AseguradoraApi } from '../api/aseguradora.api';
import { EstadoActivo } from '@/shared/types/status';

export interface CreateAseguradoraPayload {
  descripcion: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
}

export const postAseguradoraAction = async (
  payload: CreateAseguradoraPayload
) => {
  if (!payload?.descripcion) throw new Error('Descripción requerida');
  const body = { ...payload, activo: EstadoActivo.ACTIVO };
  const { data } = await AseguradoraApi.post('/', body);
  return data;
};
