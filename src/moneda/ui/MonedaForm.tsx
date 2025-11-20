import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

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
    if (field === 'descripcion' && typeof value === 'string') {
      const sanitized = sanitizeText(
        value,
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false // No permitir 3 caracteres repetidos
      );
      onChange({ ...values, [field]: sanitized });
    } else {
      onChange({ ...values, [field]: value });
    }
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
            maxLength={VALIDATION_RULES.descripcion.max}
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
            max={VALIDATION_RULES.precio.max}
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

