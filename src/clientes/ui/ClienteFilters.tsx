import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
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

interface ClienteFiltersProps {
  onClose: () => void;
}

export function ClienteFilters({ onClose }: ClienteFiltersProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Filtros de clientes
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
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre</label>
          <Input placeholder="Buscar por nombre" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Correo electrónico</label>
          <Input placeholder="Buscar por email" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Limpiar
        </Button>
        <Button>Aplicar filtros</Button>
      </CardFooter>
    </Card>
  );
}
