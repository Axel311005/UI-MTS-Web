import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ImpuestoForm } from '../ui/ImpuestoForm';
import { getImpuestoById } from '../actions/get-impuesto-by-id';
import { patchImpuesto } from '../actions/patch-impuesto';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sanitizeText, VALIDATION_RULES } from '@/shared/utils/validation';

interface ImpuestoFormValues {
  descripcion: string;
  porcentaje: number | '';
}

export default function EditarImpuestoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<ImpuestoFormValues>({
    descripcion: '',
    porcentaje: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ImpuestoFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpuesto = async () => {
      try {
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID inválido');
        }
        const data = await getImpuestoById(numericId);
        setFormValues({
          descripcion: data.descripcion ?? '',
          porcentaje: Number(data.porcentaje) || '',
        });
      } catch (error) {
        toast.error('No se pudo cargar el impuesto');
        navigate('/admin/impuestos');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchImpuesto();
    }
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ImpuestoFormValues, string>> = {};

    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (formValues.porcentaje === '' || Number(formValues.porcentaje) < 0 || Number(formValues.porcentaje) > 100) {
      newErrors.porcentaje = 'El porcentaje debe estar entre 0 y 100';
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
    const dismiss = toast.loading('Actualizando impuesto...');

    try {
      await patchImpuesto(numericId, {
        descripcion: formValues.descripcion,
        porcentaje: Number(formValues.porcentaje),
      });
      toast.success('Impuesto actualizado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['impuestos'] });
      navigate('/admin/impuestos');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar el impuesto';
      toast.error(message);
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/impuestos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Impuesto</h1>
            <p className="text-muted-foreground">
              Modifica la información del impuesto
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/impuestos')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
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

