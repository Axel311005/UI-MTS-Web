import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { useImpuesto } from '@/impuesto/hook/useImpuesto';
import { BodegaSelect } from '@/shared/components/selects/BodegaSelect';
import { RecepcionSelect } from '@/shared/components/selects/RecepcionSelect';

interface InvoiceParamsProps {
  monedaId: number | '';
  onMonedaChange: (value: number | '') => void;
  tipoPagoId: number | '';
  onTipoPagoChange: (value: number | '') => void;
  impuestoId: number | '';
  onImpuestoChange: (value: number | '') => void;
  bodegaId: number | '';
  onBodegaChange: (value: number | '') => void;
  comentario: string;
  onComentarioChange: (value: string) => void;
  descuentoPct: number | '';
  onDescuentoPctChange: (value: number | '') => void;
  recepcionId?: number | '';
  onRecepcionChange?: (value: number | '') => void;
  errors?: {
    moneda?: string;
    tipoPago?: string;
    impuesto?: string;
    bodega?: string;
  };
}

export function FacturaParametros({
  monedaId,
  onMonedaChange,
  tipoPagoId,
  onTipoPagoChange,
  impuestoId,
  onImpuestoChange,
  bodegaId,
  onBodegaChange,
  comentario,
  onComentarioChange,
  descuentoPct,
  onDescuentoPctChange,
  recepcionId,
  onRecepcionChange,
  errors = {},
}: InvoiceParamsProps) {
  const { monedas } = useMoneda();
  const { tipoPagos } = useTipoPago();
  const { impuestos } = useImpuesto();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Moneda */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Moneda <span className="text-destructive">*</span>
        </label>
        <Select
          value={monedaId?.toString() || ''}
          onValueChange={(value) => onMonedaChange(Number(value))}
        >
          <SelectTrigger
            className={cn(errors.moneda && 'border-destructive')}
            aria-label="Seleccionar moneda"
          >
            <SelectValue placeholder="Seleccionar moneda..." />
          </SelectTrigger>
          <SelectContent>
            {(monedas ?? []).map((moneda) => (
              <SelectItem
                key={moneda.idMoneda}
                value={moneda.idMoneda.toString()}
              >
                {moneda.descripcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.moneda && (
          <p className="text-sm text-destructive">{errors.moneda}</p>
        )}
      </div>

      {/* Tipo de Pago */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Tipo de pago <span className="text-destructive">*</span>
        </label>
        <Select
          value={tipoPagoId?.toString() || ''}
          onValueChange={(value) => onTipoPagoChange(Number(value))}
        >
          <SelectTrigger
            className={cn(errors.tipoPago && 'border-destructive')}
            aria-label="Seleccionar tipo de pago"
          >
            <SelectValue placeholder="Seleccionar tipo de pago..." />
          </SelectTrigger>
          <SelectContent>
            {(tipoPagos ?? []).map((tipo) => (
              <SelectItem
                key={tipo.idTipoPago}
                value={tipo.idTipoPago.toString()}
              >
                {tipo.descripcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tipoPago && (
          <p className="text-sm text-destructive">{errors.tipoPago}</p>
        )}
      </div>

      {/* Impuesto */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Impuesto <span className="text-destructive">*</span>
        </label>
        <Select
          value={impuestoId?.toString() || ''}
          onValueChange={(value) => onImpuestoChange(Number(value))}
        >
          <SelectTrigger
            className={cn(errors.impuesto && 'border-destructive')}
            aria-label="Seleccionar impuesto"
          >
            <SelectValue placeholder="Seleccionar impuesto..." />
          </SelectTrigger>
          <SelectContent>
            {(impuestos ?? []).map((impuesto) => (
              <SelectItem
                key={impuesto.idImpuesto}
                value={impuesto.idImpuesto.toString()}
              >
                {impuesto.descripcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.impuesto && (
          <p className="text-sm text-destructive">{errors.impuesto}</p>
        )}
      </div>

      {/* Bodega */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Bodega <span className="text-destructive">*</span>
        </label>
        <BodegaSelect
          selectedId={bodegaId || ''}
          onSelectId={(id) => onBodegaChange(id)}
          onClear={() => onBodegaChange('')}
          error={errors.bodega}
        />
      </div>

      {/* Porcentaje de Descuento */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Descuento (%){' '}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </label>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={descuentoPct}
          onChange={(e) =>
            onDescuentoPctChange(e.target.value ? Number(e.target.value) : '')
          }
          placeholder="0.00"
        />
      </div>

      {/* Recepción (Opcional) */}
      {onRecepcionChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Recepción{' '}
            <span className="text-muted-foreground text-xs">(opcional)</span>
          </label>
          <RecepcionSelect
            selectedId={
              recepcionId !== '' && recepcionId !== undefined ? recepcionId : ''
            }
            onSelectId={(id) => onRecepcionChange(id)}
            onClear={() => onRecepcionChange('')}
          />
        </div>
      )}

      {/* Comentario */}
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium">Comentario</label>
        <Textarea
          value={comentario}
          onChange={(e) => onComentarioChange(e.target.value)}
          placeholder="Agregar comentarios adicionales..."
          className="min-h-[80px]"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {comentario.length}/500 caracteres
        </p>
      </div>
    </div>
  );
}
