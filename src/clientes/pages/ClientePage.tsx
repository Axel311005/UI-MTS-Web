import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
import { Pagination } from '@/shared/components/ui/pagination';
import { ClienteHeader } from '../ui/ClienteHeader';
import { ClienteSearchBar } from '../ui/ClienteSearchBar';
import { ClienteFilters } from '../ui/ClienteFilters';
import { ClienteRowActions } from '../ui/ClienteRowActions';
import { useCliente } from '../hook/useCliente';
import { EstadoActivo } from '@/shared/types/status';
import type { Cliente } from '../types/cliente.interface';

export const ClientesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const {
    clientes,
    totalItems = 0,
    isLoading,
  } = useCliente({
    usePagination: true,
    limit,
    offset,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Para búsqueda, usamos los datos de la página actual (ya paginados del backend o frontend)
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

  useEffect(() => {
    if (isLoading) return;
    const computedTotalPages = Math.max(
      Math.ceil((totalItems || 0) / pageSize),
      1
    );

    if (page > computedTotalPages) {
      const lastPage = Math.max(1, computedTotalPages);
      const params = new URLSearchParams(searchParams);
      if (lastPage > 1) {
        params.set('page', lastPage.toString());
      } else {
        params.delete('page');
      }
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, totalItems, pageSize, searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <ClienteHeader onNewClient={() => navigate('/clientes/nuevo')} />

      <ClienteSearchBar
        value={searchTerm}
        onValueChange={(value) => {
          setSearchTerm(value);
          // Reset a página 1 al buscar
          const params = new URLSearchParams(searchParams);
          params.delete('page');
          setSearchParams(params, { replace: true });
        }}
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
                const isActivo = cliente.activo === EstadoActivo.ACTIVO;
                const estadoLabel = isActivo ? 'Activo' : 'Inactivo';
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
                      <Badge variant={isActivo ? 'default' : 'secondary'}>
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
        {totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(Math.ceil(totalItems / pageSize), 1)}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) {
                params.set('page', newPage.toString());
              } else {
                params.delete('page');
              }
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete('page'); // Reset a página 1
              if (newSize !== 10) {
                params.set('pageSize', newSize.toString());
              } else {
                params.delete('pageSize');
              }
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
};
