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
import { RecepcionForm, type RecepcionFormValues } from '../ui/RecepcionForm';
import { postRecepcionAction } from '../actions/post-recepcion';
import { useAuthStore } from '@/auth/store/auth.store';

export default function NuevaRecepcionPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const empleadoId = useAuthStore((s) => s.user?.empleado?.id ?? null);

  const handleSubmit = async (data: RecepcionFormValues) => {
    try {
      if (!empleadoId) throw new Error('No hay empleado en sesión');

      await postRecepcionAction({
        idVehiculo: data.idVehiculo,
        idEmpleado: empleadoId,
        consecutivoId: data.idConsecutivo,
        fechaRecepcion: data.fechaRecepcion,
        observaciones: data.observaciones,
        estado: data.estado,
        fechaEntregaEstimada: data.fechaEntregaEstimada,
        fechaEntregaReal: null, // Siempre se envía null
      });

      await queryClient.invalidateQueries({ queryKey: ['recepciones'] });

      toast.success('Recepción creada');

      navigate('/admin/recepciones');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error instanceof Error
          ? error.message
          : 'No se pudo crear la recepción');
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Recepción</h1>
        <p className="text-muted-foreground">
          Crear una nueva recepción de vehículo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Recepción</CardTitle>
          <CardDescription>Complete los datos de la recepción</CardDescription>
        </CardHeader>
        <CardContent>
          <RecepcionForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/recepciones')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
