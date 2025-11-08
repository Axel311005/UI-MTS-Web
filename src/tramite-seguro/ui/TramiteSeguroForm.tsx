import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useVehiculo } from '@/vehiculo/hook/useVehiculo';
import { useCliente } from '@/clientes/hook/useCliente';
import { useAseguradora } from '@/aseguradora/hook/useAseguradora';
import { EstadoActivo, TramiteSeguroEstado } from '@/shared/types/status';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

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

  const { vehiculos, isLoading: isLoadingVehiculos } = useVehiculo({
    usePagination: false,
  });
  const { clientes, isLoading: isLoadingClientes } = useCliente({
    usePagination: false,
  });
  const { aseguradoras, isLoading: isLoadingAseguradoras } = useAseguradora({
    usePagination: false,
  });

  const activeVehiculos = useMemo(
    () =>
      vehiculos.filter((vehiculo) => vehiculo.activo === EstadoActivo.ACTIVO),
    [vehiculos]
  );

  const activeClientes = useMemo(
    () => clientes.filter((cliente) => cliente.activo === EstadoActivo.ACTIVO),
    [clientes]
  );

  const activeAseguradoras = useMemo(
    () =>
      aseguradoras.filter(
        (aseguradora) => aseguradora.activo === EstadoActivo.ACTIVO
      ),
    [aseguradoras]
  );

  const selectClassName =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const setFieldError = (field: keyof FormValues, message?: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleSelectChange = (
    field: 'idVehiculo' | 'idCliente' | 'idAseguradora',
    rawValue: string
  ) => {
    const nextValue = rawValue === '' ? '' : Number(rawValue);
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) setFieldError(field, undefined);
  };

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
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
    }

    if (!values.fechaInicio) {
      nextErrors.fechaInicio = 'La fecha de inicio es requerida';
    } else if (Number.isNaN(Date.parse(values.fechaInicio))) {
      nextErrors.fechaInicio = 'La fecha de inicio es inválida';
    }

    if (values.fechaFin) {
      if (Number.isNaN(Date.parse(values.fechaFin))) {
        nextErrors.fechaFin = 'La fecha de fin es inválida';
      } else if (
        values.fechaInicio &&
        !Number.isNaN(Date.parse(values.fechaInicio)) &&
        Date.parse(values.fechaFin) < Date.parse(values.fechaInicio)
      ) {
        nextErrors.fechaFin =
          'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

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
          <select
            id="idVehiculo"
            className={selectClassName}
            value={values.idVehiculo === '' ? '' : String(values.idVehiculo)}
            onChange={(event) =>
              handleSelectChange('idVehiculo', event.target.value)
            }
            disabled={isSubmitting || isLoadingVehiculos}
          >
            <option value="">
              {isLoadingVehiculos
                ? 'Cargando vehículos...'
                : 'Seleccione un vehículo'}
            </option>
            {activeVehiculos.map((vehiculo) => (
              <option key={vehiculo.idVehiculo} value={vehiculo.idVehiculo}>
                {vehiculo.placa} · {vehiculo.marca ?? ''}{' '}
                {vehiculo.modelo ?? ''}
              </option>
            ))}
          </select>
          {errors.idVehiculo && (
            <p className="text-sm text-destructive">{errors.idVehiculo}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idCliente">
            Cliente <span className="text-destructive">*</span>
          </Label>
          <select
            id="idCliente"
            className={selectClassName}
            value={values.idCliente === '' ? '' : String(values.idCliente)}
            onChange={(event) =>
              handleSelectChange('idCliente', event.target.value)
            }
            disabled={isSubmitting || isLoadingClientes}
          >
            <option value="">
              {isLoadingClientes
                ? 'Cargando clientes...'
                : 'Seleccione un cliente'}
            </option>
            {activeClientes.map((cliente) => (
              <option key={cliente.idCliente} value={cliente.idCliente}>
                {getClienteNombre(cliente)}
              </option>
            ))}
          </select>
          {errors.idCliente && (
            <p className="text-sm text-destructive">{errors.idCliente}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="idAseguradora">
            Aseguradora <span className="text-destructive">*</span>
          </Label>
          <select
            id="idAseguradora"
            className={selectClassName}
            value={
              values.idAseguradora === '' ? '' : String(values.idAseguradora)
            }
            onChange={(event) =>
              handleSelectChange('idAseguradora', event.target.value)
            }
            disabled={isSubmitting || isLoadingAseguradoras}
          >
            <option value="">
              {isLoadingAseguradoras
                ? 'Cargando aseguradoras...'
                : 'Seleccione una aseguradora'}
            </option>
            {activeAseguradoras.map((aseguradora) => (
              <option
                key={aseguradora.idAseguradora}
                value={aseguradora.idAseguradora}
              >
                {aseguradora.descripcion}
              </option>
            ))}
          </select>
          {errors.idAseguradora && (
            <p className="text-sm text-destructive">{errors.idAseguradora}</p>
          )}
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
            disabled={isSubmitting}
          />
          {errors.numeroTramite && (
            <p className="text-sm text-destructive">{errors.numeroTramite}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <select
            id="estado"
            className={selectClassName}
            value={values.estado}
            onChange={(event) =>
              handleInputChange(
                'estado',
                event.target.value as TramiteSeguroEstado
              )
            }
            disabled={isSubmitting}
          >
            {estadoOptions.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
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
