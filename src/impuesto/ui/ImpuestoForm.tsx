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

interface ImpuestoFormValues {
  descripcion: string;
  porcentaje: number | '';
}

interface ImpuestoFormProps {
  values: ImpuestoFormValues;
  onChange: (values: ImpuestoFormValues) => void;
  errors?: Partial<Record<keyof ImpuestoFormValues, string>>;
}

export function ImpuestoForm({
  values,
  onChange,
  errors,
}: ImpuestoFormProps) {
  const handleChange = (field: keyof ImpuestoFormValues, value: string | number) => {
    if (field === 'descripcion' && typeof value === 'string') {
      const sanitized = sanitizeText(
        value,
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false, // No permitir 3 caracteres repetidos
        true // Preservar espacios (permitir espacios en descripción)
      );
      onChange({ ...values, [field]: sanitized });
    } else {
      onChange({ ...values, [field]: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Impuesto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: IVA 10%, ISV 15%, etc."
            value={values.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            onBlur={(e) => {
              // Validar que no sea solo espacios
              const trimmed = e.target.value.trim();
              if (e.target.value.length > 0 && trimmed.length === 0) {
                onChange({ ...values, descripcion: '' });
              } else if (trimmed.length > 0) {
                // Validar con validateText
                const validation = validateText(
                  trimmed,
                  VALIDATION_RULES.descripcion.min,
                  VALIDATION_RULES.descripcion.max,
                  false
                );
                if (!validation.isValid && errors?.descripcion !== validation.error) {
                  // El error se manejará en la validación del formulario
                }
              }
            }}
            maxLength={VALIDATION_RULES.descripcion.max}
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="porcentaje">
            Porcentaje <span className="text-destructive">*</span>
          </Label>
          <Input
            id="porcentaje"
            type="number"
            min="0"
            max={VALIDATION_RULES.porcentaje.max}
            step="0.01"
            placeholder="Ej: 10, 15, 18"
            value={values.porcentaje}
            onChange={(e) =>
              handleChange('porcentaje', e.target.value ? Number(e.target.value) : '')
            }
          />
          {errors?.porcentaje && (
            <p className="text-sm text-destructive">{errors.porcentaje}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

