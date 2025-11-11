import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ClienteHeaderProps {
  onNewClient: () => void;
}

export function ClienteHeader({ onNewClient }: ClienteHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-left">
          Clientes
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
          Gestiona la información de tus clientes
        </p>
      </div>
      <Button 
        className="button-hover w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]" 
        onClick={onNewClient}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Cliente
      </Button>
    </div>
  );
}
