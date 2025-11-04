import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

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
    onChange({ ...values, [field]: value });
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
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
