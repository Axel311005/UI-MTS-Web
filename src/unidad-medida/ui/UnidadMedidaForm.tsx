import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface UnidadMedidaFormValues {
  descripcion: string;
}

interface UnidadMedidaFormProps {
  values: UnidadMedidaFormValues;
  onChange: (values: UnidadMedidaFormValues) => void;
  errors?: Partial<Record<keyof UnidadMedidaFormValues, string>>;
}

export function UnidadMedidaForm({
  values,
  onChange,
  errors,
}: UnidadMedidaFormProps) {
  const handleChange = (field: keyof UnidadMedidaFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Unidad de Medida</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="descripcion">
            Descripción <span className="text-destructive">*</span>
          </Label>
          <Input
            id="descripcion"
            placeholder="Ej: Kilogramos, Metros, Litros, etc."
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
