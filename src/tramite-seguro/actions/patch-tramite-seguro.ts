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
  try {
    const { data } = await TramiteSeguroApi.patch(`/${idTramiteSeguro}`, payload);
    return data;
  } catch (error: any) {
    // Extraer el mensaje del backend buscando en múltiples lugares posibles
    const responseData = error?.response?.data;
    let backendMessage: string | undefined;
    
    if (responseData) {
      // Intentar diferentes campos donde puede estar el mensaje
      backendMessage =
        responseData.message ||
        responseData.error ||
        (typeof responseData === 'string' ? responseData : undefined);
    }
    
    // Si encontramos un mensaje del backend, usarlo
    if (backendMessage) {
      const enhancedError = new Error(backendMessage);
      // Preservar la respuesta original para que el componente pueda acceder a ella
      (enhancedError as any).response = error.response;
      throw enhancedError;
    }
    
    // Si no hay mensaje del backend, lanzar el error original con toda su información
    console.error('Error completo del backend:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
};
