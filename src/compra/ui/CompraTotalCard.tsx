import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

interface Totals {
  subtotal: number;
  totalDescuento: number;
  totalImpuesto: number;
  total: number;
}

interface CompraTotalCardProps {
  totals: Totals;
  descuentoPct: number | '';
  onDescuentoPctChange: (value: number | '') => void;
  onSave: () => void;
  onSaveAndNew?: () => void;
  onCancel: () => void;
  isValid: boolean;
  isEdit?: boolean;
}

export function CompraTotalCard({
  totals,
  descuentoPct,
  onDescuentoPctChange,
  onSave,
  onSaveAndNew,
  onCancel,
  isValid,
  isEdit = false,
}: CompraTotalCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle>Resumen de totales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Subtotal:</span>
          <span className="text-lg font-semibold">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>

        <Separator />

        {/* Descuento */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descuento (%):</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={descuentoPct}
            onChange={(e) =>
              onDescuentoPctChange(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total descuento:</span>
          <span className="font-medium">
            -{formatCurrency(totals.totalDescuento)}
          </span>
        </div>

        <Separator />

        {/* Impuesto */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total impuesto:</span>
          <span className="font-medium">
            {formatCurrency(totals.totalImpuesto)}
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totals.total)}
          </span>
        </div>

        <Separator className="my-6" />

        {/* Acciones */}
        <div className="space-y-2">
          <Button
            onClick={onSave}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            {isEdit ? 'Actualizar compra' : 'Guardar compra'}
          </Button>
          {!isEdit && onSaveAndNew && (
            <Button
              onClick={onSaveAndNew}
              disabled={!isValid}
              variant="secondary"
              className="w-full"
            >
              Guardar y nueva
            </Button>
          )}
          <Button onClick={onCancel} variant="ghost" className="w-full">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
