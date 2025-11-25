import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { TramiteSeguroEstado } from '@/shared/types/status';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';
import { VehiculoSelect } from '@/shared/components/selects/VehiculoSelect';
import { AseguradoraSelect } from '@/shared/components/selects/AseguradoraSelect';
import {
  sanitizeText,
  validateText,
  validateFecha,
  validateFechaRango,
  validateLength,
  VALIDATION_RULES,
} from '@/shared/utils/validation';
import { sanitizeString } from '@/shared/utils/security';

type FormValues = {
  idVehiculo: number | '';
  idCliente: number | '';
  idAseguradora: number | '';
  numeroTramite: string;
  estado: TramiteSeguroEstado;
  fechaInicio: string;
  fechaFin: string;
  observaciones: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

interface TramiteSeguroFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: {
    idVehiculo: number;
    idCliente: number;
    idAseguradora: number;
    numeroTramite: string;
    estado: TramiteSeguroEstado;
    fechaInicio: string;
    fechaFin?: string;
    observaciones?: string;
  }) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const toInputDate = (value?: string | Date | null): string => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return '';
};

export function TramiteSeguroForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TramiteSeguroFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [values, setValues] = useState<FormValues>({
    idVehiculo: defaultValues?.idVehiculo ?? '',
    idCliente: defaultValues?.idCliente ?? '',
    idAseguradora: defaultValues?.idAseguradora ?? '',
    numeroTramite: defaultValues?.numeroTramite ?? '',
    estado: defaultValues?.estado ?? TramiteSeguroEstado.INICIADO,
    fechaInicio: toInputDate(defaultValues?.fechaInicio) || today,
    fechaFin: toInputDate(defaultValues?.fechaFin) || '',
    observaciones: defaultValues?.observaciones ?? '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldError = (field: keyof FormValues, message?: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleInputChange = (field: keyof FormValues, value: string) => {
    let sanitizedValue = value;
    
    // Sanitizar observaciones
    if (field === 'observaciones') {
      sanitizedValue = sanitizeText(
        value,
        VALIDATION_RULES.observaciones.min,
        VALIDATION_RULES.observaciones.max,
        false // No permitir 3 caracteres repetidos
      );
    } else if (field === 'numeroTramite') {
      // Sanitizar número de trámite
      sanitizedValue = sanitizeString(value, VALIDATION_RULES.numeroTramite.max);
    }
    
    setValues((prev) => ({ ...prev, [field]: sanitizedValue }));
    if (errors[field]) setFieldError(field, undefined);
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.idVehiculo || Number(values.idVehiculo) <= 0) {
      nextErrors.idVehiculo = 'Seleccione un vehículo';
    }

    if (!values.idCliente || Number(values.idCliente) <= 0) {
      nextErrors.idCliente = 'Seleccione un cliente';
    }

    if (!values.idAseguradora || Number(values.idAseguradora) <= 0) {
      nextErrors.idAseguradora = 'Seleccione una aseguradora';
    }

    if (!values.numeroTramite.trim()) {
      nextErrors.numeroTramite = 'El número de trámite es requerido';
    } else {
      const numeroTramiteValidation = validateLength(
        values.numeroTramite.trim(),
        VALIDATION_RULES.numeroTramite.min,
        VALIDATION_RULES.numeroTramite.max
      );
      if (!numeroTramiteValidation.isValid) {
        nextErrors.numeroTramite = numeroTramiteValidation.error || 'Número de trámite inválido';
      }
    }

    // Validar fecha de inicio
    if (!values.fechaInicio) {
      nextErrors.fechaInicio = 'La fecha de inicio es requerida';
    } else {
      const fechaInicioValidation = validateFecha(
        values.fechaInicio,
        VALIDATION_RULES.fechaMinima,
        VALIDATION_RULES.fechaMaxima
      );
      if (!fechaInicioValidation.isValid) {
        nextErrors.fechaInicio = fechaInicioValidation.error || 'Fecha de inicio inválida';
      }
    }

    // Validar fecha de fin
    if (values.fechaFin) {
      const fechaFinValidation = validateFecha(
        values.fechaFin,
        VALIDATION_RULES.fechaMinima,
        VALIDATION_RULES.fechaMaxima
      );
      if (!fechaFinValidation.isValid) {
        nextErrors.fechaFin = fechaFinValidation.error || 'Fecha de fin inválida';
      } else if (values.fechaInicio) {
        const rangoValidation = validateFechaRango(values.fechaInicio, values.fechaFin);
        if (!rangoValidation.isValid) {
          nextErrors.fechaFin = rangoValidation.error || 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
      }
    }
    
    // Validar observaciones
    if (values.observaciones.trim()) {
      const observacionesValidation = validateText(
        values.observaciones.trim(),
        VALIDATION_RULES.observaciones.min,
        VALIDATION_RULES.observaciones.max,
        false
      );
      if (!observacionesValidation.isValid) {
        nextErrors.observaciones = observacionesValidation.error;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    // Valores ya sanitizados en tiempo real (handleInputChange)
    await onSubmit({
      idVehiculo: Number(values.idVehiculo),
      idCliente: Number(values.idCliente),
      idAseguradora: Number(values.idAseguradora),
      numeroTramite: values.numeroTramite.trim(),
      estado: values.estado,
      fechaInicio: values.fechaInicio,
      fechaFin: values.fechaFin ? values.fechaFin : undefined,
      observaciones: values.observaciones.trim()
        ? values.observaciones.trim()
        : undefined,
    });
  };

  const estadoOptions = Object.values(TramiteSeguroEstado);

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="idVehiculo">
            Vehículo <span className="text-destructive">*</span>
          </Label>
          <VehiculoSelect
            selectedId={values.idVehiculo === '' ? '' : Number(values.idVehiculo)}
            onSelectId={(id) => {
              setValues((prev) => ({ ...prev, idVehiculo: id }));
              if (errors.idVehiculo) setFieldError('idVehiculo', undefined);
            }}
            onClear={() => {
              setValues((prev) => ({ ...prev, idVehiculo: '' }));
              if (errors.idVehiculo) setFieldError('idVehiculo', undefined);
            }}
            error={errors.idVehiculo}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idCliente">
            Cliente <span className="text-destructive">*</span>
          </Label>
          <ClienteSelect
            selectedId={values.idCliente === '' ? '' : Number(values.idCliente)}
            onSelectId={(id) => {
              setValues((prev) => ({ ...prev, idCliente: id }));
              if (errors.idCliente) setFieldError('idCliente', undefined);
            }}
            onClear={() => {
              setValues((prev) => ({ ...prev, idCliente: '' }));
              if (errors.idCliente) setFieldError('idCliente', undefined);
            }}
            error={errors.idCliente}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idAseguradora">
            Aseguradora <span className="text-destructive">*</span>
          </Label>
          <AseguradoraSelect
            selectedId={values.idAseguradora === '' ? '' : Number(values.idAseguradora)}
            onSelectId={(id) => {
              setValues((prev) => ({ ...prev, idAseguradora: id }));
              if (errors.idAseguradora) setFieldError('idAseguradora', undefined);
            }}
            onClear={() => {
              setValues((prev) => ({ ...prev, idAseguradora: '' }));
              if (errors.idAseguradora) setFieldError('idAseguradora', undefined);
            }}
            error={errors.idAseguradora}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroTramite">
            Número de trámite <span className="text-destructive">*</span>
          </Label>
          <Input
            id="numeroTramite"
            value={values.numeroTramite}
            onChange={(event) =>
              handleInputChange('numeroTramite', event.target.value)
            }
            placeholder="TRAM-2024-001"
            maxLength={VALIDATION_RULES.numeroTramite.max}
            disabled={isSubmitting}
          />
          {errors.numeroTramite && (
            <p className="text-sm text-destructive">{errors.numeroTramite}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={values.estado}
            onValueChange={(value) =>
              handleInputChange('estado', value as TramiteSeguroEstado)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger id="estado">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {estadoOptions.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaInicio">
            Fecha de inicio <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fechaInicio"
            type="date"
            value={values.fechaInicio}
            onChange={(event) =>
              handleInputChange('fechaInicio', event.target.value)
            }
            disabled={isSubmitting}
          />
          {errors.fechaInicio && (
            <p className="text-sm text-destructive">{errors.fechaInicio}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha de fin</Label>
          <Input
            id="fechaFin"
            type="date"
            value={values.fechaFin}
            onChange={(event) =>
              handleInputChange('fechaFin', event.target.value)
            }
            disabled={isSubmitting}
          />
          {errors.fechaFin && (
            <p className="text-sm text-destructive">{errors.fechaFin}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={values.observaciones}
          onChange={(event) =>
            handleInputChange('observaciones', event.target.value)
          }
          placeholder="Trámite iniciado por siniestro"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
