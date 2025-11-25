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
import { EstadoActivo } from '@/shared/types/status';
import { VALIDATION_RULES } from '@/shared/utils/validation';
import { useMoneda } from '@/moneda/hook/useMoneda';
import {
  parseCodigoItem,
  validateCodigoItemFormat,
} from '../config/codigo-item-categorias';

export default function EditarItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const itemId = useMemo(() => Number(params.id), [params.id]);
  const { monedas } = useMoneda();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<ItemFormValues>(
    INITIAL_ITEM_FORM_VALUES
  );
  const [errors, setErrors] = useState<ItemFormErrors>({});

  // Obtener el tipo de cambio de dólares para calcular máximos
  const tipoCambioDolar = useMemo(() => {
    const monedaDolar = (monedas || []).find((m) => {
      const desc = (m.descripcion || '').toUpperCase().trim();
      return desc === 'DOLARES';
    });
    return monedaDolar ? Number(monedaDolar.tipoCambio) : 37; // Default 37 si no se encuentra
  }, [monedas]);

  // Calcular máximos según la moneda
  // Máximo en dólares: 1,000,000 USD
  // Máximo en córdobas: 1,000,000 USD * tipo de cambio
  const maxPrecioDolar = VALIDATION_RULES.precio.max; // 1,000,000 USD
  const maxPrecioLocal = Math.floor(maxPrecioDolar * tipoCambioDolar); // Ej: 37,000,000 C$

  useEffect(() => {
    if (!params.id) {
      toast.error('ID de item no proporcionado');
      navigate('/admin/productos');
      return;
    }

    if (!Number.isFinite(itemId)) {
      toast.error('ID de item inválido');
      navigate('/admin/productos');
      return;
    }

    const loadItem = async () => {
      setLoading(true);
      const dismiss = toast.loading('Cargando producto...');
      try {
        const item = await getItemById(itemId);

        // Si es SERVICIO, establecer precios en 1
        const isServicio = item.tipo === 'SERVICIO';

        // Parsear codigoItem del backend para extraer categoría y consecutivo
        // Esto permite mostrar la categoría seleccionada en el select y el número en el input
        const codigoParsed = item.codigoItem
          ? parseCodigoItem(item.codigoItem)
          : null;

        setFormValues({
          clasificacionId: item.clasificacion?.idClasificacion ?? '',
          unidadMedidaId: item.unidadMedida?.idUnidadMedida ?? '',
          codigoItem: item.codigoItem ?? '', // Código completo del backend
          codigoCategoria: codigoParsed?.codigoCategoria ?? '', // Ej: "MTR-" para el select
          codigoConsecutivo: codigoParsed?.codigoConsecutivo ?? '', // Ej: "1" para el input
          descripcion: item.descripcion ?? '',
          tipo: item.tipo ?? 'PRODUCTO',
          precioBaseLocal: isServicio
            ? '1'
            : String(item.precioBaseLocal ?? ''),
          precioBaseDolar: isServicio
            ? '1'
            : String(item.precioBaseDolar ?? ''),
          precioAdquisicionLocal: isServicio
            ? '1'
            : String(item.precioAdquisicionLocal ?? ''),
          precioAdquisicionDolar: isServicio
            ? '1'
            : String(item.precioAdquisicionDolar ?? ''),
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
          activo:
            (item as any).activo === 'INACTIVO'
              ? EstadoActivo.INACTIVO
              : EstadoActivo.ACTIVO,
        });
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar el producto';
        toast.error(message);
        navigate('/admin/productos');
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId, navigate, params.id]);

  const validateForm = () => {
    const newErrors: ItemFormErrors = {};

    // Validar código
    if (!formValues.codigoItem.trim()) {
      newErrors.codigoItem = 'El código es requerido';
    } else {
      const codigoTrimmed = formValues.codigoItem.trim().toUpperCase();

      // Validar formato específico: 3 letras mayúsculas + guion + 5 dígitos (ejemplo: ACE-00001)
      if (!validateCodigoItemFormat(codigoTrimmed)) {
        newErrors.codigoItem =
          'El código debe tener el formato: 3 letras mayúsculas + guion + 5 dígitos (ejemplo: ACE-00001)';
      }
    }

    // Validar descripción
    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formValues.clasificacionId || Number(formValues.clasificacionId) < 1) {
      newErrors.clasificacionId = 'Clasificación requerida';
    }
    if (!formValues.unidadMedidaId || Number(formValues.unidadMedidaId) < 1) {
      newErrors.unidadMedidaId = 'Unidad de medida requerida';
    }

    // Si es SERVICIO, no validar precios (se envían como 1)
    const isServicio = formValues.tipo === 'SERVICIO';
    if (!isServicio) {
      // Validar precios base (requeridos)
      // Precio Base Local es requerido - validar con máximo en córdobas
      const precioBaseLocalTrimmed = formValues.precioBaseLocal?.trim() || '';
      if (!precioBaseLocalTrimmed) {
        newErrors.precioBaseLocal =
          'Debes ingresar el precio base en córdobas (C$)';
      } else {
        const precioNum = Number(precioBaseLocalTrimmed);
        if (isNaN(precioNum)) {
          newErrors.precioBaseLocal =
            'El precio debe ser un número válido. Ejemplo: 50000';
        } else if (precioNum < 0) {
          newErrors.precioBaseLocal = 'El precio no puede ser negativo';
        } else if (precioNum > maxPrecioLocal) {
          const maxFormatted = maxPrecioLocal.toLocaleString('es-NI');
          newErrors.precioBaseLocal = `El precio excede el máximo permitido de C$ ${maxFormatted}. Ingresa un valor menor`;
        }
      }

      // Precio Base Dólar es requerido - validar con máximo en dólares
      const precioBaseDolarTrimmed = formValues.precioBaseDolar?.trim() || '';
      if (!precioBaseDolarTrimmed) {
        newErrors.precioBaseDolar =
          'Debes ingresar el precio base en dólares (USD)';
      } else {
        const precioNum = Number(precioBaseDolarTrimmed);
        if (isNaN(precioNum)) {
          newErrors.precioBaseDolar =
            'El precio debe ser un número válido. Ejemplo: 1000';
        } else if (precioNum < 0) {
          newErrors.precioBaseDolar = 'El precio no puede ser negativo';
        } else if (precioNum > maxPrecioDolar) {
          const maxFormatted = maxPrecioDolar.toLocaleString('es-NI');
          newErrors.precioBaseDolar = `El precio excede el máximo permitido de USD ${maxFormatted}. Ingresa un valor menor`;
        }
      }

      // Validar precios de adquisición (opcionales, pero si tienen valor deben ser válidos)
      const precioAdqLocalTrimmed =
        formValues.precioAdquisicionLocal?.trim() || '';
      if (precioAdqLocalTrimmed) {
        const precioNum = Number(precioAdqLocalTrimmed);
        if (isNaN(precioNum)) {
          newErrors.precioAdquisicionLocal =
            'El precio debe ser un número válido. Ejemplo: 40000';
        } else if (precioNum < 0) {
          newErrors.precioAdquisicionLocal = 'El precio no puede ser negativo';
        } else if (precioNum > maxPrecioLocal) {
          const maxFormatted = maxPrecioLocal.toLocaleString('es-NI');
          newErrors.precioAdquisicionLocal = `El precio excede el máximo permitido de C$ ${maxFormatted}. Ingresa un valor menor`;
        }
      }

      const precioAdqDolarTrimmed =
        formValues.precioAdquisicionDolar?.trim() || '';
      if (precioAdqDolarTrimmed) {
        const precioNum = Number(precioAdqDolarTrimmed);
        if (isNaN(precioNum)) {
          newErrors.precioAdquisicionDolar =
            'El precio debe ser un número válido. Ejemplo: 800';
        } else if (precioNum < 0) {
          newErrors.precioAdquisicionDolar = 'El precio no puede ser negativo';
        } else if (precioNum > maxPrecioDolar) {
          const maxFormatted = maxPrecioDolar.toLocaleString('es-NI');
          newErrors.precioAdquisicionDolar = `El precio excede el máximo permitido de USD ${maxFormatted}. Ingresa un valor menor`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    // Si es SERVICIO, enviar 1 a todos los precios
    const isServicio = formValues.tipo === 'SERVICIO';
    return {
      clasificacionId: Number(formValues.clasificacionId),
      unidadMedidaId: Number(formValues.unidadMedidaId),
      // codigoItem se genera automáticamente desde select + input numérico
      // Formato fijo XXX-00000, no necesita sanitización SQL/XSS
      codigoItem: formValues.codigoItem.trim().toUpperCase(),
      descripcion: formValues.descripcion.trim(),
      tipo: formValues.tipo,
      precioBaseLocal: isServicio
        ? 1
        : toNumberOrZero(formValues.precioBaseLocal),
      precioBaseDolar: isServicio
        ? 1
        : toNumberOrZero(formValues.precioBaseDolar),
      precioAdquisicionLocal: isServicio
        ? 1
        : toNumberOrZero(formValues.precioAdquisicionLocal),
      precioAdquisicionDolar: isServicio
        ? 1
        : toNumberOrZero(formValues.precioAdquisicionDolar),
      esCotizable: formValues.esCotizable,
      ultimaSalida: formValues.ultimaSalida || null,
      ultimoIngreso: formValues.ultimoIngreso || null,
      usuarioUltModif: formValues.usuarioUltModif,
      fechaUltModif: new Date().toISOString(),
      perecedero: formValues.perecedero,
      activo: formValues.activo,
    };
  };

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
              <span className="hidden sm:inline">
                Editar Producto #{params.id}
              </span>
              <span className="sm:hidden">Editar #{params.id}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Modifica la información del producto
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </span>
            <span className="sm:hidden">
              {saving ? 'Guardando...' : 'Guardar'}
            </span>
          </Button>
        </div>
      </div>

      <ItemForm values={formValues} onChange={setFormValues} errors={errors} />
    </div>
  );
}
