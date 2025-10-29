import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ItemHeaderProps {
  onNewItem: () => void;
}

export function ItemHeader({ onNewItem }: ItemHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground">
          Gestiona el catálogo y existencias de tus productos
        </p>
      </div>
      <Button className="button-hover" onClick={onNewItem}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Producto
      </Button>
    </div>
  );
}
