import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

const mockFacturas = [
  {
    id: 1,
    numero: 'FAC-001',
    cliente: 'Cliente ABC S.A.',
    fecha: '2024-01-15',
    vencimiento: '2024-02-15',
    total: 1850.0,
    estado: 'Pagada',
    tipoPago: 'Transferencia',
  },
  {
    id: 2,
    numero: 'FAC-002',
    cliente: 'Empresa XYZ Ltda.',
    fecha: '2024-01-16',
    vencimiento: '2024-02-16',
    total: 950.75,
    estado: 'Pendiente',
    tipoPago: 'Efectivo',
  },
  {
    id: 3,
    numero: 'FAC-003',
    cliente: 'Corporación 123',
    fecha: '2024-01-17',
    vencimiento: '2024-02-17',
    total: 2750.5,
    estado: 'Vencida',
    tipoPago: 'Crédito',
  },
];

export function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [facturas] = useState(mockFacturas);

  const filteredFacturas = facturas.filter(
    (factura) =>
      factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Pagada':
        return 'default';
      case 'Pendiente':
        return 'secondary';
      case 'Vencida':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona las facturas y documentos de venta
          </p>
        </div>
        <Button className="button-hover">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar facturas..."
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
          <CardTitle>Lista de Facturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tipo Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacturas.map((factura) => (
                <TableRow key={factura.id} className="table-row-hover">
                  <TableCell className="font-medium">
                    {factura.numero}
                  </TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.vencimiento}</TableCell>
                  <TableCell>${factura.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadgeVariant(factura.estado)}>
                      {factura.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{factura.tipoPago}</TableCell>
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
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Generar PDF
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
