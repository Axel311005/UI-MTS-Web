import { useMemo, useState } from 'react';
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
import { ProformaForm } from '../ui/ProformaForm';
import { getProformaByIdAction } from '../actions/get-proforma-by-id';
import { getProformaLineasByProformaIdAction } from '../actions/get-proforma-lineas-by-proforma-id';
import { patchProformaAction } from '../actions/patch-proforma';
import { postProformaLineaAction } from '../actions/post-proforma-linea';
import { patchProformaLineaAction } from '../actions/patch-proforma-linea';
import type { ProformaLine } from '../ui/ProformaLineaTable';

export default function EditarProformaPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const proformaId = useMemo(() => Number(id), [id]);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingLines, setSavingLines] = useState(false);

  const proformaQuery = useQuery({
    queryKey: ['proforma', proformaId],
    enabled: Number.isFinite(proformaId) && proformaId > 0,
    queryFn: () => getProformaByIdAction(proformaId),
  });

  const lineasQuery = useQuery({
    queryKey: ['proforma.lineas', proformaId],
    enabled: Number.isFinite(proformaId) && proformaId > 0,
    queryFn: () => getProformaLineasByProformaIdAction(proformaId),
  });

  const defaults = useMemo(() => {
    const p = proformaQuery.data as any;
    if (!p) return undefined;
    return {
      idTramiteSeguro: p?.tramiteSeguro?.idTramiteSeguro ?? '',
      idConsecutivo: p?.consecutivo?.idConsecutivo ?? '',
      idMoneda: p?.moneda?.idMoneda ?? '',
      idImpuesto: p?.impuesto?.idImpuesto ?? '',
      observaciones: p?.observaciones ?? '',
      fecha: p?.fecha ? String(p.fecha).substring(0, 10) : undefined,
    };
  }, [proformaQuery.data]);

  const defaultLines = useMemo<ProformaLine[]>(() => {
    const lines = (lineasQuery.data ?? []) as any[];
    return lines.map((l) => ({
      idProformaLineas: l.idProformaLineas,
      idItem: l?.item?.idItem ?? 0,
      cantidad: Number(l?.cantidad ?? 0),
      precioUnitario: Number(l?.precioUnitario ?? 0),
      totalLinea: Number(l?.totalLinea ?? 0),
    }));
  }, [lineasQuery.data]);

  const handleSaveHeader = async (data: {
    idTramiteSeguro: number;
    idConsecutivo: number; // Requerido en POST, opcional en PATCH pero lo enviamos siempre
    idMoneda: number;
    idImpuesto?: number | null;
    observaciones?: string;
    fecha?: string;
  }) => {
    if (savingHeader) return;
    setSavingHeader(true);
    const dismiss = toast.loading('Actualizando proforma…');
    try {
      await patchProformaAction(proformaId, {
        idTramiteSeguro: data.idTramiteSeguro,
        idConsecutivo: data.idConsecutivo,
        idMoneda: data.idMoneda,
        idImpuesto: data.idImpuesto ?? undefined,
        fecha: data.fecha,
        observaciones: data.observaciones,
      });
      toast.success('Proforma actualizada');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['proformas'] }),
        queryClient.invalidateQueries({ queryKey: ['proforma', proformaId] }),
      ]);
    } catch (err: any) {
      console.error('Error actualizando proforma:', err);
      toast.error(
        err?.response?.data?.message ?? 'No se pudo actualizar la proforma'
      );
    } finally {
      toast.dismiss(dismiss);
      setSavingHeader(false);
    }
  };

  const handleSaveLines = async (lines: ProformaLine[]) => {
    if (savingLines) return;
    setSavingLines(true);
    const dismiss = toast.loading('Guardando líneas…');
    try {
      const ops = (lines ?? [])
        .filter((l) => l.idItem > 0 && l.cantidad > 0 && l.precioUnitario > 0)
        .map((l) => {
          const payload = {
            idItem: l.idItem,
            cantidad: Number(l.cantidad),
            precioUnitario: Number(l.precioUnitario),
            totalLinea: Number(l.totalLinea || l.cantidad * l.precioUnitario),
          };
          if (l.idProformaLineas) {
            return patchProformaLineaAction(l.idProformaLineas, payload);
          }
          return postProformaLineaAction({
            idProforma: proformaId,
            ...payload,
          });
        });
      await Promise.all(ops);
      toast.success('Líneas guardadas correctamente');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['proforma.lineas', proformaId],
        }),
        queryClient.invalidateQueries({ queryKey: ['proformas'] }),
      ]);
      navigate('/admin/proformas');
    } catch (err: any) {
      console.error('Error guardando líneas:', err);
      toast.error(
        err?.response?.data?.message ?? 'No se pudieron guardar las líneas'
      );
    } finally {
      toast.dismiss(dismiss);
      setSavingLines(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Proforma</h1>
        <p className="text-muted-foreground">
          Modificar los datos de la proforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Proforma</CardTitle>
          <CardDescription>Actualice los datos de la proforma</CardDescription>
        </CardHeader>
        <CardContent>
          <ProformaForm
            defaultValues={defaults}
            defaultLines={defaultLines}
            onSaveHeader={handleSaveHeader}
            onSaveLines={handleSaveLines}
            onCancel={() => navigate('/proformas')}
            isSavingHeader={savingHeader}
            isSavingLines={savingLines}
            proformaId={proformaId}
            immediatePersist={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
