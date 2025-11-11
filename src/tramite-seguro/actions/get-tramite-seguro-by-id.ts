import { TramiteSeguroApi } from '../api/tramiteSeguro.api';
import type { TramiteSeguro } from '../types/tramiteSeguro.interface';

export const getTramiteSeguroByIdAction = async (
  idTramiteSeguro: number
): Promise<TramiteSeguro> => {
  if (!Number.isFinite(idTramiteSeguro) || idTramiteSeguro <= 0) {
    throw new Error('ID de trámite inválido');
  }

  try {
    const { data } = await TramiteSeguroApi.get<TramiteSeguro>(
      `/${idTramiteSeguro}`
    );

    if (!data) {
      throw new Error('No se encontró el trámite de seguro solicitado');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo obtener el trámite de seguro');
  }
};
