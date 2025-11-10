export interface MotivoCita {
  idMotivoCita: number;
  descripcion: string;
  estado?: "ACTIVO" | "INACTIVO";
}

export interface CreateMotivoCitaPayload {
  descripcion: string;
}

export interface CreateCitaPayload {
  idCliente: number;
  idVehiculo: number;
  idMotivoCita: number;
  fechaInicio: string;
  estado: "PROGRAMADA";
  canal: "web";
}

export interface Vehiculo {
  idVehiculo: number;
  placa: string;
  motor?: string;
  marca: string;
  modelo: string;
  color: string;
  anio: number;
  numChasis?: string;
  cliente?: {
    idCliente: number;
  };
  idCliente?: number; // Fallback si viene directamente
  activo?: string | number; // Para filtrar solo activos
}
