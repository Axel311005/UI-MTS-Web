import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { ClasificacionForm } from '../ui/ClasificacionForm';
import { getClasificacionItemById } from '../actions/get-clasificacion-item-by-id';
import { patchClasificacionItem } from '../actions/patch-clasificacion-item';

interface ClasificacionFormValues {
  descripcion: string;
}

export default function EditarClasificacionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<ClasificacionFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ClasificacionFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      toast.error('No se pudo determinar la clasificación a editar');
      navigate('/admin/clasificaciones');
      return;
    }

    const loadClasificacion = async () => {
      setIsLoading(true);
      try {
        const clasificacion = await getClasificacionItemById(numericId);
        setFormValues({ descripcion: clasificacion.descripcion ?? '' });
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === 'string' ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          'No se pudo cargar la clasificación';
        toast.error(message);
        navigate('/admin/clasificaciones');
      } finally {
        setIsLoading(false);
      }
    };

    void loadClasificacion();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ClasificacionFormValues, string>> =
      {};
    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      toast.error('No se pudo determinar la clasificación a editar');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Por favor completa la descripción de la clasificación');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Actualizando clasificación...');
    try {
      await patchClasificacionItem(numericId, {
        descripcion: formValues.descripcion,
      });
      toast.success('Clasificación actualizada correctamente');
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
        'No se pudo actualizar la clasificación';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) navigate('/clasificaciones');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando clasificación...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Clasificación
            </h1>
            <p className="text-muted-foreground">
              Modifica la información de la clasificación
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
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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
