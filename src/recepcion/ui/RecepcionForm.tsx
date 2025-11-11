import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { EstadoActivo, RecepcionEstado } from '@/shared/types/status';
import { useAuthStore } from '@/auth/store/auth.store';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';

export type RecepcionFormValues = {
  idVehiculo: number;
  idConsecutivo: number;
  estado: RecepcionEstado;
  fechaRecepcion: string; // yyyy-MM-dd
  fechaEntregaEstimada: string; // yyyy-MM-dd
  fechaEntregaReal?: string | null; // yyyy-MM-dd | '' | null
  observaciones?: string;
};

interface RecepcionFormProps {
  defaultValues?: Partial<RecepcionFormValues>;
  onSubmit: (data: RecepcionFormValues) => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export function RecepcionForm({
  defaultValues,
  onSubmit,
  onCancel,
}: RecepcionFormProps) {
  const { vehiculos } = useVehiculo();
  const user = useAuthStore((s) => s.user);

  const activeVehiculos = useMemo(
    () => (vehiculos ?? []).filter((v) => v.activo === EstadoActivo.ACTIVO),
    [vehiculos]
  );

  const [values, setValues] = useState<RecepcionFormValues>({
    idVehiculo:
      defaultValues?.idVehiculo ?? activeVehiculos[0]?.idVehiculo ?? 0,
    idConsecutivo: defaultValues?.idConsecutivo ?? 5, // ID 5 es el consecutivo de recepción
    estado: defaultValues?.estado ?? RecepcionEstado.PENDIENTE,
    fechaRecepcion: defaultValues?.fechaRecepcion ?? today(),
    fechaEntregaEstimada: defaultValues?.fechaEntregaEstimada ?? today(),
    fechaEntregaReal: undefined, // No se usa en el formulario, siempre se envía null
    observaciones: defaultValues?.observaciones ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const empleadoNombre = user?.empleado
    ? (user.empleado.nombreCompleto || 
       [user.empleado.primerNombre, user.empleado.primerApellido].filter(Boolean).join(' '))
    : '—';

  const update = (patch: Partial<RecepcionFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.idVehiculo || values.idVehiculo <= 0)
      e.idVehiculo = 'Seleccione un vehículo';
    if (!values.idConsecutivo || values.idConsecutivo <= 0)
      e.idConsecutivo = 'Seleccione un consecutivo';
    if (!values.fechaRecepcion)
      e.fechaRecepcion = 'La fecha de recepción es requerida';
    if (!values.fechaEntregaEstimada)
      e.fechaEntregaEstimada = 'La fecha estimada es requerida';

    const start = values.fechaRecepcion
      ? new Date(values.fechaRecepcion)
      : null;
    const eta = values.fechaEntregaEstimada
      ? new Date(values.fechaEntregaEstimada)
      : null;
    if (start && eta && eta < start)
      e.fechaEntregaEstimada = 'No puede ser anterior a la recepción';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      idVehiculo: Number(values.idVehiculo),
      idConsecutivo: Number(values.idConsecutivo),
      estado: values.estado,
      fechaRecepcion: values.fechaRecepcion,
      fechaEntregaEstimada: values.fechaEntregaEstimada,
      fechaEntregaReal: null, // Siempre se envía null
      observaciones: values.observaciones?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Vehículo</Label>
          <Select
            value={values.idVehiculo ? String(values.idVehiculo) : ''}
            onValueChange={(v) => update({ idVehiculo: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {activeVehiculos.map((v) => (
                <SelectItem key={v.idVehiculo} value={String(v.idVehiculo)}>
                  {v.placa} — {v.marca} {v.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.idVehiculo && (
            <p className="text-sm text-destructive">{errors.idVehiculo}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Empleado</Label>
          <Input
            value={empleadoNombre}
            readOnly
            disabled
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground">
            Se toma del usuario autenticado.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Consecutivo</Label>
          <ConsecutivoSelect
            tipo="RECEPCION"
            selectedId={values.idConsecutivo > 0 ? values.idConsecutivo : ''}
            onSelectId={(id) => update({ idConsecutivo: id })}
            onClear={() => update({ idConsecutivo: 5 })}
            error={errors.idConsecutivo}
          />
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Select
            value={values.estado}
            onValueChange={(v) => update({ estado: v as RecepcionEstado })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RecepcionEstado.PENDIENTE}>
                Pendiente
              </SelectItem>
              <SelectItem value={'EN PROCESO' as RecepcionEstado}>
                En Proceso
              </SelectItem>
              <SelectItem value={RecepcionEstado.FINALIZADO}>
                Finalizado
              </SelectItem>
              <SelectItem value={RecepcionEstado.ENTREGADO}>
                Entregado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha de Recepción</Label>
          <Input
            type="date"
            value={values.fechaRecepcion}
            onChange={(e) => update({ fechaRecepcion: e.target.value })}
          />
          {errors.fechaRecepcion && (
            <p className="text-sm text-destructive">{errors.fechaRecepcion}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha de Entrega Estimada</Label>
          <Input
            type="date"
            value={values.fechaEntregaEstimada}
            onChange={(e) => update({ fechaEntregaEstimada: e.target.value })}
          />
          {errors.fechaEntregaEstimada && (
            <p className="text-sm text-destructive">
              {errors.fechaEntregaEstimada}
            </p>
          )}
        </div>

      </div>

      <div className="space-y-2">
        <Label>Observaciones</Label>
        <Textarea
          placeholder="Vehículo con daños menores..."
          value={values.observaciones ?? ''}
          onChange={(e) => update({ observaciones: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
