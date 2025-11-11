import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { RecepcionForm, type RecepcionFormValues } from '../ui/RecepcionForm';
import { getRecepcionByIdAction } from '../actions/get-recepcion-by-id';
import { patchRecepcionAction } from '../actions/patch-recepcion';

export default function EditarRecepcionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();
  const idRecepcion = Number(id);

  const {
    data: recepcion,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['recepcion', idRecepcion],
    queryFn: () => getRecepcionByIdAction(idRecepcion),
    enabled: Number.isFinite(idRecepcion) && idRecepcion > 0,
  });

  const toDateInput = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);
    try {
      const d = new Date(value as any);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {}
    return '';
  };

  const handleSubmit = async (data: RecepcionFormValues) => {
    try {
      await patchRecepcionAction(idRecepcion, {
        idVehiculo: data.idVehiculo,
        fechaRecepcion: data.fechaRecepcion,
        observaciones: data.observaciones,
        estado: data.estado,
        fechaEntregaEstimada: data.fechaEntregaEstimada,
        fechaEntregaReal: null, // Siempre se envía null
      });

      await queryClient.invalidateQueries({ queryKey: ['recepciones'] });
      await queryClient.invalidateQueries({
        queryKey: ['recepcion', idRecepcion],
      });

      toast.success('Recepción actualizada');

      navigate('/admin/recepciones');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la recepción';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Recepción</h1>
        <p className="text-muted-foreground">
          Modificar los datos de la recepción
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Recepción</CardTitle>
          <CardDescription>Actualice los datos de la recepción</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Cargando recepción...
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              No se pudo cargar la recepción
            </p>
          )}
          {!!recepcion && (
            <RecepcionForm
              defaultValues={{
                idVehiculo: recepcion.vehiculo?.idVehiculo,
                idConsecutivo: recepcion.consecutivo?.idConsecutivo ?? 5,
                estado: recepcion.estado as any,
                fechaRecepcion: toDateInput(recepcion.fechaRecepcion),
                fechaEntregaEstimada: toDateInput(
                  recepcion.fechaEntregaEstimada
                ),
                // fechaEntregaReal no se muestra en el formulario, siempre se envía null
                observaciones: (recepcion as any).observaciones ?? '',
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/recepciones')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
