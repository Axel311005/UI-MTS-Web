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
import {
  RecepcionSeguimientoForm,
  type RecepcionSeguimientoFormValues,
} from '../ui/RecepcionSeguimientoForm';
import { getRecepcionSeguimientoByIdAction } from '../actions/get-recepcion-seguimiento-by-id';
import { patchRecepcionSeguimientoAction } from '../actions/patch-recepcion-seguimiento';

export default function EditarRecepcionSeguimientoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();
  const idRecepcionSeguimiento = Number(id);

  const {
    data: seguimiento,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['recepcion-seguimiento', idRecepcionSeguimiento],
    queryFn: () => getRecepcionSeguimientoByIdAction(idRecepcionSeguimiento),
    enabled: Number.isFinite(idRecepcionSeguimiento) && idRecepcionSeguimiento > 0,
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

  const handleSubmit = async (data: RecepcionSeguimientoFormValues) => {
    try {
      await patchRecepcionSeguimientoAction(idRecepcionSeguimiento, {
        idRecepcion: data.idRecepcion,
        fecha: data.fecha,
        estado: data.estado,
        descripcion: data.descripcion,
      });

      await queryClient.invalidateQueries({
        queryKey: ['recepcion-seguimiento'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['recepcion-seguimiento', idRecepcionSeguimiento],
      });

      toast.success('Seguimiento de recepción actualizado');

      navigate('/recepcion-seguimiento');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el seguimiento';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Seguimiento</h1>
        <p className="text-muted-foreground">
          Modificar los datos del seguimiento de recepción
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Seguimiento</CardTitle>
          <CardDescription>
            Actualice los datos del seguimiento de recepción
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Cargando seguimiento...
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              No se pudo cargar el seguimiento
            </p>
          )}
          {!!seguimiento && (
            <RecepcionSeguimientoForm
              defaultValues={{
                idRecepcion: seguimiento.recepcion?.idRecepcion,
                fecha: toDateInput(seguimiento.fecha),
                estado: seguimiento.estado as any,
                descripcion: seguimiento.descripcion ?? '',
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/recepcion-seguimiento')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

