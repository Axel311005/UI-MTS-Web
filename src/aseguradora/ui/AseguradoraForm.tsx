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

// Formatear teléfono: solo 8 números (el +505 se agrega automáticamente)
const formatPhone = (value: string) => {
  // Solo permitir números, máximo 8 dígitos
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  return numbers;
};

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
  // Extraer solo los 8 dígitos del teléfono si viene con 505 o +505
  const extractPhoneDigits = (phone: string | undefined): string => {
    if (!phone) return '';
    // Si tiene 505 o +505, extraer solo los 8 dígitos después
    if (phone.startsWith('+505') || phone.startsWith('505')) {
      return phone
        .replace(/^\+?505/, '')
        .replace(/\D/g, '')
        .slice(0, 8);
    }
    // Si tiene +, extraer solo los números
    if (phone.startsWith('+')) {
      return phone.replace('+', '').replace(/\D/g, '').slice(0, 8);
    }
    // Si no, solo números
    return phone.replace(/\D/g, '').slice(0, 8);
  };

  const [values, setValues] = useState<FormValues>({
    descripcion: defaultValues?.descripcion ?? '',
    telefono: extractPhoneDigits(defaultValues?.telefono),
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
        true // allowRepeats: true para ser más permisivo con descripciones
      );
      if (!descValidation.isValid) {
        nextErrors.descripcion = descValidation.error || 'Descripción inválida';
      }
    }
    if (!values.telefono.trim()) {
      nextErrors.telefono = 'El teléfono es requerido';
    } else if (values.telefono.length !== 8) {
      nextErrors.telefono = 'El teléfono debe tener 8 dígitos';
    }
    if (!values.direccion.trim()) {
      nextErrors.direccion = 'La dirección es requerida';
    } else {
      const dirValidation = validateText(
        values.direccion.trim(),
        VALIDATION_RULES.direccion.min,
        VALIDATION_RULES.direccion.max,
        true // allowRepeats: true para ser más permisivo con direcciones
      );
      if (!dirValidation.isValid) {
        nextErrors.direccion = dirValidation.error || 'Dirección inválida';
      }
    }
    if (!values.contacto.trim()) {
      nextErrors.contacto = 'El contacto es requerido';
    } else {
      const contactoValidation = validateText(
        values.contacto.trim(),
        VALIDATION_RULES.contacto.min,
        VALIDATION_RULES.contacto.max,
        true // allowRepeats: true para permitir nombres con espacios y apellidos
      );
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
        true, // allowRepeats: true para ser más permisivo con descripciones
        true // Preservar espacios (permitir espacios en descripción)
      );
    } else if (field === 'direccion') {
      sanitized = sanitizeText(
        value,
        VALIDATION_RULES.direccion.min,
        VALIDATION_RULES.direccion.max,
        true, // allowRepeats: true para ser más permisivo con direcciones
        true // Preservar espacios (permitir espacios en dirección)
      );
    } else if (field === 'contacto') {
      sanitized = sanitizeText(
        value,
        2,
        100,
        true, // allowRepeats: true para permitir nombres con espacios y apellidos
        true // Preservar espacios (permitir espacios en contacto)
      );
    }
    // Nota: telefono se maneja con handlePhoneChange, no aquí

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValues((prev) => ({
      ...prev,
      telefono: formatted,
    }));
    if (errors.telefono) {
      setErrors((prev) => ({
        ...prev,
        telefono: undefined,
      }));
    }
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!validate()) return;

    // Convertir teléfono a formato backend: SIEMPRE 505 + 8 dígitos (sin espacios, sin +)
    const telefonoLimpio = values.telefono.replace(/\D/g, ''); // Solo números, sin espacios ni +

    // Garantizar formato: 505 + 8 dígitos
    let telefonoBackend: string;
    if (telefonoLimpio.length === 8) {
      // Si tiene exactamente 8 dígitos, agregar 505 al inicio
      telefonoBackend = `505${telefonoLimpio}`;
    } else if (telefonoLimpio.length > 8) {
      // Si tiene más de 8 dígitos, verificar si empieza con 505
      if (telefonoLimpio.startsWith('505')) {
        // Si ya tiene 505, tomar solo los primeros 11 dígitos (505 + 8)
        telefonoBackend = telefonoLimpio.substring(0, 11);
      } else {
        // Si no tiene 505, tomar los últimos 8 dígitos y agregar 505
        const ultimos8 = telefonoLimpio.slice(-8);
        telefonoBackend = `505${ultimos8}`;
      }
    } else if (telefonoLimpio.length > 0 && telefonoLimpio.length < 8) {
      // Si tiene menos de 8 dígitos, rellenar con ceros a la izquierda
      const relleno = telefonoLimpio.padStart(8, '0');
      telefonoBackend = `505${relleno}`;
    } else {
      telefonoBackend = '';
    }

    // Garantía final: remover cualquier + o espacio que pueda haber quedado
    telefonoBackend = telefonoBackend.replace(/[+\s]/g, '');

    const payload = {
      descripcion: values.descripcion.trim(),
      telefono: telefonoBackend,
      direccion: values.direccion.trim(),
      contacto: values.contacto.trim(),
    };

    await onSubmit(payload);
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
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
            505
          </div>
          <Input
            id="telefono"
            type="tel"
            value={values.telefono}
            onChange={handlePhoneChange}
            placeholder="87781633"
            maxLength={8}
            className="pl-14"
          />
        </div>
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
          onBlur={(e) => {
            // Validar que no sea solo espacios
            const trimmed = e.target.value.trim();
            if (e.target.value.length > 0 && trimmed.length === 0) {
              setValues((prev) => ({ ...prev, direccion: '' }));
              setErrors((prev) => ({
                ...prev,
                direccion: 'La dirección no puede contener solo espacios',
              }));
            } else {
              // Validar con validateText
              const validation = validateText(
                trimmed,
                VALIDATION_RULES.direccion.min,
                VALIDATION_RULES.direccion.max,
                true // allowRepeats: true para ser más permisivo con direcciones
              );
              if (!validation.isValid) {
                setErrors((prev) => ({
                  ...prev,
                  direccion: validation.error || 'Dirección inválida',
                }));
              } else if (errors.direccion) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.direccion;
                  return newErrors;
                });
              }
            }
          }}
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
