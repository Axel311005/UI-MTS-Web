import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TipoPagoForm } from '../ui/TipoPagoForm';
import { getTipoPagoById } from '../actions/get-tipo-pago-by-id';
import { patchTipoPago } from '../actions/patch-tipo-pago';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface TipoPagoFormValues {
  descripcion: string;
}

export default function EditarTipoPagoPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<TipoPagoFormValues>({
    descripcion: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TipoPagoFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTipoPago = async () => {
      try {
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID inválido');
        }
        const data = await getTipoPagoById(numericId);
        setFormValues({
          descripcion: data.descripcion ?? '',
        });
      } catch (error) {
        toast.error('No se pudo cargar el tipo de pago');
        navigate('/admin/tipos-pago');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchTipoPago();
    }
  }, [id, navigate]);

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

    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      toast.error('ID inválido');
      return;
    }

    setIsSubmitting(true);
    const dismiss = toast.loading('Actualizando tipo de pago...');

    try {
      await patchTipoPago(numericId, { descripcion: formValues.descripcion });
      toast.success('Tipo de pago actualizado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['tipoPagos'] });
      navigate('/admin/tipos-pago');
    } catch (error: any) {
      toast.error('No se pudo actualizar el tipo de pago');
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/tipos-pago')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Tipo de Pago</h1>
            <p className="text-muted-foreground">
              Modifica la información del tipo de pago
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/tipos-pago')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      <TipoPagoForm values={formValues} onChange={setFormValues} errors={errors} />
    </div>
  );
}
