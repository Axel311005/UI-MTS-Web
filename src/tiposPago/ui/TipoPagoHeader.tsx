import { Plus } from '@/shared/icons';
import { Button } from '@/shared/components/ui/button';

interface TipoPagoHeaderProps {
  onNewTipoPago: () => void;
}

export function TipoPagoHeader({ onNewTipoPago }: TipoPagoHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-left">
          Tipos de Pago
        </h1>
        <p className="text-muted-foreground">
          Gestiona los métodos de pago disponibles
        </p>
      </div>
      <Button className="button-hover" onClick={onNewTipoPago}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Tipo de Pago
      </Button>
    </div>
  );
}

