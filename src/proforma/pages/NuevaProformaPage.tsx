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
import { ProformaForm } from '../ui/ProformaForm';
import { postProformaAction } from '../actions/post-proforma';
import { postProformaLineaAction } from '../actions/post-proforma-linea';
import type { ProformaLine } from '../ui/ProformaLineaTable';
import { sanitizeString } from '@/shared/utils/security';

export default function NuevaProformaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingLines, setSavingLines] = useState(false);
  const [proformaId, setProformaId] = useState<number | null>(null);

  const handleSaveHeader = async (data: {
    idTramiteSeguro: number;
    idConsecutivo: number; // Requerido
    idMoneda: number;
    idImpuesto?: number | null;
    observaciones?: string;
    fecha?: string; // No se envía en POST
  }) => {
    if (savingHeader) return;
    setSavingHeader(true);
    const dismiss = toast.loading('Guardando proforma…');
    try {
      const payload = {
        idTramiteSeguro: data.idTramiteSeguro,
        idConsecutivo: data.idConsecutivo,
        idMoneda: data.idMoneda,
        idImpuesto: data.idImpuesto ?? undefined,
        observaciones: data.observaciones
          ? sanitizeString(data.observaciones.trim(), 500)
          : undefined,
      };
      // payload ya sanitiza observaciones con sanitizeString
      const resp = await postProformaAction(payload);
      const newId =
        (resp?.idProforma as number) ??
        (resp?.proforma?.idProforma as number) ??
        (resp?.proformaId as number) ??
        null;
      if (!newId) throw new Error('No se recibió un idProforma válido');
      setProformaId(newId);
      toast.success('Proforma guardada correctamente');
      await queryClient.invalidateQueries({ queryKey: ['proformas'] });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? 'No se pudo guardar la proforma'
      );
    } finally {
      toast.dismiss(dismiss);
      setSavingHeader(false);
    }
  };

  const handleSaveLines = async (lines: ProformaLine[]) => {
    if (savingLines) return;
    if (!proformaId) {
      toast.error('Primero guarda la proforma para obtener su ID');
      return;
    }
    const validLines = (lines ?? []).filter(
      (l) => l.idItem && l.cantidad > 0 && l.precioUnitario > 0
    );
    if (validLines.length === 0) {
      toast.warning('No hay líneas válidas para guardar');
      return;
    }
    setSavingLines(true);
    const dismiss = toast.loading('Guardando líneas…');
    try {
      // Las líneas solo tienen números (idProforma, idItem, cantidad, precioUnitario, totalLinea) - no necesitan sanitización
      const linesPayload = validLines.map((l) => ({
        idProforma: proformaId,
        idItem: l.idItem,
        cantidad: Number(l.cantidad),
        precioUnitario: Number(l.precioUnitario),
        totalLinea: Number(l.totalLinea || l.cantidad * l.precioUnitario),
      }));
      
      await Promise.all(
        linesPayload.map((p) => postProformaLineaAction(p))
      );
      toast.success('Líneas guardadas correctamente');
      await queryClient.invalidateQueries({ queryKey: ['proformas'] });
      navigate('/admin/proformas');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? 'No se pudo guardar las líneas'
      );
    } finally {
      toast.dismiss(dismiss);
      setSavingLines(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Proforma</h1>
        <p className="text-muted-foreground">Crear una nueva proforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Proforma</CardTitle>
          <CardDescription>Complete los datos de la proforma</CardDescription>
        </CardHeader>
        <CardContent>
          <ProformaForm
            onSaveHeader={handleSaveHeader}
            onSaveLines={handleSaveLines}
            onCancel={() => navigate('/proformas')}
            isSavingHeader={savingHeader}
            isSavingLines={savingLines}
          />
        </CardContent>
      </Card>
    </div>
  );
}
