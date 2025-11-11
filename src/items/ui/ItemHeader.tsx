import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ItemHeaderProps {
  onNewItem: () => void;
}

export function ItemHeader({ onNewItem }: ItemHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-left">
          Productos
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          Gestiona el catálogo y existencias de tus productos
        </p>
      </div>
      <Button 
        className="button-hover w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]" 
        onClick={onNewItem}
      >
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Producto
      </Button>
    </div>
  );
}
