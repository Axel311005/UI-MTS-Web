import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { MonedaForm } from '../ui/MonedaForm';
import { postMoneda } from '../actions/post-moneda';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EstadoActivo } from '@/shared/types/status';
import {
  validateText,
  validatePrecio,
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

interface MonedaFormValues {
  descripcion: string;
  tipoCambio: number | '';
}

export default function NuevaMonedaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<MonedaFormValues>({
    descripcion: '',
    tipoCambio: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof MonedaFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MonedaFormValues, string>> = {};

    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else {
      const descValidation = validateText(
        formValues.descripcion.trim(),
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false
      );
      if (!descValidation.isValid) {
        newErrors.descripcion = descValidation.error || 'Descripción inválida';
      }
    }

    if (formValues.tipoCambio === '') {
      newErrors.tipoCambio = 'El tipo de cambio es requerido';
    } else {
      const tipoCambioValidation = validatePrecio(
        formValues.tipoCambio,
        VALIDATION_RULES.precio.max
      );
      if (!tipoCambioValidation.isValid) {
        newErrors.tipoCambio = tipoCambioValidation.error || 'Tipo de cambio inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Creando moneda...');

    try {
      await postMoneda({
        descripcion: sanitizeText(
          formValues.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false
        ),
        tipoCambio: Number(formValues.tipoCambio),
        activo: EstadoActivo.ACTIVO,
      });
      toast.success('Moneda creada exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['monedas'] });
      navigate('/admin/monedas');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear la moneda';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/monedas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Moneda</h1>
            <p className="text-muted-foreground">
              Crea una nueva moneda para tus transacciones
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/monedas')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <MonedaForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
      />
    </div>
  );
}

