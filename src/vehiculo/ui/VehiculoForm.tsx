import { useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  sanitizeString,
  sanitizeNumber,
  validatePlaca,
  validateAnio,
  sanitizeId,
  getRangoAnios,
} from '@/shared/utils/security';
import { COLORES_VEHICULOS } from '../data/colores';
import { MARCAS_VEHICULOS } from '../data/marcas';

type FormValues = {
  idCliente: number | '';
  placa: string;
  motor?: string;
  marca?: string;
  anio?: number | '';
  modelo?: string;
  color?: string;
  numChasis?: string;
};

interface VehiculoFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: {
    idCliente: number;
    placa: string;
    motor?: string;
    marca?: string;
    anio?: number;
    modelo?: string;
    color?: string;
    numChasis?: string;
  }) => void | Promise<void>;
  onCancel?: () => void;
  disableClientSelect?: boolean;
  clientName?: string;
}

export const VehiculoForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  disableClientSelect = false,
  clientName,
}: VehiculoFormProps) => {
  const [values, setValues] = useState<FormValues>({
    idCliente: defaultValues?.idCliente ?? '',
    placa: defaultValues?.placa ?? '',
    motor: defaultValues?.motor ?? '',
    marca: defaultValues?.marca ?? '',
    anio: (defaultValues?.anio as number) ?? '',
    modelo: defaultValues?.modelo ?? '',
    color: defaultValues?.color ?? '',
    numChasis: defaultValues?.numChasis ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    // Validar cliente
    const clienteId = sanitizeId(values.idCliente);
    if (!clienteId || clienteId <= 0) {
      e.idCliente = 'Seleccione un cliente';
    }

    // Validar y sanitizar placa
    if (!values.placa || !values.placa.trim()) {
      e.placa = 'La placa es requerida';
    } else {
      const placaSanitizada = sanitizeString(values.placa.trim(), 20);
      if (!validatePlaca(placaSanitizada)) {
        e.placa = 'La placa tiene un formato inválido';
      }
    }

    // Validar año
    if (values.anio !== '' && !validateAnio(values.anio)) {
      const rango = getRangoAnios();
      e.anio = `Año inválido (debe estar entre ${rango.min} y ${rango.max})`;
    }

    // Validar longitud de campos opcionales (sin validar caracteres repetidos en nombres)
    if (values.motor && values.motor.trim()) {
      if (values.motor.trim().length > 50) {
        e.motor = 'El motor no puede tener más de 50 caracteres';
      }
    }
    if (values.marca && values.marca.trim()) {
      if (values.marca.trim().length > 50) {
        e.marca = 'La marca no puede tener más de 50 caracteres';
      }
    }
    if (values.modelo && values.modelo.trim()) {
      if (values.modelo.trim().length > 50) {
        e.modelo = 'El modelo no puede tener más de 50 caracteres';
      }
    }
    if (values.color && values.color.trim()) {
      if (values.color.trim().length > 30) {
        e.color = 'El color no puede tener más de 30 caracteres';
      }
    }
    if (values.numChasis && values.numChasis.trim()) {
      if (values.numChasis.trim().length > 50) {
        e.numChasis = 'El número de chasis no puede tener más de 50 caracteres';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    let sanitizedValue: string | number = value;

    // Sanitizar según el tipo de campo
    if (field === 'anio') {
      // Permitir escribir cualquier número mientras el usuario escribe
      // La validación del rango se hace en validate() y onBlur
      if (value === '') {
        sanitizedValue = '';
      } else {
        // Solo validar que sea un número, no el rango todavía
        const num = Number(value);
        sanitizedValue = Number.isFinite(num) ? num : '';
      }
    } else if (field === 'idCliente') {
      // El ClienteSelect maneja esto, pero lo validamos aquí también
      sanitizedValue = value;
    } else if (field === 'placa') {
      // Sanitizar placa (máximo 20 caracteres)
      sanitizedValue = sanitizeString(value, 20).toUpperCase();
    } else if (
      field === 'marca' ||
      field === 'modelo' ||
      field === 'motor' ||
      field === 'numChasis'
    ) {
      // Campos de nombres (solo sanitización básica, sin validación de repeticiones)
      sanitizedValue = sanitizeString(value, 50);
    } else if (field === 'color') {
      // Color (solo sanitización básica, sin validación de repeticiones)
      sanitizedValue = sanitizeString(value, 30);
    } else {
      // Otros campos de texto
      sanitizedValue = sanitizeString(value, 100);
    }

    setValues((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    // Sanitizar todos los valores antes de enviar
    const clienteId = sanitizeId(values.idCliente);
    if (!clienteId) {
      setErrors({ idCliente: 'Seleccione un cliente válido' });
      return;
    }

    await onSubmit({
      idCliente: clienteId,
      placa: sanitizeString(values.placa.trim(), 20).toUpperCase(),
      motor: values.motor?.trim()
        ? sanitizeString(values.motor.trim(), 50)
        : undefined,
      marca: values.marca?.trim()
        ? sanitizeString(values.marca.trim(), 50)
        : undefined,
      anio:
        values.anio === ''
          ? undefined
          : sanitizeNumber(
              values.anio,
              getRangoAnios().min,
              getRangoAnios().max
            ),
      modelo: values.modelo?.trim()
        ? sanitizeString(values.modelo.trim(), 50)
        : undefined,
      color: values.color?.trim()
        ? sanitizeString(values.color.trim(), 30)
        : undefined,
      numChasis: values.numChasis?.trim()
        ? sanitizeString(values.numChasis.trim(), 50)
        : undefined,
    });
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label>Cliente</Label>
        {disableClientSelect ? (
          <Input value={clientName ?? ''} readOnly disabled />
        ) : (
          <ClienteSelect
            selectedId={values.idCliente === '' ? '' : Number(values.idCliente)}
            onSelectId={(id) => handleChange('idCliente', String(id))}
            onClear={() => handleChange('idCliente', '')}
            error={errors.idCliente}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Placa</Label>
        <Input
          value={values.placa}
          onChange={(e) => handleChange('placa', e.target.value)}
          placeholder="ABC-123"
          className={errors.placa ? 'border-destructive' : ''}
        />
        {errors.placa && (
          <p className="text-sm text-destructive">{errors.placa}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Marca</Label>
        <Select
          value={values.marca || ''}
          onValueChange={(value) => handleChange('marca', value)}
        >
          <SelectTrigger className={errors.marca ? 'border-destructive' : ''}>
            <SelectValue placeholder="Seleccione una marca" />
          </SelectTrigger>
          <SelectContent>
            {MARCAS_VEHICULOS.map((marca) => (
              <SelectItem key={marca.value} value={marca.value}>
                {marca.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.marca && (
          <p className="text-sm text-destructive">{errors.marca}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Modelo</Label>
        <Input
          value={values.modelo || ''}
          onChange={(e) => handleChange('modelo', e.target.value)}
          placeholder="Corolla, CBR 600..."
        />
        {errors.modelo && (
          <p className="text-sm text-destructive">{errors.modelo}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Año</Label>
        <Input
          type="number"
          value={values.anio === '' ? '' : String(values.anio)}
          onChange={(e) => handleChange('anio', e.target.value)}
          onBlur={(e) => {
            // Validar el rango cuando el usuario termine de escribir
            const value = e.target.value;
            if (value !== '') {
              const rango = getRangoAnios();
              const num = Number(value);
              if (!Number.isFinite(num) || num < rango.min || num > rango.max) {
                setErrors((prev) => ({
                  ...prev,
                  anio: `Año inválido (debe estar entre ${rango.min} y ${rango.max})`,
                }));
              } else {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.anio;
                  return newErrors;
                });
              }
            }
          }}
          placeholder="2020"
          min={1900}
          max={getRangoAnios().max}
        />
        {errors.anio && (
          <p className="text-sm text-destructive">{errors.anio}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <Select
          value={values.color || ''}
          onValueChange={(value) => handleChange('color', value)}
        >
          <SelectTrigger className={errors.color ? 'border-destructive' : ''}>
            <SelectValue placeholder="Seleccione un color" />
          </SelectTrigger>
          <SelectContent>
            {COLORES_VEHICULOS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.color && (
          <p className="text-sm text-destructive">{errors.color}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Motor</Label>
        <Input
          value={values.motor || ''}
          onChange={(e) => handleChange('motor', e.target.value)}
          placeholder="Código de motor"
        />
        {errors.motor && (
          <p className="text-sm text-destructive">{errors.motor}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Chasis</Label>
        <Input
          value={values.numChasis || ''}
          onChange={(e) => handleChange('numChasis', e.target.value)}
          placeholder="Número de chasis"
        />
        {errors.numChasis && (
          <p className="text-sm text-destructive">{errors.numChasis}</p>
        )}
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

export default VehiculoForm;
