import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';

import {
  INITIAL_ITEM_FORM_VALUES,
  toNumberOrZero,
} from '../ui/item-form.types';
import type { ItemFormErrors, ItemFormValues } from '../ui/item-form.types';
import { postItem, type CreateItemPayload } from '../actions/post-item';
import { useAuthStore } from '@/auth/store/auth.store';
import { ItemForm } from '../ui/ItemForm';

export default function NuevoItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ItemFormValues>(
    INITIAL_ITEM_FORM_VALUES
  );
  const [errors, setErrors] = useState<ItemFormErrors>({});
  const user = useAuthStore((s) => s.user);

  const validateForm = () => {
    const newErrors: ItemFormErrors = {};
    if (!formValues.codigoItem.trim()) {
      newErrors.codigoItem = 'El código es requerido';
    }
    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (!formValues.clasificacionId || Number(formValues.clasificacionId) < 1) {
      newErrors.clasificacionId = 'Clasificación requerida';
    }
    if (!formValues.unidadMedidaId || Number(formValues.unidadMedidaId) < 1) {
      newErrors.unidadMedidaId = 'Unidad de medida requerida';
    }
    if (!formValues.precioBaseLocal || Number(formValues.precioBaseLocal) < 0) {
      newErrors.precioBaseLocal = 'Precio local requerido';
    }
    if (!formValues.precioBaseDolar || Number(formValues.precioBaseDolar) < 0) {
      newErrors.precioBaseDolar = 'Precio USD requerido';
    }
    if (
      !formValues.precioAdquisicionLocal ||
      Number(formValues.precioAdquisicionLocal) < 0
    ) {
      newErrors.precioAdquisicionLocal = 'Precio adquisición local requerido';
    }
    if (
      !formValues.precioAdquisicionDolar ||
      Number(formValues.precioAdquisicionDolar) < 0
    ) {
      newErrors.precioAdquisicionDolar = 'Precio adquisición USD requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): CreateItemPayload => ({
    clasificacionId: Number(formValues.clasificacionId),
    unidadMedidaId: Number(formValues.unidadMedidaId),
    codigoItem: formValues.codigoItem.trim(),
    descripcion: formValues.descripcion.trim(),
    tipo: formValues.tipo,
    precioBaseLocal: toNumberOrZero(formValues.precioBaseLocal),
    precioBaseDolar: toNumberOrZero(formValues.precioBaseDolar),
    precioAdquisicionLocal: toNumberOrZero(formValues.precioAdquisicionLocal),
    precioAdquisicionDolar: toNumberOrZero(formValues.precioAdquisicionDolar),
    esCotizable: formValues.esCotizable,
    ultimaSalida: null,
    ultimoIngreso: null,
    usuarioUltModif: user?.empleado?.nombreCompleto || 'admin',
    fechaUltModif: null,
    perecedero: false,
    activo: formValues.activo,
  });

  const handleSave = async () => {
    if (saving) return;

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    const dismiss = toast.loading('Creando producto...');
    try {
      const payload = buildPayload();
      await postItem(payload);
      toast.success(`Producto ${payload.codigoItem} creado correctamente`);
      await queryClient.invalidateQueries({
        queryKey: ['items'],
        exact: false,
      });
      navigate('/productos');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear el producto';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) navigate('/productos');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nuevo Producto
            </h1>
            <p className="text-muted-foreground">
              Completa la información del nuevo producto
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
            {saving ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </div>

      <ItemForm values={formValues} onChange={setFormValues} errors={errors} />
    </div>
  );
}
