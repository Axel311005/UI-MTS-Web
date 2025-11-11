import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CotizacionEstado } from '@/shared/types/status';
import { useCliente } from '@/clientes/hook/useCliente';
import { EstadoActivo } from '@/shared/types/status';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';

export type CotizacionFormValues = {
  idCliente: number;
  idConsecutivo: number;
  estado: CotizacionEstado;
  nombreCliente?: string;
};

interface CotizacionFormProps {
  defaultValues?: Partial<CotizacionFormValues>;
  onSubmit: (data: CotizacionFormValues) => void;
  onCancel: () => void;
}

export function CotizacionForm({
  defaultValues,
  onSubmit,
  onCancel,
}: CotizacionFormProps) {
  const { clientes } = useCliente({ usePagination: false });

  const activeClientes = useMemo(
    () => (clientes ?? []).filter((c) => c.activo === EstadoActivo.ACTIVO),
    [clientes]
  );

  const [values, setValues] = useState<CotizacionFormValues>({
    idCliente: defaultValues?.idCliente ?? 0,
    idConsecutivo: defaultValues?.idConsecutivo ?? 4, // ID 4 es el consecutivo de cotización
    estado: defaultValues?.estado ?? CotizacionEstado.GENERADA,
    nombreCliente: defaultValues?.nombreCliente ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<CotizacionFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!values.idCliente || values.idCliente <= 0)
      e.idCliente = 'Seleccione un cliente';
    if (!values.idConsecutivo || values.idConsecutivo <= 0)
      e.idConsecutivo = 'Seleccione un consecutivo';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    
    const selectedCliente = activeClientes.find((c) => c.idCliente === values.idCliente);
    
    onSubmit({
      idCliente: Number(values.idCliente),
      idConsecutivo: Number(values.idConsecutivo),
      estado: values.estado,
      nombreCliente: selectedCliente ? getClienteNombre(selectedCliente) : values.nombreCliente,
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
            Consecutivo <span className="text-destructive">*</span>
          </Label>
          <ConsecutivoSelect
            tipo="COTIZACION"
            selectedId={values.idConsecutivo > 0 ? values.idConsecutivo : ''}
            onSelectId={(id) => update({ idConsecutivo: id })}
            onClear={() => update({ idConsecutivo: 4 })}
            error={errors.idConsecutivo}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Estado <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.estado}
            onValueChange={(v) => update({ estado: v as CotizacionEstado })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un estado" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CotizacionEstado).map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.estado && (
            <p className="text-sm text-destructive">{errors.estado}</p>
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

