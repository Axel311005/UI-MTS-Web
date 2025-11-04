import { Plus } from '@/shared/icons';
import { Button } from '@/shared/components/ui/button';

interface ClasificacionHeaderProps {
  onNewClasificacion: () => void;
}

export function ClasificacionHeader({ onNewClasificacion }: ClasificacionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-left">
          Clasificaciones
        </h1>
        <p className="text-muted-foreground">
          Gestiona las categorías y clasificaciones de productos
        </p>
      </div>
      <Button className="button-hover" onClick={onNewClasificacion}>
        <Plus className="h-4 w-4 mr-2" />
        Nueva Clasificación
      </Button>
    </div>
  );
}

