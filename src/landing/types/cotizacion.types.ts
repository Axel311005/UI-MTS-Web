export interface ItemCotizable {
  idItem: number;
  codigoItem: string;
  descripcion: string;
  precioUnitario: number;
  precioBaseLocal?: number; // Precio base local del item
  tipo: 'PRODUCTO' | 'SERVICIO';
}

export interface CreateCotizacionPayload {
  idCliente: number;
  idConsecutivo: number;
  estado: 'GENERADA';
  nombreCliente: string;
}

export interface CreateDetalleCotizacionPayload {
  idItem: number;
  idCotizacion: number;
  cantidad: number;
  precioUnitario: number;
  totalLineas: number;
}

