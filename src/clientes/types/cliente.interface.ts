export interface Cliente {
  idCliente: number;
  nombre: string;
  ruc: string;
  esExonerado: boolean;
  porcentajeExonerado: string;
  direccion: string;
  telefono: string;
  activo: boolean;
  notas: string;
  fechaUltModif: null;
  fechaCreacion: Date;
}
