import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ClienteForm } from '../ui/ClienteForm';
import {
  INITIAL_CLIENTE_FORM_VALUES,
  toNumberOrZero,
} from '../ui/cliente-form.types';
import type {
  ClienteFormErrors,
  ClienteFormValues,
} from '../ui/cliente-form.types';
import { getClienteById } from '../actions/get-cliente-by-id';
import { patchCliente } from '../actions/patch-cliente';
import { EstadoActivo } from '@/shared/types/status';
import { validateRUC, sanitizeName } from '@/shared/utils/security';
import {
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

export default function EditarClientePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const clienteId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ClienteFormValues>(
    INITIAL_CLIENTE_FORM_VALUES
  );
  const [errors, setErrors] = useState<ClienteFormErrors>({});

  useEffect(() => {
    if (!params.id) {
      toast.error('ID de cliente no proporcionado');
      navigate('/admin/clientes');
      return;
    }

    if (!Number.isFinite(clienteId)) {
      toast.error('ID de cliente inválido');
      navigate('/admin/clientes');
      return;
    }

    const loadCliente = async () => {
      setLoading(true);
      const dismiss = toast.loading('Cargando cliente...');
      try {
        const cliente = await getClienteById(clienteId);
        const porcentajeRaw = cliente.porcentajeExonerado as
          | string
          | number
          | null
          | undefined;
        const porcentajeValue = (() => {
          if (porcentajeRaw === null || porcentajeRaw === undefined) {
            return '0';
          }
          if (typeof porcentajeRaw === 'number') {
            return porcentajeRaw.toString();
          }
          return String(porcentajeRaw);
        })();
        // Convertir teléfono del backend (50587781633) al formato frontend (87781633)
        const telefonoFrontend = (() => {
          const tel = cliente.telefono ?? '';
          if (tel.startsWith('505') && tel.length === 11) {
            return tel.slice(3); // Remover "505" del inicio
          }
          return tel;
        })();

        setFormValues({
          primerNombre: cliente.primerNombre ?? '',
          primerApellido: cliente.primerApellido ?? '',
          ruc: cliente.ruc ?? null,
          direccion: cliente.direccion ?? '',
          telefono: telefonoFrontend,
          esExonerado: Boolean(cliente.esExonerado),
          porcentajeExonerado: porcentajeValue,
          activo:
            cliente.activo === EstadoActivo.ACTIVO
              ? EstadoActivo.ACTIVO
              : EstadoActivo.INACTIVO,
          notas: cliente.notas ?? '',
        });
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar el cliente';
        toast.error(message);
        navigate('/admin/clientes');
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };

    loadCliente();
  }, [clienteId, navigate, params.id]);

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

  const buildPayload = () => {
    // Convertir teléfono de formato frontend (87781633) a backend (50587781633)
    // Solo números, todo pegado sin espacios
    const telefonoLimpio = formValues.telefono.replace(/\D/g, ''); // Solo números
    const telefonoBackend = telefonoLimpio.length === 8
      ? `505${telefonoLimpio}`
      : telefonoLimpio;

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
      activo: formValues.activo,
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

    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    const dismiss = toast.loading('Actualizando cliente...');
    try {
      const payload = buildPayload();
      // buildPayload ya sanitiza todos los campos con sanitizeName y sanitizeText
      await patchCliente(clienteId, payload);
      const nombreCompleto =
        [validation.sanitizedPayload.primerNombre, validation.sanitizedPayload.primerApellido]
          .filter(Boolean)
          .join(' ') || validation.sanitizedPayload.ruc;
      toast.success(`Cliente ${nombreCompleto} actualizado`);

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
        'No se pudo actualizar el cliente';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) navigate('/clientes');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Cliente #{params.id}
            </h1>
            <p className="text-muted-foreground">
              Modifica la información del cliente
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="button-hover"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <ClienteForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
        showEstadoToggle
      />
    </div>
  );
}
