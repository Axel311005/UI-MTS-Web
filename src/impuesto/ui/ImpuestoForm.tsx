import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

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
    onChange({ ...values, [field]: value });
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
            max="100"
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

