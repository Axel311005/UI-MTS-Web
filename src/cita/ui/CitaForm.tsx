import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CitaEstado } from '@/shared/types/status';
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { EstadoActivo } from '@/shared/types/status';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';
import { useMotivoCita } from '../hook/useMotivoCita';
import { validateFecha, getFechaMinima, getFechaMaxima } from '@/shared/utils/validation';

export type CitaFormValues = {
  idCliente: number;
  idVehiculo: number;
  idMotivoCita: number; // ID del motivo seleccionado
  fechaInicio: string; // datetime-local format
  estado: CitaEstado;
  canal: 'web' | 'telefono' | 'presencial';
};

interface CitaFormProps {
  defaultValues?: Partial<CitaFormValues>;
  onSubmit: (data: CitaFormValues) => void;
  onCancel: () => void;
}

const toDateTimeLocal = (value?: string | Date | null): string => {
  if (!value) return '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (d instanceof Date && !Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  } catch {}
  return '';
};

export function CitaForm({
  defaultValues,
  onSubmit,
  onCancel,
}: CitaFormProps) {
  const { vehiculos } = useVehiculo({ usePagination: false });
  const { motivosCita } = useMotivoCita({ usePagination: false });


  const activeVehiculos = useMemo(
    () => (vehiculos ?? []).filter((v) => v.activo === EstadoActivo.ACTIVO),
    [vehiculos]
  );

  const now = new Date();
  const defaultDateTime = toDateTimeLocal(now) || '';

  const [values, setValues] = useState<CitaFormValues>({
    idCliente: defaultValues?.idCliente ?? 0,
    idVehiculo: defaultValues?.idVehiculo ?? 0,
    idMotivoCita: defaultValues?.idMotivoCita ?? 0,
    fechaInicio: defaultValues?.fechaInicio ?? defaultDateTime,
    estado: defaultValues?.estado ?? CitaEstado.PROGRAMADA,
    canal: defaultValues?.canal ?? 'web',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<CitaFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.idCliente || values.idCliente <= 0)
      e.idCliente = 'Seleccione un cliente';
    if (!values.idVehiculo || values.idVehiculo <= 0)
      e.idVehiculo = 'Seleccione un vehículo';
    if (!values.idMotivoCita || values.idMotivoCita <= 0)
      e.idMotivoCita = 'Seleccione un motivo de cita';
    if (!values.fechaInicio) {
      e.fechaInicio = 'La fecha es requerida';
    } else {
      // Validar fecha con rango (hoy hasta hoy + 1 año)
      const fechaValidation = validateFecha(values.fechaInicio);
      if (!fechaValidation.isValid) {
        e.fechaInicio = fechaValidation.error || 'Fecha inválida';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      idCliente: Number(values.idCliente),
      idVehiculo: Number(values.idVehiculo),
      idMotivoCita: Number(values.idMotivoCita),
      fechaInicio: new Date(values.fechaInicio).toISOString(),
      estado: values.estado,
      canal: values.canal,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            Cliente <span className="text-destructive">*</span>
          </Label>
          <ClienteSelect
            selectedId={values.idCliente > 0 ? values.idCliente : ''}
            onSelectId={(id) => update({ idCliente: id })}
            onClear={() => update({ idCliente: 0 })}
            error={errors.idCliente}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Vehículo <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.idVehiculo > 0 ? String(values.idVehiculo) : ''}
            onValueChange={(v) => update({ idVehiculo: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un vehículo" />
            </SelectTrigger>
            <SelectContent>
              {(activeVehiculos ?? []).map((v) => (
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
          <Label>
            Motivo de Cita <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.idMotivoCita > 0 ? String(values.idMotivoCita) : ''}
            onValueChange={(v) => update({ idMotivoCita: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un motivo de cita" />
            </SelectTrigger>
            <SelectContent>
              {(motivosCita ?? []).map((motivo) => (
                <SelectItem key={motivo.idMotivoCita} value={String(motivo.idMotivoCita)}>
                  {motivo.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.idMotivoCita && (
            <p className="text-sm text-destructive">{errors.idMotivoCita}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Fecha y Hora de Inicio <span className="text-destructive">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={values.fechaInicio}
            onChange={(e) => update({ fechaInicio: e.target.value })}
            min={toDateTimeLocal(getFechaMinima())}
            max={toDateTimeLocal(getFechaMaxima())}
          />
          {errors.fechaInicio && (
            <p className="text-sm text-destructive">{errors.fechaInicio}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Estado <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.estado}
            onValueChange={(v) => update({ estado: v as CitaEstado })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CitaEstado).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.estado && (
            <p className="text-sm text-destructive">{errors.estado}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Canal <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.canal}
            onValueChange={(v) => update({ canal: v as 'web' | 'telefono' | 'presencial' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="telefono">Teléfono</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
            </SelectContent>
          </Select>
          {errors.canal && (
            <p className="text-sm text-destructive">{errors.canal}</p>
          )}
        </div>
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

