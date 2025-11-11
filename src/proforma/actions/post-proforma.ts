import { ProformaApi } from '../api/proforma.api';

export interface CreateProformaPayload {
  idTramiteSeguro: number;
  idConsecutivo: number; // Requerido según la documentación de la API
  idMoneda: number;
  idImpuesto?: number | null;
  fecha?: string | Date; // No se envía en POST, solo en PATCH
  observaciones?: string;
}

export const postProformaAction = async (payload: CreateProformaPayload) => {
  if (!payload?.idTramiteSeguro || !payload?.idMoneda) {
    throw new Error('Faltan campos requeridos: idTramiteSeguro y idMoneda');
  }
  // Según la documentación de la API, el POST acepta:
  // idTramiteSeguro (requerido), idConsecutivo (requerido según ejemplo), idMoneda (requerido), idImpuesto (opcional), observaciones (opcional)
  // NO incluye fecha (solo se usa en PATCH)
  if (!payload.idConsecutivo || payload.idConsecutivo <= 0) {
    throw new Error('idConsecutivo es requerido');
  }
  
  const cleanPayload: Record<string, any> = {
    idTramiteSeguro: payload.idTramiteSeguro,
    idConsecutivo: payload.idConsecutivo,
    idMoneda: payload.idMoneda,
  };
  
  if (payload.idImpuesto !== undefined && payload.idImpuesto !== null && payload.idImpuesto > 0) {
    cleanPayload.idImpuesto = payload.idImpuesto;
  }
  
  if (payload.observaciones && payload.observaciones.trim()) {
    cleanPayload.observaciones = payload.observaciones.trim();
  }
  
  // NO enviar fecha en POST, solo en PATCH
  const { data } = await ProformaApi.post('/', cleanPayload);
  return data;
};
