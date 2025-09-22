import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Calendar, DollarSign, FileText, Filter, X } from 'lucide-react';
import React from 'react';
import type { Filter as FilterState } from '@/interfaces/FilterState';

export interface FacturaFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearAll: () => void;
  hasActiveFilters: boolean;
  selectOptions: Readonly<Record<string, readonly string[]>>;
  badgeLabelMap: Record<string, string>;
  onClose?: () => void;
}

const FacturaFilters: React.FC<FacturaFiltersProps> = ({
  filters,
  setFilters,
  clearAll,
  hasActiveFilters,
  selectOptions,
  badgeLabelMap,
  onClose,
}) => {
  return (
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
            onClick={clearAll}
            disabled={!hasActiveFilters}
          >
            <X className="h-4 w-4 mr-1" /> Limpiar Todo
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
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
                  <SelectValue placeholder={`Todos ${badgeLabelMap[key]}`} />
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
  );
};

export default FacturaFilters;
