export interface ProformaLinea {
    idProformaLineas: number;
    proforma:         Proforma;
    item:             Item;
    cantidad:         string;
    precioUnitario:   string;
    totalLinea:       string;
}

export interface Item {
    idItem:                 number;
    codigoItem:             string;
    descripcion:            string;
    tipo:                   string;
    precioBaseLocal:        string;
    precioBaseDolar:        string;
    precioAdquisicionLocal: string;
    precioAdquisicionDolar: string;
    esCotizable:            boolean;
    ultimaSalida:           Date;
    ultimoIngreso:          Date;
    usuarioUltModif:        string;
    fechaUltModif:          Date;
    perecedero:             boolean;
    fechaCreacion:          Date;
    activo:                 string;
}

export interface Proforma {
    idProforma:     number;
    codigoProforma: string;
    fecha:          Date;
    subtotal:       number;
    totalImpuesto:  number;
    observaciones:  string;
    totalEstimado:  string;
}
