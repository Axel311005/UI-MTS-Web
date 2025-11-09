import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TipoPagoForm } from '../ui/TipoPagoForm';
import { postTipoPago } from '../actions/post-tipo-pago';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TipoPagoFormValues {
  descripcion: string;
}

export default function NuevoTipoPagoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<TipoPagoFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TipoPagoFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TipoPagoFormValues, string>> = {};

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

    setIsSubmitting(true);
    const dismiss = toast.loading('Creando tipo de pago...');

    try {
      await postTipoPago({ descripcion: formValues.descripcion });
      toast.success('Tipo de pago creado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['tipoPagos'] });
      navigate('/admin/tipos-pago');
    } catch (error: any) {
      toast.error('No se pudo crear el tipo de pago');
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tipos-pago')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Tipo de Pago</h1>
            <p className="text-muted-foreground">
              Crea un nuevo método de pago para el sistema
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/tipos-pago')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <TipoPagoForm values={formValues} onChange={setFormValues} errors={errors} />
    </div>
  );
}
