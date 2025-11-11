import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface MonedaFormValues {
  descripcion: string;
  tipoCambio: number | '';
}

interface MonedaFormProps {
  values: MonedaFormValues;
  onChange: (values: MonedaFormValues) => void;
  errors?: Partial<Record<keyof MonedaFormValues, string>>;
}

export function MonedaForm({
  values,
  onChange,
  errors,
}: MonedaFormProps) {
  const handleChange = (field: keyof MonedaFormValues, value: string | number) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Moneda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: Dólar Estadounidense, Córdoba, etc."
            value={values.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipoCambio">
            Tipo de Cambio <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tipoCambio"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej: 7000"
            value={values.tipoCambio}
            onChange={(e) =>
              handleChange('tipoCambio', e.target.value ? Number(e.target.value) : '')
            }
          />
          {errors?.tipoCambio && (
            <p className="text-sm text-destructive">{errors.tipoCambio}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

