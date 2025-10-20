export interface AuthResponse {
  id:       string;
  email:    string;
  roles:    string[];
  empleado: Empleado;
  cliente:  null;
  token:    string;
}

export interface Empleado {
  id:             number;
  nombreCompleto: string;
}
