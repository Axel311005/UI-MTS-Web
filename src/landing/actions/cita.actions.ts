import { landingCitaApi } from '../api/landing.api';
import type {
  MotivoCita,
  CreateMotivoCitaPayload,
  CreateCitaPayload,
} from '../types/cita.types';

export const getMotivosCita = async (): Promise<MotivoCita[]> => {
  try {
    const { data } = await landingCitaApi.get<MotivoCita[]>('/motivo-cita');
    const motivos = Array.isArray(data) ? data : [];
    // Filtrar solo los motivos activos
    return motivos.filter((motivo) => 
      motivo.estado === 'ACTIVO' || motivo.estado === undefined || motivo.estado === null
    );
  } catch (error: any) {
    // Si el endpoint requiere permisos de admin y el usuario es cliente,
    // simplemente retornar un array vacío. El cliente puede crear su propio motivo.
    return [];
  }
};

export const createMotivoCita = async (
  payload: CreateMotivoCitaPayload
): Promise<{ idMotivoCita: number }> => {
  const { data } = await landingCitaApi.post<{ idMotivoCita: number }>('/motivo-cita', payload);
  return data;
};

export const createCita = async (payload: CreateCitaPayload): Promise<{ idCita: number }> => {
  const { data } = await landingCitaApi.post<{ idCita: number }>('/cita', payload);
  return data;
};

