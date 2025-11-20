import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ImpuestoForm } from '../ui/ImpuestoForm';
import { postImpuesto } from '../actions/post-impuesto';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EstadoActivo } from '@/shared/types/status';
import {
  validateText,
  validatePorcentaje,
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

interface ImpuestoFormValues {
  descripcion: string;
  porcentaje: number | '';
}

export default function NuevaImpuestoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<ImpuestoFormValues>({
    descripcion: '',
    porcentaje: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ImpuestoFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ImpuestoFormValues, string>> = {};

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

    if (formValues.porcentaje === '') {
      newErrors.porcentaje = 'El porcentaje es requerido';
    } else {
      const porcentajeValidation = validatePorcentaje(formValues.porcentaje);
      if (!porcentajeValidation.isValid) {
        newErrors.porcentaje = porcentajeValidation.error || 'Porcentaje inválido';
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
    const dismiss = toast.loading('Creando impuesto...');

    try {
      await postImpuesto({
        descripcion: sanitizeText(
          formValues.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false
        ),
        porcentaje: Number(formValues.porcentaje),
        activo: EstadoActivo.ACTIVO,
      });
      toast.success('Impuesto creado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['impuestos'] });
      navigate('/admin/impuestos');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear el impuesto';
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
            onClick={() => navigate('/impuestos')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Impuesto</h1>
            <p className="text-muted-foreground">
              Crea un nuevo impuesto para tus transacciones
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/impuestos')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <ImpuestoForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
      />
    </div>
  );
}

