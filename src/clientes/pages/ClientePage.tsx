
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useState } from "react";

// Mock data for clients
const mockClientes = [
  {
    id: 1,
    nombre: "Cliente ABC S.A.",
    email: "contacto@clienteabc.com",
    telefono: "+1234567890",
    direccion: "Av. Principal 123",
    ciudad: "Ciudad Principal",
    estado: "Activo",
    facturas: 5,
    totalFacturado: 12500.00
  },
  {
    id: 2,
    nombre: "Empresa XYZ Ltda.",
    email: "admin@empresaxyz.com", 
    telefono: "+0987654321",
    direccion: "Calle Secundaria 456",
    ciudad: "Ciudad Comercial",
    estado: "Activo",
    facturas: 3,
    totalFacturado: 8750.50
  },
  {
    id: 3,
    nombre: "Corporación 123",
    email: "ventas@corp123.com",
    telefono: "+1122334455",
    direccion: "Plaza Central 789",
    ciudad: "Distrito Central",
    estado: "Inactivo",
    facturas: 8,
    totalFacturado: 25000.75
  }
];

export const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes] = useState(mockClientes);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Button className="button-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Facturas</TableHead>
                <TableHead>Total Facturado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id} className="table-row-hover">
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {cliente.telefono}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{cliente.direccion}</div>
                      <div className="text-sm text-muted-foreground">{cliente.ciudad}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={cliente.estado === "Activo" ? "default" : "secondary"}
                    >
                      {cliente.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{cliente.facturas}</TableCell>
                  <TableCell>${cliente.totalFacturado.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}