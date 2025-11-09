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

    if (!formValues.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
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

  const buildPayload = (): CreateClientePayload => ({
    primerNombre: formValues.primerNombre.trim() || null,
    primerApellido: formValues.primerApellido.trim() || null,
    ruc: formValues.ruc.trim(),
    esExonerado: formValues.esExonerado,
    porcentajeExonerado: formValues.esExonerado
      ? toNumberOrZero(formValues.porcentajeExonerado)
      : 0,
    direccion: formValues.direccion.trim(),
    telefono: formValues.telefono.trim(),
    activo: EstadoActivo.ACTIVO,
    notas: formValues.notas.trim(),
  });

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
      const { clienteId } = await postCliente(payload);
      const nombreCompleto =
        [payload.primerNombre, payload.primerApellido]
          .filter(Boolean)
          .join(' ') || payload.ruc;
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Cliente</h1>
            <p className="text-muted-foreground">
              Completa la información del nuevo cliente
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
            {saving ? 'Guardando...' : 'Guardar Cliente'}
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
