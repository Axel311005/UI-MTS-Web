import { motivoCitaApi } from "../api/motivo-cita.api";
import type {
  CreateMotivoCitaPayload,
  MotivoCita,
} from "../types/motivo-cita.interface";
import { EstadoActivo } from "@/shared/types/status";

export const postMotivoCitaAction = async (
  payload: CreateMotivoCitaPayload
): Promise<MotivoCita> => {
  if (!payload?.descripcion || payload.descripcion.trim() === "") {
    throw new Error("La descripción del motivo de cita es requerida");
  }
  const payloadToSend = {
    descripcion: payload.descripcion.trim(),
    estado: EstadoActivo.ACTIVO,
  };

  const { data } = await motivoCitaApi.post<MotivoCita>("/", payloadToSend);
  return data;
};
