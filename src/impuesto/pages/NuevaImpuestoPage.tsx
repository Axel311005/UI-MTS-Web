import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ImpuestoForm } from '../ui/ImpuestoForm';
import { postImpuesto } from '../actions/post-impuesto';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EstadoActivo } from '@/shared/types/status';

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

    setIsSubmitting(true);
    const dismiss = toast.loading('Creando impuesto...');

    try {
      await postImpuesto({
        descripcion: formValues.descripcion,
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

