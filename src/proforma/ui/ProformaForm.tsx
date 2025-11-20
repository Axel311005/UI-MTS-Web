import { useMemo, useState, useEffect } from 'react';
import { ProformaLinesTable, type ProformaLine } from './ProformaLineaTable';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useImpuesto } from '@/impuesto/hook/useImpuesto';
import { ConsecutivoSelect } from '@/shared/components/selects/ConsecutivoSelect';
import { TramiteSeguroSelect } from '@/shared/components/selects/TramiteSeguroSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { sanitizeText, VALIDATION_RULES } from '@/shared/utils/validation';

interface ProformaHeaderValues {
  idTramiteSeguro: number | '';
  idConsecutivo: number | '';
  idMoneda: number | '';
  idImpuesto: number | '' | null;
  observaciones: string;
  fecha?: string;
}

interface ProformaFormProps {
  defaultValues?: Partial<ProformaHeaderValues>;
  defaultLines?: ProformaLine[];
  onSaveHeader: (data: {
    idTramiteSeguro: number;
    idConsecutivo: number; // Requerido
    idMoneda: number;
    idImpuesto?: number | null;
    observaciones?: string;
    fecha?: string; // No se envía en POST, solo en PATCH
  }) => void | Promise<void>;
  onSaveLines: (lines: ProformaLine[]) => void | Promise<void>;
  onCancel: () => void;
  isSavingHeader?: boolean;
  isSavingLines?: boolean;
  proformaId?: number;
  immediatePersist?: boolean;
}

export function ProformaForm({
  defaultValues,
  defaultLines = [],
  onSaveHeader,
  onSaveLines,
  onCancel,
  isSavingHeader,
  isSavingLines,
  proformaId,
  immediatePersist,
}: ProformaFormProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Normalizar valores por defecto para asegurar que sean números o strings vacíos
  const normalizedDefaults = useMemo((): ProformaHeaderValues | undefined => {
    if (!defaultValues) return undefined;
    return {
      idTramiteSeguro:
        defaultValues.idTramiteSeguro &&
        Number(defaultValues.idTramiteSeguro) > 0
          ? Number(defaultValues.idTramiteSeguro)
          : ('' as const),
      idConsecutivo:
        defaultValues.idConsecutivo && Number(defaultValues.idConsecutivo) > 0
          ? Number(defaultValues.idConsecutivo)
          : ('' as const),
      idMoneda:
        defaultValues.idMoneda && Number(defaultValues.idMoneda) > 0
          ? Number(defaultValues.idMoneda)
          : ('' as const),
      idImpuesto:
        defaultValues.idImpuesto === null ||
        defaultValues.idImpuesto === undefined ||
        defaultValues.idImpuesto === ''
          ? ('' as const)
          : Number(defaultValues.idImpuesto),
      observaciones: defaultValues.observaciones ?? '',
      fecha: defaultValues.fecha ?? today,
    };
  }, [defaultValues, today]);

  const [values, setValues] = useState<ProformaHeaderValues>({
    idTramiteSeguro: normalizedDefaults?.idTramiteSeguro ?? '',
    idConsecutivo: normalizedDefaults?.idConsecutivo ?? '',
    idMoneda: normalizedDefaults?.idMoneda ?? '',
    idImpuesto: normalizedDefaults?.idImpuesto ?? '',
    observaciones: normalizedDefaults?.observaciones ?? '',
    fecha: normalizedDefaults?.fecha ?? today,
  });
  const [lines, setLines] = useState<ProformaLine[]>(defaultLines);

  // Actualizar valores cuando cambian los defaults (para edición)
  useEffect(() => {
    if (normalizedDefaults) {
      setValues({
        idTramiteSeguro: normalizedDefaults.idTramiteSeguro,
        idConsecutivo: normalizedDefaults.idConsecutivo,
        idMoneda: normalizedDefaults.idMoneda,
        idImpuesto: normalizedDefaults.idImpuesto,
        observaciones: normalizedDefaults.observaciones,
        fecha: normalizedDefaults.fecha ?? today,
      });
    }
  }, [normalizedDefaults, today]);

  const { monedas } = useMoneda();
  const { impuestos } = useImpuesto();

  const canSaveHeader =
    values.idTramiteSeguro !== '' &&
    values.idConsecutivo !== '' &&
    values.idMoneda !== '' &&
    !isSavingHeader;

  const handleSaveHeader = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (
      values.idTramiteSeguro === '' ||
      values.idConsecutivo === '' ||
      values.idMoneda === ''
    )
      return;
    onSaveHeader({
      idTramiteSeguro: Number(values.idTramiteSeguro),
      idConsecutivo: Number(values.idConsecutivo), // Requerido
      idMoneda: Number(values.idMoneda),
      idImpuesto:
        values.idImpuesto === '' || values.idImpuesto === undefined
          ? undefined
          : Number(values.idImpuesto),
      observaciones: values.observaciones,
      fecha: values.fecha,
    });
  };

  const handleSaveLines = (e?: React.MouseEvent) => {
    e?.preventDefault();
    onSaveLines(lines);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Trámite de Seguro</label>
          <TramiteSeguroSelect
            selectedId={values.idTramiteSeguro || ''}
            onSelectId={(id) =>
              setValues((s) => ({
                ...s,
                idTramiteSeguro: id,
              }))
            }
            onClear={() =>
              setValues((s) => ({
                ...s,
                idTramiteSeguro: '',
              }))
            }
            onlyAprobados={true}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Consecutivo</label>
          <ConsecutivoSelect
            tipo="PROFORMA"
            selectedId={values.idConsecutivo || ''}
            onSelectId={(id) =>
              setValues((s) => ({
                ...s,
                idConsecutivo: id,
              }))
            }
            onClear={() =>
              setValues((s) => ({
                ...s,
                idConsecutivo: '',
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Moneda</label>
          <Select
            value={values.idMoneda === '' ? '' : String(values.idMoneda)}
            onValueChange={(v) =>
              setValues((s) => ({ ...s, idMoneda: v === '' ? '' : Number(v) }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una moneda" />
            </SelectTrigger>
            <SelectContent>
              {(monedas ?? []).map((m: any) => (
                <SelectItem key={m.idMoneda} value={String(m.idMoneda)}>
                  {m.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Impuesto</label>
          <Select
            value={values.idImpuesto === '' ? '' : String(values.idImpuesto)}
            onValueChange={(v) =>
              setValues((s) => ({
                ...s,
                idImpuesto: v === 'none' || v === '' ? '' : Number(v),
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin impuesto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin impuesto</SelectItem>
              {(impuestos ?? []).map((i: any) => (
                <SelectItem key={i.idImpuesto} value={String(i.idImpuesto)}>
                  {i.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha</label>
          <Input
            type="date"
            value={values.fecha ?? ''}
            onChange={(e) =>
              setValues((s) => ({ ...s, fecha: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Observaciones</label>
        <Textarea
          placeholder="Proforma para reparación de daños"
          value={values.observaciones}
          onChange={(e) => {
            const sanitized = sanitizeText(
              e.target.value,
              VALIDATION_RULES.observaciones.min,
              VALIDATION_RULES.observaciones.max,
              false
            );
            setValues((s) => ({ ...s, observaciones: sanitized }));
          }}
          maxLength={VALIDATION_RULES.observaciones.max}
        />
      </div>

      <hr className="my-6" />

      <ProformaLinesTable
        lines={lines}
        onLinesChange={setLines}
        monedaId={values.idMoneda}
        currencyName={
          (monedas ?? []).find((m: any) => m.idMoneda === values.idMoneda)
            ?.descripcion
        }
        proformaId={proformaId}
        immediatePersist={immediatePersist}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSaveHeader}
          disabled={!canSaveHeader}
        >
          {isSavingHeader ? 'Guardando…' : 'Guardar Proforma'}
        </Button>
        <Button
          type="button"
          onClick={handleSaveLines}
          disabled={isSavingLines}
        >
          {isSavingLines ? 'Guardando líneas…' : 'Guardar Líneas'}
        </Button>
      </div>
    </form>
  );
}
