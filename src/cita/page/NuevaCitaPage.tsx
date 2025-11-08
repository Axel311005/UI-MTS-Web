import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { CitaForm, type CitaFormValues } from '../ui/CitaForm';
import { postCitaAction } from '../actions/post-cita';
import { postMotivoCitaAction } from '../actions/post-motivo-cita';

export default function NuevaCitaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CitaFormValues) => {
    try {
      // Siempre crear un nuevo motivo con la descripción proporcionada
      const nuevoMotivo = await postMotivoCitaAction({
        descripcion: data.motivoDescripcion.trim(),
      });

      // Invalidar la lista de motivos para que se actualice
      await queryClient.invalidateQueries({ queryKey: ['motivosCita'] });

      // Crear la cita con el motivo recién creado
      await postCitaAction({
        idCliente: data.idCliente,
        idVehiculo: data.idVehiculo,
        idMotivoCita: nuevoMotivo.idMotivoCita,
        fechaInicio: data.fechaInicio,
        estado: data.estado,
        canal: data.canal,
      });

      await queryClient.invalidateQueries({ queryKey: ['citas'] });

      toast.success('Cita creada exitosamente');

      navigate('/citas');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : 'No se pudo crear la cita');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Cita</h1>
        <p className="text-muted-foreground">
          Crear una nueva cita para un cliente
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cita</CardTitle>
          <CardDescription>Complete los datos de la nueva cita</CardDescription>
        </CardHeader>
        <CardContent>
          <CitaForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/citas')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
