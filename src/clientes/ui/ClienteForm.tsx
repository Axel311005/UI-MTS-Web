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
import {
  sanitizeString,
  sanitizeName,
} from '@/shared/utils/security';
import {
  sanitizeText,
  validateText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';

interface ClienteFormProps {
  values: ClienteFormValues;
  onChange: (values: ClienteFormValues) => void;
  errors: ClienteFormErrors;
  showEstadoToggle?: boolean;
}

// Formatear RUC automáticamente (J + 13 números)
const formatRUC = (value: string) => {
  // Convertir a mayúsculas
  let cleaned = value.toUpperCase();
  
  // Si ya tiene una J al inicio, solo permitir números después (no más Js ni letras)
  if (cleaned.startsWith('J')) {
    // Remover todas las letras (incluyendo Js adicionales) y solo dejar números después de la primera J
    const afterJ = cleaned.slice(1).replace(/[^0-9]/g, '');
    cleaned = `J${afterJ}`;
  } else {
    // Si no empieza con J, remover todas las letras y solo dejar números
    const numbers = cleaned.replace(/[^0-9]/g, '');
    // Si hay números, agregar J al inicio
    cleaned = numbers ? `J${numbers}` : '';
  }

  // Limitar a J + 13 números máximo (total 14 caracteres)
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
    let sanitizedValue: string | boolean = value;

    // Aplicar sanitización en tiempo real para TODOS los campos de texto
    // Esto incluye protección contra SQL Injection y XSS
    if (typeof value === 'string') {
      if (field === 'direccion') {
        sanitizedValue = sanitizeText(
          value,
          VALIDATION_RULES.direccion.min,
          VALIDATION_RULES.direccion.max,
          false // No permitir 3 caracteres repetidos
        );
      } else if (field === 'notas') {
        sanitizedValue = sanitizeText(
          value,
          VALIDATION_RULES.notas.min,
          VALIDATION_RULES.notas.max,
          false // No permitir 3 caracteres repetidos
        );
      } else if (field === 'primerNombre' || field === 'primerApellido') {
        // Sanitizar nombres: solo letras, sin espacios, números ni caracteres especiales
        sanitizedValue = sanitizeName(value, 30);
      } else {
        // Sanitizar cualquier otro campo de texto (protección SQL + XSS)
        sanitizedValue = sanitizeString(value, 200);
      }
    }

    onChange({ ...values, [field]: sanitizedValue });
  };

  const handleRUCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Si el campo está vacío, establecer null
    if (!value || value.trim() === '') {
      handleChange('ruc', null);
      return;
    }
    
    let formatted = formatRUC(value);
    // Si después del formateo está vacío o solo tiene 'J' sin números, establecer null
    if (!formatted || formatted === 'J') {
      handleChange('ruc', null);
    } else {
      handleChange('ruc', formatted);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    handleChange('telefono', formatted);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">
            Información General
          </CardTitle>
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
                aria-invalid={!!errors.primerNombre}
                aria-describedby={
                  errors.primerNombre ? 'primerNombre-error' : undefined
                }
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,30}"
                title="Solo letras (mínimo 2, máximo 30). No se permiten espacios, números ni caracteres especiales."
                maxLength={30}
                minLength={2}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const cleaned = text.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
                  if (cleaned.length >= 2 && cleaned.length <= 30) {
                    handleChange('primerNombre', cleaned);
                  }
                }}
              />
              {errors.primerNombre && (
                <ErrorMessage
                  message={errors.primerNombre}
                  fieldId="primerNombre"
                />
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
                aria-invalid={!!errors.primerApellido}
                aria-describedby={
                  errors.primerApellido ? 'primerApellido-error' : undefined
                }
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,30}"
                title="Solo letras (mínimo 2, máximo 30). No se permiten espacios, números ni caracteres especiales."
                maxLength={30}
                minLength={2}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const cleaned = text.replace(/\s/g, '').replace(/[0-9]/g, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
                  if (cleaned.length >= 2 && cleaned.length <= 30) {
                    handleChange('primerApellido', cleaned);
                  }
                }}
              />
              {errors.primerApellido && (
                <ErrorMessage
                  message={errors.primerApellido}
                  fieldId="primerApellido"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="ruc" className="text-sm">
                RUC
              </Label>
              <Input
                id="ruc"
                value={values.ruc || ''}
                onChange={handleRUCChange}
                placeholder="J9999999999999"
                maxLength={14}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                aria-invalid={!!errors.ruc}
                aria-describedby={errors.ruc ? 'ruc-error' : undefined}
              />
              {errors.ruc && (
                <ErrorMessage message={errors.ruc} fieldId="ruc" />
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="telefono" className="text-sm">
                Teléfono
              </Label>
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
              <Label htmlFor="direccion" className="text-sm">
                Dirección
              </Label>
              <Input
                id="direccion"
                value={values.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                onBlur={(e) => {
                  const validation = validateText(
                    e.target.value,
                    VALIDATION_RULES.direccion.min,
                    VALIDATION_RULES.direccion.max,
                    false
                  );
                  if (
                    !validation.isValid &&
                    errors.direccion !== validation.error
                  ) {
                    // El error se manejará en la validación del formulario
                  }
                }}
                placeholder="Av. Principal 123, Ciudad"
                maxLength={VALIDATION_RULES.direccion.max}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
              />
              {errors.direccion && (
                <ErrorMessage message={errors.direccion} fieldId="direccion" />
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="notas" className="text-sm">
              Notas
            </Label>
            <Textarea
              id="notas"
              value={values.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              onBlur={(e) => {
                const validation = validateText(
                  e.target.value,
                  VALIDATION_RULES.notas.min,
                  VALIDATION_RULES.notas.max,
                  false
                );
                if (!validation.isValid && errors.notas !== validation.error) {
                  // El error se manejará en la validación del formulario
                }
              }}
              placeholder="Información adicional sobre el cliente..."
              rows={4}
              maxLength={VALIDATION_RULES.notas.max}
              className="text-sm sm:text-base touch-manipulation resize-y"
            />
            {errors.notas && (
              <ErrorMessage message={errors.notas} fieldId="notas" />
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="esExonerado" className="text-sm">
                Cliente Exonerado
              </Label>
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
                <ErrorMessage
                  message={errors.porcentajeExonerado}
                  fieldId="porcentajeExonerado"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
