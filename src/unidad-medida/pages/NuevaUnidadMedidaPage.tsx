import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { UnidadMedidaForm } from '../ui/UnidadMedidaForm';
import { postUnidadMedida } from '../actions/post-unidad-medida';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  validateText,
  sanitizeText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

interface UnidadMedidaFormValues {
  descripcion: string;
}

export default function NuevaUnidadMedidaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<UnidadMedidaFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UnidadMedidaFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UnidadMedidaFormValues, string>> = {};

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
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Creando unidad de medida...');

    try {
      await postUnidadMedida({
        descripcion: sanitizeText(
          formValues.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false
        ),
      });
      toast.success('Unidad de medida creada exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['unidadMedidas'] });
      navigate('/admin/unidades-medida');
    } catch (error: any) {
      toast.error('No se pudo crear la unidad de medida');
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
            onClick={() => navigate('/unidades-medida')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Unidad de Medida</h1>
            <p className="text-muted-foreground">
              Crea una nueva unidad de medida para tus productos
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/unidades-medida')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <UnidadMedidaForm
        values={formValues}
        onChange={setFormValues}
        errors={errors}
      />
    </div>
  );
}
