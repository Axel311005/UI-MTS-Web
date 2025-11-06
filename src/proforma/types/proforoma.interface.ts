export interface Proforma {
  idProforma:     number;
  tramiteSeguro:  TramiteSeguro;
  consecutivo:    Consecutivo;
  moneda:         Moneda;
  impuesto:       Impuesto | null;
  codigoProforma: string;
  fecha:          Date;
  subtotal:       number;
  totalImpuesto:  number;
  observaciones:  string;
  totalEstimado:  string;
}

export interface Consecutivo {
  idConsecutivo: number;
  descripcion:   string;
  activo:        string;
  longitud:      number;
  documento:     string;
  mascara:       string;
  valorInicial:  number;
  valorFinal:    number;
  ultimoValor:   number;
  fechaCreacion: Date;
  fechaUlt:      Date;
}

export interface Impuesto {
  idImpuesto:    number;
  descripcion:   string;
  porcentaje:    string;
  activo:        string;
  fechaCreacion: Date;
}

export interface Moneda {
  idMoneda:      number;
  descripcion:   string;
  tipoCambio:    string;
  activo:        string;
  simbolo:       string;
  fechaCreacion: Date;
}

export interface TramiteSeguro {
  idTramiteSeguro: number;
  numeroTramite:   string;
  estado:          string;
  fechaInicio:     Date;
  fechaFin:        Date;
  observaciones:   string;
}
