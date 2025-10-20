export interface Consecutivo {
    idConsecutivo: number;
    descripcion:   string;
    activo:        boolean;
    longitud:      number;
    documento:     string;
    mascara:       string;
    valorInicial:  number;
    valorFinal:    number;
    ultimoValor:   number;
    fechaCreacion: Date;
    fechaUlt:      Date;
}
