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
import { useCliente } from '@/clientes/hook/useCliente';
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { EstadoActivo } from '@/shared/types/status';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';

export type CitaFormValues = {
  idCliente: number;
  idVehiculo: number;
  motivoDescripcion: string; // Descripción del motivo (siempre se crea un nuevo motivo)
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
  const { clientes } = useCliente({ usePagination: false });
  const { vehiculos } = useVehiculo({ usePagination: false });

  const activeClientes = useMemo(
    () => (clientes ?? []).filter((c) => c.activo === EstadoActivo.ACTIVO),
    [clientes]
  );

  const activeVehiculos = useMemo(
    () => (vehiculos ?? []).filter((v) => v.activo === EstadoActivo.ACTIVO),
    [vehiculos]
  );

  const now = new Date();
  const defaultDateTime = toDateTimeLocal(now) || '';

  const [values, setValues] = useState<CitaFormValues>({
    idCliente: defaultValues?.idCliente ?? 0,
    idVehiculo: defaultValues?.idVehiculo ?? 0,
    motivoDescripcion: defaultValues?.motivoDescripcion ?? '',
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
    if (!values.motivoDescripcion || values.motivoDescripcion.trim() === '')
      e.motivoDescripcion = 'La descripción del motivo es requerida';
    if (!values.fechaInicio) e.fechaInicio = 'La fecha es requerida';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      idCliente: Number(values.idCliente),
      idVehiculo: Number(values.idVehiculo),
      motivoDescripcion: values.motivoDescripcion.trim(),
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
          <Input
            placeholder="Ej: Mantenimiento preventivo, Reparación de frenos, etc."
            value={values.motivoDescripcion}
            onChange={(e) => update({ motivoDescripcion: e.target.value })}
          />
          {errors.motivoDescripcion && (
            <p className="text-sm text-destructive">{errors.motivoDescripcion}</p>
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

