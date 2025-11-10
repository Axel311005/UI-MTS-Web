import type { EstadoActivo } from "@/shared/types/status";

export interface MotivoCita {
  idMotivoCita: number;
  descripcion: string;
  estado: EstadoActivo;
}

export interface CreateMotivoCitaPayload {
  descripcion: string;
}

export interface UpdateMotivoCitaPayload {
  descripcion?: string;
}
