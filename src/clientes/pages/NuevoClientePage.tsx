import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ClienteForm } from '../ui/ClienteForm';
import { postCliente } from '../actions/post-cliente';
import type { CreateClientePayload } from '../actions/post-cliente';
import {
  INITIAL_CLIENTE_FORM_VALUES,
  toNumberOrZero,
} from '../ui/cliente-form.types';
import { EstadoActivo } from '@/shared/types/status';
import { validateRUC, sanitizeName } from '@/shared/utils/security';
import {
  validateText,
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';
import type {
  ClienteFormErrors,
  ClienteFormValues,
} from '../ui/cliente-form.types';

export default function NuevoClientePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ClienteFormValues>(
    INITIAL_CLIENTE_FORM_VALUES
  );
  const [errors, setErrors] = useState<ClienteFormErrors>({});

  const validateForm = () => {
    const newErrors: ClienteFormErrors = {};

    // Al menos uno de los nombres o el RUC debe estar presente
    const hasNombre =
      formValues.primerNombre.trim() || formValues.primerApellido.trim();
    if (!hasNombre && !formValues.ruc.trim()) {
      newErrors.primerNombre = 'Debe proporcionar al menos un nombre o RUC';
    }

    // RUC es opcional, pero si se ingresa debe tener el formato correcto
    const rucTrimmed = formValues.ruc?.trim() || '';
    if (rucTrimmed) {
      // Validar formato: J seguido de 13 dígitos
      if (!validateRUC(rucTrimmed)) {
        newErrors.ruc = 'El RUC debe tener el formato J seguido de 13 dígitos. Ejemplo: J1234567890123';
      }
    }

    // Validar dirección
    if (formValues.direccion.trim()) {
      const direccionValidation = validateText(
        formValues.direccion.trim(),
        VALIDATION_RULES.direccion.min,
        VALIDATION_RULES.direccion.max,
        false
      );
      if (!direccionValidation.isValid) {
        newErrors.direccion = direccionValidation.error;
      }
    }

    // Validar notas
    if (formValues.notas.trim()) {
      const notasValidation = validateText(
        formValues.notas.trim(),
        VALIDATION_RULES.notas.min,
        VALIDATION_RULES.notas.max,
        false
      );
      if (!notasValidation.isValid) {
        newErrors.notas = notasValidation.error;
      }
    }

    if (formValues.esExonerado) {
      const porcentaje = Number(formValues.porcentajeExonerado);
      if (!Number.isFinite(porcentaje)) {
        newErrors.porcentajeExonerado = 'Ingresa un número válido';
      } else if (porcentaje < 0 || porcentaje > 100) {
        newErrors.porcentajeExonerado =
          'El porcentaje debe estar entre 0 y 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): CreateClientePayload => {
    // Convertir teléfono de formato frontend (87781633) a backend (50587781633)
    // Solo números, todo pegado sin espacios
    const telefonoLimpio = formValues.telefono.replace(/\D/g, ''); // Solo números
    const telefonoBackend =
      telefonoLimpio.length === 8 ? `505${telefonoLimpio}` : telefonoLimpio;

    return {
      primerNombre: formValues.primerNombre.trim()
        ? sanitizeName(formValues.primerNombre.trim(), 2, 30) || null
        : null,
      primerApellido: formValues.primerApellido.trim()
        ? sanitizeName(formValues.primerApellido.trim(), 2, 30) || null
        : null,
      ruc: formValues.ruc && typeof formValues.ruc === 'string' ? formValues.ruc.trim() || null : null, // RUC opcional, enviar null si está vacío
      esExonerado: formValues.esExonerado,
      porcentajeExonerado: formValues.esExonerado
        ? toNumberOrZero(formValues.porcentajeExonerado)
        : 0,
      direccion: formValues.direccion.trim()
        ? sanitizeText(
            formValues.direccion.trim(),
            VALIDATION_RULES.direccion.min,
            VALIDATION_RULES.direccion.max,
            false
          )
        : '',
      telefono: telefonoBackend,
      activo: EstadoActivo.ACTIVO,
      notas: formValues.notas.trim()
        ? sanitizeText(
            formValues.notas.trim(),
            VALIDATION_RULES.notas.min,
            VALIDATION_RULES.notas.max,
            false
          )
        : '',
    };
  };

  const handleSave = async () => {
    if (saving) return;

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    const dismiss = toast.loading('Creando cliente...');
    try {
      const payload = buildPayload();
      // buildPayload ya sanitiza todos los campos con sanitizeName y sanitizeText
      const { clienteId } = await postCliente(payload);
      const nombreCompleto =
        [validation.sanitizedPayload.primerNombre, validation.sanitizedPayload.primerApellido]
          .filter(Boolean)
          .join(' ') || validation.sanitizedPayload.ruc;
      toast.success(`Cliente ${nombreCompleto} creado (ID ${clienteId})`);

      await queryClient.invalidateQueries({
        queryKey: ['clientes'],
        exact: false,
      });

      navigate('/admin/clientes');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear el cliente';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) navigate('/clientes');
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Nuevo Cliente
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Completa la información del nuevo cliente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 sm:flex-initial h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="button-hover flex-1 sm:flex-initial h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
          >
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {saving ? 'Guardando...' : 'Guardar Cliente'}
            </span>
            <span className="sm:hidden">
              {saving ? 'Guardando...' : 'Guardar'}
            </span>
          </Button>
        </div>
      </div>

      <ClienteForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
      />
    </div>
  );
}
