import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { BodegaForm, type BodegaFormValues } from '../ui/BodegaForm';
import { getBodegaByIdAction } from '../actions/get-bodega-by-id';
import { patchBodegaAction } from '../actions/patch-bodega';

export default function EditarBodegaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<BodegaFormValues>({ descripcion: '' });
  const [errors, setErrors] = useState<
    Partial<Record<keyof BodegaFormValues, string>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bodega = await getBodegaByIdAction(Number(id));
        setValues({ descripcion: bodega.descripcion });
      } catch (error: any) {
        const message =
          error?.message || 'No se pudo cargar la bodega seleccionada';
        toast.error(message);
        navigate('/admin/bodegas');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const validate = () => {
    const e: Partial<Record<keyof BodegaFormValues, string>> = {};
    if (!values.descripcion.trim())
      e.descripcion = 'La descripción es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validate()) {
      toast.error('Completa la descripción de la bodega');
      return;
    }
    setIsSubmitting(true);
    const dismiss = toast.loading('Actualizando bodega...');
    try {
      await patchBodegaAction(Number(id), { descripcion: values.descripcion });
      toast.success('Bodega actualizada');
      await queryClient.invalidateQueries({
        queryKey: ['bodegas'],
        exact: false,
      });
      navigate('/admin/bodegas');
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === 'string' ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo actualizar la bodega';
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) navigate('/bodegas');
  };

  if (isLoading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Bodega</h1>
            <p className="text-muted-foreground">
              Modifica la información de la bodega
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
            onClick={handleSave}
            disabled={isSubmitting}
            className="button-hover"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <BodegaForm values={values} onChange={setValues} errors={errors} />
    </div>
  );
}
