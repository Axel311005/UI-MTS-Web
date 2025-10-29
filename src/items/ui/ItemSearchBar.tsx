import { Filter, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface ItemSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function ItemSearchBar({
  value,
  onValueChange,
  showFilters,
  onToggleFilters,
}: ItemSearchBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        variant={showFilters ? 'default' : 'outline'}
        onClick={onToggleFilters}
      >
        <Filter className="mr-2 h-4 w-4" />
        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
      </Button>
    </div>
  );
}
