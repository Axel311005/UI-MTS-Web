import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  sanitizeText,
  validateText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

type FormValues = {
  descripcion: string;
  telefono: string;
  direccion: string;
  contacto: string;
};

interface AseguradoraFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AseguradoraForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AseguradoraFormProps) {
  const [values, setValues] = useState<FormValues>({
    descripcion: defaultValues?.descripcion ?? '',
    telefono: defaultValues?.telefono ?? '',
    direccion: defaultValues?.direccion ?? '',
    contacto: defaultValues?.contacto ?? '',
  });

  const [errors, setErrors] = useState<
    Record<keyof FormValues, string | undefined>
  >({
    descripcion: undefined,
    telefono: undefined,
    direccion: undefined,
    contacto: undefined,
  });

  const validate = () => {
    const nextErrors: typeof errors = {
      descripcion: undefined,
      telefono: undefined,
      direccion: undefined,
      contacto: undefined,
    };

    if (!values.descripcion.trim()) {
      nextErrors.descripcion = 'La descripción es requerida';
    } else {
      const descValidation = validateText(
        values.descripcion.trim(),
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false
      );
      if (!descValidation.isValid) {
        nextErrors.descripcion = descValidation.error || 'Descripción inválida';
      }
    }
    if (!values.telefono.trim()) {
      nextErrors.telefono = 'El teléfono es requerido';
    }
    if (!values.direccion.trim()) {
      nextErrors.direccion = 'La dirección es requerida';
    } else {
      const dirValidation = validateText(
        values.direccion.trim(),
        VALIDATION_RULES.direccion.min,
        VALIDATION_RULES.direccion.max,
        false
      );
      if (!dirValidation.isValid) {
        nextErrors.direccion = dirValidation.error || 'Dirección inválida';
      }
    }
    if (!values.contacto.trim()) {
      nextErrors.contacto = 'El contacto es requerido';
    } else {
      const contactoValidation = validateText(values.contacto.trim(), 2, 100, false);
      if (!contactoValidation.isValid) {
        nextErrors.contacto = contactoValidation.error || 'Contacto inválido';
      }
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((message) => !message);
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    let sanitized = value;
    
    // Aplicar sanitización según el campo
    if (field === 'descripcion') {
      sanitized = sanitizeText(
        value,
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false
      );
    } else if (field === 'direccion') {
      sanitized = sanitizeText(
        value,
        VALIDATION_RULES.direccion.min,
        VALIDATION_RULES.direccion.max,
        false
      );
    } else if (field === 'contacto') {
      sanitized = sanitizeText(value, 2, 100, false);
    }
    
    setValues((prev) => ({
      ...prev,
      [field]: sanitized,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) return;

    await onSubmit({
      descripcion: values.descripcion.trim(),
      telefono: values.telefono.trim(),
      direccion: values.direccion.trim(),
      contacto: values.contacto.trim(),
    });
  };

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          value={values.descripcion}
          onChange={(event) => handleChange('descripcion', event.target.value)}
          placeholder="Seguros del Paraguay S.A."
          maxLength={VALIDATION_RULES.descripcion.max}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          type="tel"
          value={values.telefono}
          onChange={(event) => handleChange('telefono', event.target.value)}
          placeholder="+595 21 123 456"
        />
        {errors.telefono && (
          <p className="text-sm text-destructive">{errors.telefono}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contacto">Contacto</Label>
        <Input
          id="contacto"
          value={values.contacto}
          onChange={(event) => handleChange('contacto', event.target.value)}
          placeholder="Juan Pérez"
        />
        {errors.contacto && (
          <p className="text-sm text-destructive">{errors.contacto}</p>
        )}
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Textarea
          id="direccion"
          value={values.direccion}
          onChange={(event) => handleChange('direccion', event.target.value)}
          placeholder="Av. Mariscal López 1234, Asunción"
          rows={3}
          maxLength={VALIDATION_RULES.direccion.max}
        />
        {errors.direccion && (
          <p className="text-sm text-destructive">{errors.direccion}</p>
        )}
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
