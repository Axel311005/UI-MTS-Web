import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ClienteHeader } from '../ui/ClienteHeader';
import { ClienteSearchBar } from '../ui/ClienteSearchBar';
import { ClienteFilters } from '../ui/ClienteFilters';
import { ClienteRowActions } from '../ui/ClienteRowActions';
import { useCliente } from '../hook/useCliente';
import type { Cliente } from '../types/cliente.interface';

export const ClientesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { clientes } = useCliente();
  const navigate = useNavigate();

  const filteredClientes = useMemo<Cliente[]>(() => {
    const items = clientes ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((cliente) => {
      const nombre = cliente.nombre?.toLowerCase() ?? '';
      const ruc = cliente.ruc?.toLowerCase() ?? '';
      const telefono = cliente.telefono?.toLowerCase() ?? '';
      const direccion = cliente.direccion?.toLowerCase() ?? '';
      const notas = cliente.notas?.toLowerCase() ?? '';
      return (
        nombre.includes(term) ||
        ruc.includes(term) ||
        telefono.includes(term) ||
        direccion.includes(term) ||
        notas.includes(term)
      );
    });
  }, [clientes, searchTerm]);

  return (
    <div className="space-y-6">
      <ClienteHeader onNewClient={() => navigate('/clientes/nuevo')} />

      <ClienteSearchBar
        value={searchTerm}
        onValueChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div className="animate-in fade-in-50 slide-in-from-top-1">
          <ClienteFilters onClose={() => setShowFilters(false)} />
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>RUC</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Exonerado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => {
                const estadoLabel = cliente.activo ? 'Activo' : 'Inactivo';
                const exoneradoLabel = cliente.esExonerado
                  ? `Sí${
                      cliente.porcentajeExonerado
                        ? ` (${cliente.porcentajeExonerado}%)`
                        : ''
                    }`
                  : 'No';
                const telefono = cliente.telefono || '—';
                const direccion = cliente.direccion || '—';
                return (
                  <TableRow key={cliente.idCliente} className="table-row-hover">
                    <TableCell className="font-medium">
                      {cliente.nombre}
                    </TableCell>
                    <TableCell>{cliente.ruc || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {telefono}
                      </div>
                    </TableCell>
                    <TableCell>{direccion}</TableCell>
                    <TableCell>{exoneradoLabel}</TableCell>
                    <TableCell>
                      <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                        {estadoLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ClienteRowActions cliente={cliente} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredClientes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
