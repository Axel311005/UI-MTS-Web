export interface MotivoCita {
  idMotivoCita: number;
  descripcion: string;
}

export interface CreateMotivoCitaPayload {
  descripcion: string;
}

export interface UpdateMotivoCitaPayload {
  descripcion?: string;
}

