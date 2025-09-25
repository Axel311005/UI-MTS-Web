import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Filter } from 'lucide-react';
import type { Factura } from '@/facturas/interfaces/FacturaInterface';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';
import { Button } from '@/shared/components/ui/button';
import type { Filter as FilterState } from '@/facturas/interfaces/FilterState';
import { filterFacturas } from '@/facturas/lib/filterFacturas';
import { selectOptions, badgeLabelMap } from '@/facturas/config/filters.config';

interface FacturaSearchProps {
  facturas: Factura[];
  onFilter: (filtered: Factura[]) => void;
}

const FacturaFilters = lazy(() => import('@/facturas/ui/FacturaFilters'));

export const FacturaSearch = ({ facturas, onFilter }: FacturaSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
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

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (v) =>
        ![
          'Todos los estados',
          'Todos los tipos',
          'Todos los clientes',
          'Todas las monedas',
          'Todas las bodegas',
          'Todos los impuestos',
          '',
        ].includes(v)
    );
  }, [filters]);

  const filteredFacturas = useMemo(() => {
    return filterFacturas({ items: facturas, filters, search: searchTerm });
  }, [facturas, searchTerm, filters]);

  useEffect(() => {
    onFilter(filteredFacturas);
  }, [filteredFacturas, onFilter]);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <CustomSearchControl
            value={searchTerm}
            onChange={(v) => setSearchTerm(v)}
            placeholder="Buscar facturas..."
            debounceMs={700}
            className="w-full"
            ariaLabel="Buscar facturas"
            clearable
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

      {/* Filtros avanzados */}
      {showFilters && (
        <Suspense
          fallback={
            <div className="text-sm text-muted-foreground">
              Cargando filtros…
            </div>
          }
        >
          <FacturaFilters
            filters={filters}
            setFilters={setFilters}
            clearAll={clearAllFilters}
            hasActiveFilters={hasActiveFilters}
            selectOptions={selectOptions}
            badgeLabelMap={badgeLabelMap}
            onClose={() => setShowFilters(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
