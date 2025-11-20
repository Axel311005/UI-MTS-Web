import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';
import { useProtectedInput } from '@/shared/hooks/useProtectedInput';

interface ClasificacionFormValues {
  descripcion: string;
}

interface ClasificacionFormProps {
  values: ClasificacionFormValues;
  onChange: (values: ClasificacionFormValues) => void;
  errors?: Partial<Record<keyof ClasificacionFormValues, string>>;
}

export function ClasificacionForm({ values, onChange, errors }: ClasificacionFormProps) {
  const handleChange = (field: keyof ClasificacionFormValues, value: string) => {
    const sanitized = sanitizeText(
      value,
      VALIDATION_RULES.descripcion.min,
      VALIDATION_RULES.descripcion.max,
      false // No permitir 3 caracteres repetidos
    );
    onChange({ ...values, [field]: sanitized });
  };

  // Proteger contra manipulación directa del DOM
  useProtectedInput({
    fieldId: 'descripcion',
    currentValue: values.descripcion,
    onValueChange: (value) => handleChange('descripcion', value),
    validationRules: VALIDATION_RULES.descripcion,
    allowRepeats: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Clasificación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: Electrónicos, Alimentos, etc."
            value={values.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
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
