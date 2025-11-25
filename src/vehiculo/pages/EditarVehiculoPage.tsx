import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { getVehiculoById } from '../actions/get-vehiculo-by-id';
import { patchVehiculoAction } from '../actions/patch-vehiculo';
import { VehiculoForm } from '../ui/VehiculoForm';
import { useQueryClient } from '@tanstack/react-query';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

export default function EditarVehiculoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any | null>(null);
  const [clienteNombre, setClienteNombre] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const vehiculo = await getVehiculoById(Number(id));
        const values = {
          idCliente: vehiculo.cliente?.idCliente ?? '',
          placa: vehiculo.placa ?? '',
          motor: vehiculo.motor ?? '',
          marca: vehiculo.marca ?? '',
          anio: vehiculo.anio ?? '',
          modelo: vehiculo.modelo ?? '',
          color: vehiculo.color ?? '',
          numChasis: vehiculo.numChasis ?? '',
        };
        setInitialValues(values);
        setClienteNombre(vehiculo.cliente ? getClienteNombre(vehiculo.cliente) : '');
      } catch (e) {
        toast.error('No se pudo cargar el vehículo');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      // VehiculoForm ya sanitiza con sanitizeString antes de enviar
      await patchVehiculoAction(Number(id), {
        placa: data.placa,
        motor: data.motor,
        marca: data.marca,
        anio: data.anio ? Number(data.anio) : undefined,
        modelo: data.modelo,
        color: data.color,
        numChasis: data.numChasis,
      });
      toast.success('Vehículo actualizado exitosamente');
      await queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      navigate('/admin/vehiculos');
    } catch (error) {
      toast.error('No se pudo actualizar el vehículo');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Vehículo</h1>
        <p className="text-muted-foreground">
          Modificar los datos del vehículo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
          <CardDescription>Actualice los datos del vehículo</CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && initialValues && (
            <VehiculoForm
              defaultValues={initialValues}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/vehiculos')}
              disableClientSelect
              clientName={clienteNombre}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
