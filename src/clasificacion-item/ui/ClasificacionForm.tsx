import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

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
    onChange({ ...values, [field]: value });
  };

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
          />
          {errors?.descripcion && (
            <p className="text-sm text-destructive">{errors.descripcion}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
