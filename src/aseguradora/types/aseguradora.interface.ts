import type { EstadoActivo } from "@/shared/types/status";

export interface Aseguradora {
  idAseguradora: number;
  descripcion: string;
  telefono: string;
  direccion: string;
  contacto: string;
  activo: EstadoActivo;
}
