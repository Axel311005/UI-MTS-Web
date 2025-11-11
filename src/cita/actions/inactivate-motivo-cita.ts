import { motivoCitaApi } from "../api/motivo-cita.api";
import type { MotivoCita } from "../types/motivo-cita.interface";
import { EstadoActivo } from "@/shared/types/status";

export const inactivateMotivoCitaAction = async (
  id: number
): Promise<MotivoCita> => {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("ID de motivo de cita inválido");
  }

  const { data } = await motivoCitaApi.patch<MotivoCita>(`/${id}`, {
    estado: EstadoActivo.INACTIVO,
  });

  return data;
};
