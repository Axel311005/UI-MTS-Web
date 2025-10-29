import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ItemForm } from '../ui/ItemForm';
import {
  INITIAL_ITEM_FORM_VALUES,
  toNumberOrZero,
} from '../ui/item-form.types';
import type { ItemFormErrors, ItemFormValues } from '../ui/item-form.types';
import { getItemById } from '../actions/get-item-by-id';
import { patchItem } from '../actions/patch-item';

export default function EditarItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const itemId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ItemFormValues>(
    INITIAL_ITEM_FORM_VALUES
  );
  const [errors, setErrors] = useState<ItemFormErrors>({});

  useEffect(() => {
    if (!params.id) {
      toast.error('ID de item no proporcionado');
      navigate('/productos');
      return;
    }

    if (!Number.isFinite(itemId)) {
      toast.error('ID de item inválido');
      navigate('/productos');
      return;
    }

    const loadItem = async () => {
      setLoading(true);
      const dismiss = toast.loading('Cargando producto...');
      try {
        const item = await getItemById(itemId);
        setFormValues({
          clasificacionId: item.clasificacion?.idClasificacion ?? '',
          unidadMedidaId: item.unidadMedida?.idUnidadMedida ?? '',
          codigoItem: item.codigoItem ?? '',
          descripcion: item.descripcion ?? '',
          tipo: item.tipo ?? 'PRODUCTO',
          precioBaseLocal: String(item.precioBaseLocal ?? ''),
          precioBaseDolar: String(item.precioBaseDolar ?? ''),
          precioAdquisicionLocal: String(item.precioAdquisicionLocal ?? ''),
          precioAdquisicionDolar: String(item.precioAdquisicionDolar ?? ''),
          esCotizable: Boolean(item.esCotizable),
          ultimaSalida: item.ultimaSalida
            ? new Date(item.ultimaSalida).toISOString()
            : '',
          ultimoIngreso: item.ultimoIngreso
            ? new Date(item.ultimoIngreso).toISOString()
            : '',
          usuarioUltModif: item.usuarioUltModif ?? '',
          fechaUltModif: item.fechaUltModif
            ? new Date(item.fechaUltModif).toISOString()
            : '',
          perecedero: Boolean(item.perecedero),
          activo: true,
        });
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar el producto';
        toast.error(message);
        navigate('/productos');
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId, navigate, params.id]);

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

  const buildPayload = () => ({
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
    ultimaSalida: formValues.ultimaSalida || null,
    ultimoIngreso: formValues.ultimoIngreso || null,
    usuarioUltModif: formValues.usuarioUltModif,
    fechaUltModif: new Date().toISOString(),
    perecedero: formValues.perecedero,
    activo: true,
  });

  const handleSave = async () => {
    if (saving) return;

    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    const dismiss = toast.loading('Actualizando producto...');
    try {
      const payload = buildPayload();
      await patchItem(itemId, payload);
      toast.success(`Producto ${payload.codigoItem} actualizado correctamente`);
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
        'No se pudo actualizar el producto';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) navigate('/productos');
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
              Editar Producto #{params.id}
            </h1>
            <p className="text-muted-foreground">
              Modifica la información del producto
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

      <ItemForm values={formValues} onChange={setFormValues} errors={errors} />
    </div>
  );
}
