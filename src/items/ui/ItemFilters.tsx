import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import { EstadoActivo } from '@/shared/types/status';

export type ItemStatusFilter = 'ALL' | EstadoActivo;

interface ItemFiltersProps {
  clasificacion: string;
  clasificacionOptions: string[];
  status: ItemStatusFilter;
  onClasificacionChange: (value: string) => void;
  onStatusChange: (value: ItemStatusFilter) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
}

export function ItemFilters({
  clasificacion,
  clasificacionOptions,
  status,
  onClasificacionChange,
  onStatusChange,
  onClear,
  onApply,
  onClose,
}: ItemFiltersProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Filtros de productos
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Cerrar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Clasificación</label>
          <Select value={clasificacion} onValueChange={onClasificacionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una clasificación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las clasificaciones</SelectItem>
              {clasificacionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as ItemStatusFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="ACTIVO">ACTIVO</SelectItem>
              <SelectItem value="INACTIVO">INACTIVO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClear}>
          Limpiar
        </Button>
        <Button onClick={onApply}>Aplicar filtros</Button>
      </CardFooter>
    </Card>
  );
}
