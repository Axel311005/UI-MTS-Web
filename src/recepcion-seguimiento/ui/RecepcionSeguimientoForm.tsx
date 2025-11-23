import { useState } from 'react';
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
import { useRecepcion } from '@/recepcion/hook/useRecepcion';
import { RecepcionSeguimientoEstado } from '@/shared/types/status';
import { sanitizeText, validateText, validateFecha, getFechaMinima, getFechaMaxima, VALIDATION_RULES } from '@/shared/utils/validation';

export type RecepcionSeguimientoFormValues = {
  idRecepcion: number;
  fecha: string; // yyyy-MM-dd
  estado: RecepcionSeguimientoEstado;
  descripcion: string;
};

interface RecepcionSeguimientoFormProps {
  defaultValues?: Partial<RecepcionSeguimientoFormValues>;
  onSubmit: (data: RecepcionSeguimientoFormValues) => void;
  onCancel: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export function RecepcionSeguimientoForm({
  defaultValues,
  onSubmit,
  onCancel,
}: RecepcionSeguimientoFormProps) {
  const { recepciones } = useRecepcion({ usePagination: false });

  const [values, setValues] = useState<RecepcionSeguimientoFormValues>({
    idRecepcion: defaultValues?.idRecepcion ?? 0,
    fecha: defaultValues?.fecha ?? today(),
    estado:
      defaultValues?.estado ??
      RecepcionSeguimientoEstado.PENDIENTE_DIAGNOSTICO,
    descripcion: defaultValues?.descripcion ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<RecepcionSeguimientoFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.idRecepcion || values.idRecepcion <= 0)
      e.idRecepcion = 'Seleccione una recepción';
    if (!values.fecha) {
      e.fecha = 'La fecha es requerida';
    } else {
      const fechaValidation = validateFecha(values.fecha);
      if (!fechaValidation.isValid) {
        e.fecha = fechaValidation.error || 'Fecha inválida';
      }
    }
    if (!values.estado) e.estado = 'El estado es requerido';
    if (!values.descripcion?.trim()) {
      e.descripcion = 'La descripción es requerida';
    } else {
      const descripcionValidation = validateText(
        values.descripcion.trim(),
        VALIDATION_RULES.descripcionSeguimiento.min,
        VALIDATION_RULES.descripcionSeguimiento.max,
        false
      );
      if (!descripcionValidation.isValid) {
        e.descripcion = descripcionValidation.error || 'Descripción inválida';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      idRecepcion: Number(values.idRecepcion),
      fecha: values.fecha,
      estado: values.estado,
      descripcion: sanitizeText(
        values.descripcion.trim(),
        VALIDATION_RULES.descripcionSeguimiento.min,
        VALIDATION_RULES.descripcionSeguimiento.max,
        false
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Recepción</Label>
          <Select
            value={values.idRecepcion ? String(values.idRecepcion) : ''}
            onValueChange={(v) => update({ idRecepcion: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una recepción" />
            </SelectTrigger>
            <SelectContent>
              {(recepciones || []).map((r) => (
                <SelectItem key={r.idRecepcion} value={String(r.idRecepcion)}>
                  {r.codigoRecepcion ?? `REC-${r.idRecepcion}`} —{' '}
                  {r.vehiculo?.placa ?? '—'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.idRecepcion && (
            <p className="text-sm text-destructive">{errors.idRecepcion}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={values.fecha}
            onChange={(e) => update({ fecha: e.target.value })}
            min={getFechaMinima().toISOString().split('T')[0]}
            max={getFechaMaxima().toISOString().split('T')[0]}
          />
          {errors.fecha && (
            <p className="text-sm text-destructive">{errors.fecha}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Estado</Label>
          <Select
            value={values.estado}
            onValueChange={(v) =>
              update({ estado: v as RecepcionSeguimientoEstado })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={RecepcionSeguimientoEstado.PENDIENTE_DIAGNOSTICO}
              >
                Pendiente de Diagnóstico
              </SelectItem>
              <SelectItem value={RecepcionSeguimientoEstado.ESPERA_APROBACION}>
                Espera Aprobación
              </SelectItem>
              <SelectItem value={RecepcionSeguimientoEstado.EN_REPARACION}>
                En Reparación
              </SelectItem>
              <SelectItem
                value={RecepcionSeguimientoEstado.EN_ESPERA_REPUESTOS}
              >
                En Espera Repuestos
              </SelectItem>
              <SelectItem value={RecepcionSeguimientoEstado.PRUEBAS}>
                Pruebas
              </SelectItem>
              <SelectItem
                value={RecepcionSeguimientoEstado.LISTO_PARA_ENTREGAR}
              >
                Listo para Entregar
              </SelectItem>
              <SelectItem value={RecepcionSeguimientoEstado.CANCELADO}>
                Cancelado
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.estado && (
            <p className="text-sm text-destructive">{errors.estado}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          placeholder="Se inició el diagnóstico del vehículo..."
          value={values.descripcion}
          onChange={(e) => {
            const sanitized = sanitizeText(
              e.target.value,
              VALIDATION_RULES.descripcionSeguimiento.min,
              VALIDATION_RULES.descripcionSeguimiento.max,
              false
            );
            update({ descripcion: sanitized });
          }}
          rows={4}
          maxLength={VALIDATION_RULES.descripcionSeguimiento.max}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion}</p>
        )}
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

