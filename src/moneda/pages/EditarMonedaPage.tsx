import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { MonedaForm } from '../ui/MonedaForm';
import { getMonedaById } from '../actions/get-moneda-by-id';
import { patchMoneda } from '../actions/patch-moneda';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MonedaFormValues {
  descripcion: string;
  tipoCambio: number | '';
}

export default function EditarMonedaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<MonedaFormValues>({
    descripcion: '',
    tipoCambio: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof MonedaFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoneda = async () => {
      try {
        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          throw new Error('ID inválido');
        }
        const data = await getMonedaById(numericId);
        setFormValues({
          descripcion: data.descripcion ?? '',
          tipoCambio: Number(data.tipoCambio) || '',
        });
      } catch (error) {
        toast.error('No se pudo cargar la moneda');
        navigate('/admin/monedas');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchMoneda();
    }
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MonedaFormValues, string>> = {};

    if (!formValues.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (formValues.tipoCambio === '' || Number(formValues.tipoCambio) <= 0) {
      newErrors.tipoCambio = 'El tipo de cambio debe ser mayor a 0';
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
    const dismiss = toast.loading('Actualizando moneda...');

    try {
      await patchMoneda(numericId, {
        descripcion: formValues.descripcion,
        tipoCambio: Number(formValues.tipoCambio),
      });
      toast.success('Moneda actualizada exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['monedas'] });
      navigate('/admin/monedas');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar la moneda';
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/monedas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Moneda</h1>
            <p className="text-muted-foreground">
              Modifica la información de la moneda
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/monedas')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="button-hover">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
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

