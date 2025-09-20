'use client';

import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  X,
  Calendar,
  DollarSign,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
  // ... (tu lista de facturas)
  {
    id: 1,
    numero: 'FAC-001',
    cliente: 'Cliente ABC S.A.',
    fecha: '2024-01-15',
    vencimiento: '2024-02-15',
    total: 1850.0,
    estado: 'Pagada',
    tipoPago: 'Transferencia',
    moneda: 'CRC',
    bodega: 'Bodega Central',
    impuesto: 'IVA 13%',
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
    moneda: 'USD',
    bodega: 'Bodega Norte',
    impuesto: 'IVA 4%',
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
    moneda: 'EUR',
    bodega: 'Bodega Sur',
    impuesto: 'Exento',
  },
];

export function FacturasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [facturas] = useState(mockFacturas);

  const [filters, setFilters] = useState({
    estado: 'Todos los estados',
    tipoPago: 'Todos los tipos',
    cliente: 'Todos los clientes',
    moneda: 'Todas las monedas',
    bodega: 'Todas las bodegas',
    impuesto: 'Todos los impuestos',
    codigoFactura: '',
    fechaDesde: '',
    fechaHasta: '',
    montoMin: '',
    montoMax: '',
  });

  const clearAllFilters = () => {
    setFilters({
      estado: 'Todos los estados',
      tipoPago: 'Todos los tipos',
      cliente: 'Todos los clientes',
      moneda: 'Todas las monedas',
      bodega: 'Todas las bodegas',
      impuesto: 'Todos los impuestos',
      codigoFactura: '',
      fechaDesde: '',
      fechaHasta: '',
      montoMin: '',
      montoMax: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) =>
      value !== 'Todos los estados' &&
      value !== 'Todos los tipos' &&
      value !== 'Todos los clientes' &&
      value !== 'Todas las monedas' &&
      value !== 'Todas las bodegas' &&
      value !== 'Todos los impuestos' &&
      value !== ''
  );

  const filteredFacturas = facturas.filter(
    (factura) =>
      factura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (filters.codigoFactura &&
        factura.numero
          .toLowerCase()
          .includes(filters.codigoFactura.toLowerCase())) ||
      (filters.cliente !== 'Todos los clientes' &&
        factura.cliente === filters.cliente) ||
      (filters.estado !== 'Todos los estados' &&
        factura.estado === filters.estado) ||
      (filters.tipoPago !== 'Todos los tipos' &&
        factura.tipoPago === filters.tipoPago) ||
      (filters.moneda !== 'Todas las monedas' &&
        factura.moneda === filters.moneda) ||
      (filters.bodega !== 'Todas las bodegas' &&
        factura.bodega === filters.bodega) ||
      (filters.impuesto !== 'Todos los impuestos' &&
        factura.impuesto === filters.impuesto) ||
      (filters.fechaDesde &&
        new Date(factura.fecha) >= new Date(filters.fechaDesde)) ||
      (filters.fechaHasta &&
        new Date(factura.fecha) <= new Date(filters.fechaHasta)) ||
      (filters.montoMin &&
        factura.total >= Number.parseFloat(filters.montoMin)) ||
      (filters.montoMax && factura.total <= Number.parseFloat(filters.montoMax))
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
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Facturas
          </h1>
          <p className="text-muted-foreground text-left">
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
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avanzados
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </div>

      {showFilters && (
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    {
                      Object.values(filters).filter(
                        (v) =>
                          v !== 'Todos los estados' &&
                          v !== 'Todos los tipos' &&
                          v !== 'Todos los clientes' &&
                          v !== 'Todas las monedas' &&
                          v !== 'Todas las bodegas' &&
                          v !== 'Todos los impuestos' &&
                          v !== ''
                      ).length
                    }{' '}
                    activos
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar Todo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Código Factura Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Código Factura
                </label>
                <Input
                  placeholder="FAC-001, FAC-002..."
                  value={filters.codigoFactura}
                  onChange={(e) =>
                    setFilters({ ...filters, codigoFactura: e.target.value })
                  }
                  className="h-9"
                />
              </div>

              {/* Cliente Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Cliente
                </label>
                <Select
                  value={filters.cliente}
                  onValueChange={(value) =>
                    setFilters({ ...filters, cliente: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los clientes">
                      Todos los clientes
                    </SelectItem>
                    <SelectItem value="Cliente ABC S.A.">
                      Cliente ABC S.A.
                    </SelectItem>
                    <SelectItem value="Empresa XYZ Ltda.">
                      Empresa XYZ Ltda.
                    </SelectItem>
                    <SelectItem value="Corporación 123">
                      Corporación 123
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Estado
                </label>
                <Select
                  value={filters.estado}
                  onValueChange={(value) =>
                    setFilters({ ...filters, estado: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los estados">
                      Todos los estados
                    </SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Pago Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Tipo de Pago
                </label>
                <Select
                  value={filters.tipoPago}
                  onValueChange={(value) =>
                    setFilters({ ...filters, tipoPago: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los tipos">
                      Todos los tipos
                    </SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moneda Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Moneda
                </label>
                <Select
                  value={filters.moneda}
                  onValueChange={(value) =>
                    setFilters({ ...filters, moneda: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas las monedas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas las monedas">
                      Todas las monedas
                    </SelectItem>
                    <SelectItem value="CRC">Colones (CRC)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                    <SelectItem value="EUR">Euros (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bodega Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Bodega
                </label>
                <Select
                  value={filters.bodega}
                  onValueChange={(value) =>
                    setFilters({ ...filters, bodega: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas las bodegas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas las bodegas">
                      Todas las bodegas
                    </SelectItem>
                    <SelectItem value="Bodega Central">
                      Bodega Central
                    </SelectItem>
                    <SelectItem value="Bodega Norte">Bodega Norte</SelectItem>
                    <SelectItem value="Bodega Sur">Bodega Sur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Impuesto Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Impuesto
                </label>
                <Select
                  value={filters.impuesto}
                  onValueChange={(value) =>
                    setFilters({ ...filters, impuesto: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos los impuestos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos los impuestos">
                      Todos los impuestos
                    </SelectItem>
                    <SelectItem value="IVA 13%">IVA 13%</SelectItem>
                    <SelectItem value="IVA 4%">IVA 4%</SelectItem>
                    <SelectItem value="Exento">Exento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha Desde */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha Desde
                </label>
                <Input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) =>
                    setFilters({ ...filters, fechaDesde: e.target.value })
                  }
                  className="h-9"
                />
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha Hasta
                </label>
                <Input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) =>
                    setFilters({ ...filters, fechaHasta: e.target.value })
                  }
                  className="h-9"
                />
              </div>

              {/* Monto Mínimo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Monto Mín.
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.montoMin}
                  onChange={(e) =>
                    setFilters({ ...filters, montoMin: e.target.value })
                  }
                  className="h-9"
                />
              </div>

              {/* Monto Máximo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Monto Máx.
                </label>
                <Input
                  type="number"
                  placeholder="999999.99"
                  value={filters.montoMax}
                  onChange={(e) =>
                    setFilters({ ...filters, montoMax: e.target.value })
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    Filtros activos:
                  </span>
                  {filters.codigoFactura && (
                    <Badge variant="outline" className="text-xs">
                      Código: {filters.codigoFactura}
                      <button
                        onClick={() =>
                          setFilters({ ...filters, codigoFactura: '' })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.cliente !== 'Todos los clientes' && (
                    <Badge variant="outline" className="text-xs">
                      Cliente: {filters.cliente}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            cliente: 'Todos los clientes',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.estado !== 'Todos los estados' && (
                    <Badge variant="outline" className="text-xs">
                      Estado: {filters.estado}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            estado: 'Todos los estados',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.tipoPago !== 'Todos los tipos' && (
                    <Badge variant="outline" className="text-xs">
                      Pago: {filters.tipoPago}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            tipoPago: 'Todos los tipos',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.moneda !== 'Todas las monedas' && (
                    <Badge variant="outline" className="text-xs">
                      Moneda: {filters.moneda}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            moneda: 'Todas las monedas',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.bodega !== 'Todas las bodegas' && (
                    <Badge variant="outline" className="text-xs">
                      Bodega: {filters.bodega}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            bodega: 'Todas las bodegas',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.impuesto !== 'Todos los impuestos' && (
                    <Badge variant="outline" className="text-xs">
                      Impuesto: {filters.impuesto}
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            impuesto: 'Todos los impuestos',
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.fechaDesde && (
                    <Badge variant="outline" className="text-xs">
                      Desde: {filters.fechaDesde}
                      <button
                        onClick={() =>
                          setFilters({ ...filters, fechaDesde: '' })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.fechaHasta && (
                    <Badge variant="outline" className="text-xs">
                      Hasta: {filters.fechaHasta}
                      <button
                        onClick={() =>
                          setFilters({ ...filters, fechaHasta: '' })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.montoMin && (
                    <Badge variant="outline" className="text-xs">
                      Min: ${filters.montoMin}
                      <button
                        onClick={() => setFilters({ ...filters, montoMin: '' })}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.montoMax && (
                    <Badge variant="outline" className="text-xs">
                      Max: ${filters.montoMax}
                      <button
                        onClick={() => setFilters({ ...filters, montoMax: '' })}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resto de tu código (la Card y la tabla) */}
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
                <TableHead>Moneda</TableHead>
                <TableHead>Bodega</TableHead>
                <TableHead>Impuesto</TableHead>
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
                  <TableCell>{factura.moneda}</TableCell>
                  <TableCell>{factura.bodega}</TableCell>
                  <TableCell>{factura.impuesto}</TableCell>
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
