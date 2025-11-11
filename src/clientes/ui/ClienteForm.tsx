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

// Formatear RUC automáticamente (J + 13 números)
const formatRUC = (value: string) => {
  // Si empieza con J, mantenerla, si no agregarla
  let cleaned = value.toUpperCase().replace(/[^J0-9]/g, '');
  
  // Si no empieza con J, agregarla
  if (!cleaned.startsWith('J')) {
    // Si hay números, agregar J al inicio
    const numbers = cleaned.replace(/J/g, '');
    cleaned = numbers ? `J${numbers}` : 'J';
  }
  
  // Limitar a J + 13 números máximo
  if (cleaned.length > 14) {
    cleaned = cleaned.slice(0, 14);
  }
  
  return cleaned;
};

// Formatear teléfono: solo 8 números (el +505 se agrega automáticamente)
const formatPhone = (value: string) => {
  // Solo permitir números, máximo 8 dígitos
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers;
};

export function ClienteForm({ values, onChange, errors }: ClienteFormProps) {
  const handleChange = (
    field: keyof ClienteFormValues,
    value: string | boolean
  ) => {
    onChange({ ...values, [field]: value });
  };

  const handleRUCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUC(e.target.value);
    handleChange('ruc', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    handleChange('telefono', formatted);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="primerNombre" className="text-sm">
                Primer Nombre
              </Label>
              <Input
                id="primerNombre"
                value={values.primerNombre}
                onChange={(e) => handleChange('primerNombre', e.target.value)}
                placeholder="Juan"
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.primerNombre && (
                <p className="text-xs sm:text-sm text-destructive">{errors.primerNombre}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="primerApellido" className="text-sm">
                Primer Apellido
              </Label>
              <Input
                id="primerApellido"
                value={values.primerApellido}
                onChange={(e) => handleChange('primerApellido', e.target.value)}
                placeholder="Pérez"
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.primerApellido && (
                <p className="text-xs sm:text-sm text-destructive">{errors.primerApellido}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="ruc" className="text-sm">
                RUC <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ruc"
                value={values.ruc}
                onChange={handleRUCChange}
                placeholder="J9999999999999"
                maxLength={14}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.ruc && (
                <p className="text-xs sm:text-sm text-destructive">{errors.ruc}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="telefono" className="text-sm">Teléfono</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm font-medium pointer-events-none">
                  +505
                </div>
                <Input
                  id="telefono"
                  type="tel"
                  value={values.telefono}
                  onChange={handlePhoneChange}
                  placeholder="87781633"
                  className="pl-14 h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                  maxLength={8}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="direccion" className="text-sm">Dirección</Label>
              <Input
                id="direccion"
                value={values.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Av. Principal 123, Ciudad"
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="notas" className="text-sm">Notas</Label>
            <Textarea
              id="notas"
              value={values.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              placeholder="Información adicional sobre el cliente..."
              rows={4}
              className="text-sm sm:text-base touch-manipulation resize-y"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="esExonerado" className="text-sm">Cliente Exonerado</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ¿Este cliente está exonerado de impuestos?
              </p>
            </div>
            <Switch
              id="esExonerado"
              checked={values.esExonerado}
              onCheckedChange={(checked) =>
                handleChange('esExonerado', checked)
              }
              className="touch-manipulation"
            />
          </div>

          {values.esExonerado && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="porcentajeExonerado" className="text-sm">
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
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.porcentajeExonerado && (
                <p className="text-xs sm:text-sm text-destructive">
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
