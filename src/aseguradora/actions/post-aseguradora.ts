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

  // Limpiar campos opcionales: si están vacíos, enviar undefined en lugar de string vacío
  const body = {
    descripcion: payload.descripcion.trim(),
    telefono: payload.telefono?.replace(/[+\s]/g, '').trim() || undefined, // Remover + y espacios por seguridad
    direccion: payload.direccion?.trim() || undefined,
    contacto: payload.contacto?.trim() || undefined,
    activo: EstadoActivo.ACTIVO,
  };

  try {
    const { data } = await AseguradoraApi.post('/', body);
    return data;
  } catch (error: any) {
    // Extraer mensaje de error más descriptivo
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (Array.isArray(error?.response?.data)
        ? error?.response?.data.join(', ')
        : undefined) ||
      error?.message ||
      'No se pudo crear la aseguradora';

    throw new Error(errorMessage);
  }
};
