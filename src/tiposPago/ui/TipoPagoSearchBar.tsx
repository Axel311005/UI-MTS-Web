import { Search, Filter } from '@/shared/icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface TipoPagoSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function TipoPagoSearchBar({
  value,
  onValueChange,
  showFilters,
  onToggleFilters,
}: TipoPagoSearchBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar tipos de pago..."
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" onClick={onToggleFilters}>
        <Filter className="h-4 w-4 mr-2" />
        {showFilters ? 'Ocultar Filtros' : 'Filtros'}
      </Button>
    </div>
  );
}

