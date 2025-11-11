import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { UnidadMedidaForm } from '../ui/UnidadMedidaForm';
import { getUnidadMedidaById } from '../actions/get-unidad-medida-by-id';
import { patchUnidadMedida } from '../actions/patch-unidad-medida';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UnidadMedidaFormValues {
  descripcion: string;
}

export default function EditarUnidadMedidaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<UnidadMedidaFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof UnidadMedidaFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUnidadMedida = async () => {
      try {
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID inválido');
        }
        const data = await getUnidadMedidaById(numericId);
        setFormValues({
          descripcion: data.descripcion ?? '',
        });
      } catch (error) {
        toast.error('No se pudo cargar la unidad de medida');
        navigate('/admin/unidades-medida');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchUnidadMedida();
    }
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UnidadMedidaFormValues, string>> = {};

    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      toast.error('ID inválido');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Actualizando unidad de medida...');

    try {
      await patchUnidadMedida(numericId, { descripcion: formValues.descripcion });
      toast.success('Unidad de medida actualizada exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['unidadMedidas'] });
      navigate('/admin/unidades-medida');
    } catch (error: any) {
      toast.error('No se pudo actualizar la unidad de medida');
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/unidades-medida')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Unidad de Medida</h1>
            <p className="text-muted-foreground">
              Modifica la información de la unidad de medida
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/unidades-medida')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
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
