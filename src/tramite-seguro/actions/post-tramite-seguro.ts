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
  try {
    const { data } = await TramiteSeguroApi.post('/', body);
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
    
    // Si no hay mensaje del backend, lanzar el error original
    throw error;
  }
};
