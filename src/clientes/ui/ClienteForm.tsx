import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import type {
  ClienteFormErrors,
  ClienteFormValues,
} from './cliente-form.types';

interface ClienteFormProps {
  values: ClienteFormValues;
  onChange: (values: ClienteFormValues) => void;
  errors: ClienteFormErrors;
  showEstadoToggle?: boolean;
}

export function ClienteForm({ values, onChange, errors }: ClienteFormProps) {
  const handleChange = (
    field: keyof ClienteFormValues,
    value: string | boolean
  ) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primerNombre">
                Primer Nombre
              </Label>
              <Input
                id="primerNombre"
                value={values.primerNombre}
                onChange={(e) => handleChange('primerNombre', e.target.value)}
                placeholder="Juan"
              />
              {errors.primerNombre && (
                <p className="text-sm text-destructive">{errors.primerNombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primerApellido">
                Primer Apellido
              </Label>
              <Input
                id="primerApellido"
                value={values.primerApellido}
                onChange={(e) => handleChange('primerApellido', e.target.value)}
                placeholder="Pérez"
              />
              {errors.primerApellido && (
                <p className="text-sm text-destructive">{errors.primerApellido}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ruc">
                RUC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ruc"
                value={values.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
                placeholder="12345678-9"
              />
              {errors.ruc && (
                <p className="text-sm text-destructive">{errors.ruc}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={values.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+595 21 123 456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={values.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Av. Principal 123, Ciudad"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={values.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              placeholder="Información adicional sobre el cliente..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="esExonerado">Cliente Exonerado</Label>
              <p className="text-sm text-muted-foreground">
                ¿Este cliente está exonerado de impuestos?
              </p>
            </div>
            <Switch
              id="esExonerado"
              checked={values.esExonerado}
              onCheckedChange={(checked) =>
                handleChange('esExonerado', checked)
              }
            />
          </div>

          {values.esExonerado && (
            <div className="space-y-2">
              <Label htmlFor="porcentajeExonerado">
                Porcentaje de Exoneración (%)
              </Label>
              <Input
                id="porcentajeExonerado"
                type="number"
                min="0"
                max="100"
                value={values.porcentajeExonerado}
                onChange={(e) =>
                  handleChange('porcentajeExonerado', e.target.value)
                }
                placeholder="0"
              />
              {errors.porcentajeExonerado && (
                <p className="text-sm text-destructive">
                  {errors.porcentajeExonerado}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
