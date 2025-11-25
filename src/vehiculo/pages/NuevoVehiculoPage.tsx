import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { VehiculoForm } from '../ui/VehiculoForm';
import { toast } from 'sonner';
import { postVehiculoAction } from '../actions/post-vehiculo';
import { useQueryClient } from '@tanstack/react-query';

export default function NuevoVehiculoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: any) => {
    try {
      // VehiculoForm ya sanitiza con sanitizeString antes de enviar
      await postVehiculoAction({
        idCliente: Number(data.idCliente),
        placa: data.placa,
        motor: data.motor,
        marca: data.marca,
        anio: data.anio ? Number(data.anio) : undefined,
        modelo: data.modelo,
        color: data.color,
        numChasis: data.numChasis,
      });

      toast.success('Vehículo creado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      navigate('/admin/vehiculos');
    } catch (error) {
      // No exponer detalles del error al usuario por seguridad
      toast.error('No se pudo crear el vehículo');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Vehículo</h1>
        <p className="text-muted-foreground">
          Crear un nuevo vehículo en el sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
          <CardDescription>Complete los datos del vehículo</CardDescription>
        </CardHeader>
        <CardContent>
          <VehiculoForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/vehiculos')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
