'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, X, FileText, Calendar, DollarSign } from 'lucide-react';
import type { Factura } from '@/interfaces/FacturaInterface';
import { Input } from '@/shared/components/ui/input';
import { CustomSearchControl } from '@/shared/components/custom/CustomSearchControl';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Filter as FilterState } from '@/interfaces/FilterState';
import { filterFacturas } from '@/facturas/lib/filterFacturas';

interface FacturaSearchProps {
  facturas: Factura[];
  onFilter: (filtered: Factura[]) => void;
}

const selectOptions = {
  cliente: [
    'Todos los clientes',
    'Cliente ABC S.A.',
    'Empresa XYZ Ltda.',
    'Corporación 123',
  ],
  estado: ['Todos los estados', 'Pagada', 'Pendiente', 'Vencida'],
  tipoPago: [
    'Todos los tipos',
    'Efectivo',
    'Transferencia',
    'Crédito',
    'Tarjeta',
  ],
  moneda: ['Todas las monedas', 'CRC', 'USD', 'EUR'],
  bodega: ['Todas las bodegas', 'Bodega Central', 'Bodega Norte', 'Bodega Sur'],
  impuesto: ['Todos los impuestos', 'IVA 13%', 'IVA 4%', 'Exento'],
};

const badgeLabelMap: Record<string, string> = {
  codigoFactura: 'Código Factura',
  cliente: 'Cliente',
  estado: 'Estado',
  tipoPago: 'Tipo de Pago',
  moneda: 'Moneda',
  bodega: 'Bodega',
  impuesto: 'Impuesto',
  fechaDesde: 'Desde',
  fechaHasta: 'Hasta',
  montoMin: 'Monto Min',
  montoMax: 'Monto Max',
};

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

  const hasActiveFilters = Object.values(filters).some(
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
            debounceMs={300}
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
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  {
                    Object.values(filters).filter(
                      (v) => v && !v.toString().includes('Todos')
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
              >
                <X className="h-4 w-4 mr-1" /> Limpiar Todo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Código Factura */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Código Factura
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

              {/* Selects genéricos */}
              {(
                [
                  'cliente',
                  'estado',
                  'tipoPago',
                  'moneda',
                  'bodega',
                  'impuesto',
                ] as const
              ).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {key === 'cliente' && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    {key === 'estado' && (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                    {key === 'tipoPago' && <DollarSign className="h-3 w-3" />}
                    {key === 'moneda' && (
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    )}
                    {key === 'bodega' && (
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                    )}
                    {key === 'impuesto' && (
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {badgeLabelMap[key]}
                  </label>
                  <Select
                    value={filters[key]}
                    onValueChange={(v) => setFilters({ ...filters, [key]: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue
                        placeholder={`Todos ${badgeLabelMap[key]}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectOptions[key].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              {/* Fechas */}
              {(['fechaDesde', 'fechaHasta'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {badgeLabelMap[key]}
                  </label>
                  <Input
                    type="date"
                    value={filters[key]}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              ))}

              {/* Montos */}
              {(['montoMin', 'montoMax'] as const).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> {badgeLabelMap[key]}
                  </label>
                  <Input
                    type="number"
                    placeholder={key === 'montoMin' ? '0.00' : '999999.99'}
                    value={filters[key]}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                    className="h-9"
                  />
                </div>
              ))}
            </div>

            {/* Badges de filtros activos */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                {Object.entries(filters).map(
                  ([key, value]) =>
                    value &&
                    !value.toString().includes('Todos') && (
                      <Badge
                        key={key}
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        {`${badgeLabelMap[key]}: ${value}`}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              [key]:
                                key.includes('fecha') || key.includes('monto')
                                  ? ''
                                  : selectOptions[
                                      key as keyof typeof selectOptions
                                    ][0],
                            })
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
