import { useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';

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
    if (!values.idCliente || Number(values.idCliente) <= 0)
      e.idCliente = 'Seleccione un cliente';
    if (!values.placa || !values.placa.trim())
      e.placa = 'La placa es requerida';
    if (
      values.anio !== '' &&
      (Number(values.anio) < 1900 || Number(values.anio) > 2100)
    )
      e.anio = 'Año inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [field]: field === 'anio' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      idCliente: Number(values.idCliente),
      placa: values.placa.trim(),
      motor: values.motor?.trim() || undefined,
      marca: values.marca?.trim() || undefined,
      anio: values.anio === '' ? undefined : Number(values.anio),
      modelo: values.modelo?.trim() || undefined,
      color: values.color?.trim() || undefined,
      numChasis: values.numChasis?.trim() || undefined,
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
        />
        {errors.placa && (
          <p className="text-sm text-destructive">{errors.placa}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Marca</Label>
        <Input
          value={values.marca || ''}
          onChange={(e) => handleChange('marca', e.target.value)}
          placeholder="Toyota, Honda..."
        />
      </div>

      <div className="space-y-2">
        <Label>Modelo</Label>
        <Input
          value={values.modelo || ''}
          onChange={(e) => handleChange('modelo', e.target.value)}
          placeholder="Corolla, CBR 600..."
        />
      </div>

      <div className="space-y-2">
        <Label>Año</Label>
        <Input
          type="number"
          value={values.anio === '' ? '' : String(values.anio)}
          onChange={(e) => handleChange('anio', e.target.value)}
          placeholder="2020"
        />
        {errors.anio && (
          <p className="text-sm text-destructive">{errors.anio}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <Input
          value={values.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          placeholder="Rojo, Azul..."
        />
      </div>

      <div className="space-y-2">
        <Label>Motor</Label>
        <Input
          value={values.motor || ''}
          onChange={(e) => handleChange('motor', e.target.value)}
          placeholder="Código de motor"
        />
      </div>

      <div className="space-y-2">
        <Label>Chasis</Label>
        <Input
          value={values.numChasis || ''}
          onChange={(e) => handleChange('numChasis', e.target.value)}
          placeholder="Número de chasis"
        />
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
