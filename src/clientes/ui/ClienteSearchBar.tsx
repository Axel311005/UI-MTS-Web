import { Search, Filter } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface ClienteSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function ClienteSearchBar({
  value,
  onValueChange,
  showFilters,
  onToggleFilters,
}: ClienteSearchBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant={showFilters ? 'default' : 'outline'}
        onClick={onToggleFilters}
      >
        <Filter className="h-4 w-4 mr-2" />
        {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
      </Button>
    </div>
  );
}
