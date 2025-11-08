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
import { CitaForm, type CitaFormValues } from '../ui/CitaForm';
import { getCitaByIdAction } from '../actions/get-cita-by-id';
import { patchCitaAction } from '../actions/patch-cita';

const toDateTimeLocal = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    } catch {}
  }
  return '';
};

export default function EditarCitasPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const queryClient = useQueryClient();
  const idCita = Number(id);

  const {
    data: cita,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cita', idCita],
    queryFn: () => getCitaByIdAction(idCita),
    enabled: Number.isFinite(idCita) && idCita > 0,
  });

  const handleSubmit = async (data: CitaFormValues) => {
    try {
      await patchCitaAction(idCita, {
        idCliente: data.idCliente,
        idVehiculo: data.idVehiculo,
        idMotivoCita: data.idMotivoCita,
        fechaInicio: data.fechaInicio,
        estado: data.estado,
        canal: data.canal,
      });

      await queryClient.invalidateQueries({ queryKey: ['citas'] });
      await queryClient.invalidateQueries({
        queryKey: ['cita', idCita],
      });

      toast.success('Cita actualizada exitosamente');

      navigate('/citas');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo actualizar la cita');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Cita</h1>
        <p className="text-muted-foreground">Modificar los datos de la cita</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cita</CardTitle>
          <CardDescription>Actualice los datos de la cita</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-muted-foreground">Cargando cita...</p>
          )}
          {isError && (
            <p className="text-sm text-destructive">
              No se pudo cargar la cita
            </p>
          )}
          {!!cita && (
            <CitaForm
              defaultValues={{
                idCliente: cita.cliente?.idCliente,
                idVehiculo: cita.vehiculo?.idVehiculo,
                idMotivoCita: cita.motivoCita?.idMotivoCita,
                fechaInicio: toDateTimeLocal(cita.fechaInicio),
                estado: cita.estado,
                canal: cita.canal,
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/citas')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
