import { useState } from 'react';
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
import { TramiteSeguroForm } from '../ui/TramiteSeguroForm';
import { postTramiteSeguroAction } from '../actions/post-tramite-seguro';
import { TramiteSeguroEstado } from '@/shared/types/status';

export default function NuevoTramiteSeguroPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    idVehiculo: number;
    idCliente: number;
    idAseguradora: number;
    numeroTramite: string;
    estado: TramiteSeguroEstado;
    fechaInicio: string;
    fechaFin?: string;
    observaciones?: string;
  }) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      // TramiteSeguroForm ya sanitiza en tiempo real (handleInputChange)
      await postTramiteSeguroAction({
        idVehiculo: values.idVehiculo,
        idCliente: values.idCliente,
        idAseguradora: values.idAseguradora,
        numeroTramite: values.numeroTramite,
        estado: values.estado,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        observaciones: values.observaciones,
      });
      await queryClient.invalidateQueries({ queryKey: ['tramiteSeguros'] });
      toast.success('Trámite de seguro creado');
      navigate('/admin/tramites-seguros');
    } catch (error: any) {
      // El backend devuelve: { message: "...", error: "Bad Request", statusCode: 400 }
      const responseData = error?.response?.data;

      // Extraer el mensaje del backend - priorizar message que es el campo correcto
      const message =
        responseData?.message ||
        (error instanceof Error ? error.message : undefined) ||
        'No se pudo crear el trámite de seguro';

      toast.error(message, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Trámite de Seguro</h1>
        <p className="text-muted-foreground">
          Complete la información para registrar un nuevo trámite.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del trámite</CardTitle>
          <CardDescription>
            Todos los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TramiteSeguroForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/tramites-seguros')}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
