export interface SeguimientoRecepcion {
  recepcionId: number;
  codigoRecepcion: string;
  estadoActual: string;
  fechaRecepcion: string;
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
  vehiculo: {
    marca: string;
    modelo: string;
    placa: string;
    color: string;
    anio: number;
    descripcion: string;
  };
  cliente: {
    nombre: string;
    telefono: string;
  };
  seguimientos: Array<{
    id: number;
    fecha: string;
    estado: string;
    descripcion: string;
  }>;
}

