import { RecepcionSeguimientoApi } from '../api/recepcion-seguimiento.api';
import type { RecepcionSeguimientoEstado } from '@/shared/types/status';

export interface CreateRecepcionSeguimientoPayload {
  idRecepcion: number;
  fecha?: string | Date;
  estado: RecepcionSeguimientoEstado;
  descripcion: string;
}

export const postRecepcionSeguimientoAction = async (
  payload: CreateRecepcionSeguimientoPayload
) => {
  if (!payload?.idRecepcion || !payload?.estado || !payload?.descripcion) {
    throw new Error(
      'Faltan campos requeridos: idRecepcion, estado y descripcion'
    );
  }
  const { data } = await RecepcionSeguimientoApi.post('/', payload);
  return data;
};

