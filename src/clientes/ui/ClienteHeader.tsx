import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface ClienteHeaderProps {
  onNewClient: () => void;
}

export function ClienteHeader({ onNewClient }: ClienteHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona la información de tus clientes
        </p>
      </div>
      <Button className="button-hover" onClick={onNewClient}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Cliente
      </Button>
    </div>
  );
}
