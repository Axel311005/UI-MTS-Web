import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { ClasificacionForm } from '../ui/ClasificacionForm';
import { postClasificacionItem } from '../actions/post-clasificacion-item';
import {
  validateText,
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

interface ClasificacionFormValues {
  descripcion: string;
}

export default function NuevaClasificacionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<ClasificacionFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClasificacionFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ClasificacionFormValues, string>> =
      {};
    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else {
      const validation = validateText(
        formValues.descripcion.trim(),
        VALIDATION_RULES.descripcion.min,
        VALIDATION_RULES.descripcion.max,
        false
      );
      if (!validation.isValid) {
        newErrors.descripcion = validation.error || 'Descripción inválida';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const isValid = validateForm();
    if (!isValid) {
      toast.error('Por favor completa la descripción de la clasificación');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Creando clasificación...');
    try {
      await postClasificacionItem({
        descripcion: sanitizeText(
          formValues.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false
        ),
      });
      toast.success('Clasificación creada correctamente');
      await queryClient.invalidateQueries({
        queryKey: ['clasificacionItems'],
        exact: false,
      });
      navigate('/admin/clasificaciones');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear la clasificación';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) navigate('/clasificaciones');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nueva Clasificación
            </h1>
            <p className="text-muted-foreground">
              Crea una nueva clasificación para tus productos
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="button-hover"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <ClasificacionForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
      />
    </div>
  );
}
