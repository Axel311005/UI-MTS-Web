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
import { Calendar, DollarSign, FileText, Filter, X } from '@/shared/icons';

// Componente placeholder (solo UI, sin lógica de filtros)
export const FacturaFilters = () => {
  return (
    <Card className="border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader className="pb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Filtros (Diseño)</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4 mr-1" /> Limpiar
          </Button>
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Código Factura
            </label>
            <Input placeholder="FAC-001" className="h-9" />
          </div>
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
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <Select>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          {(['fechaDesde', 'fechaHasta'] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />{' '}
                {key === 'fechaDesde' ? 'Fecha Desde' : 'Fecha Hasta'}
              </label>
              <Input type="date" className="h-9" />
            </div>
          ))}
          {(['montoMin', 'montoMax'] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />{' '}
                {key === 'montoMin' ? 'Monto Mínimo' : 'Monto Máximo'}
              </label>
              <Input
                type="number"
                className="h-9"
                placeholder={key === 'montoMin' ? '0.00' : '999999.99'}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
