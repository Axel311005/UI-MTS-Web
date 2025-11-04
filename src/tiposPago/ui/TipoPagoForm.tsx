import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface TipoPagoFormValues {
  descripcion: string;
}

interface TipoPagoFormProps {
  values: TipoPagoFormValues;
  onChange: (values: TipoPagoFormValues) => void;
  errors?: Partial<Record<keyof TipoPagoFormValues, string>>;
}

export function TipoPagoForm({
  values,
  onChange,
  errors,
}: TipoPagoFormProps) {
  const handleChange = (field: keyof TipoPagoFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Tipo de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: Efectivo, Transferencia, Tarjeta, etc."
            value={values.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
