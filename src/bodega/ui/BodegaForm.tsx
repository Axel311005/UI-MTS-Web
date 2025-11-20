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
  validateText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

export interface BodegaFormValues {
  descripcion: string;
}

interface BodegaFormProps {
  values: BodegaFormValues;
  onChange: (values: BodegaFormValues) => void;
  errors?: Partial<Record<keyof BodegaFormValues, string>>;
}

export function BodegaForm({ values, onChange, errors }: BodegaFormProps) {
  const handleChange = (field: keyof BodegaFormValues, value: string) => {
    const sanitized = sanitizeText(
      value,
      VALIDATION_RULES.descripcion.min,
      VALIDATION_RULES.descripcion.max,
      false // No permitir 3 caracteres repetidos
    );
    onChange({ ...values, [field]: sanitized });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Bodega</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: Bodega Principal, Bodega Norte, etc."
            value={values.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            maxLength={VALIDATION_RULES.descripcion.max}
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
