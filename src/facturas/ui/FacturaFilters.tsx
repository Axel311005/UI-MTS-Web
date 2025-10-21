import { useBodega } from '@/bodega/hook/useBodega';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Calendar, DollarSign, FileText, Filter, X } from '@/shared/icons';
import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { useSearchParams } from 'react-router';
import { ClienteSelect } from './ClienteSelect';

type Props = {
  onClose?: () => void;
};
export const FacturaFilters = ({ onClose }: Props) => {
  const { bodegas } = useBodega();
  const { monedas } = useMoneda();
  const { tipoPagos } = useTipoPago();
  const [searchParams, setSearchParams] = useSearchParams();

  const commitParam = (key: string, value?: string | number | null) => {
    const sp = new URLSearchParams(searchParams);
    const str =
      typeof value === 'number'
        ? String(value)
        : (value ?? '').toString().trim();
    if (!str) {
      sp.delete(key);
    } else {
      sp.set(key, str);
    }
    setSearchParams(sp, { replace: true });
  };

  const clearFilters = () => {
    const sp = new URLSearchParams(searchParams);
    const keys = [
      'codigoLike',
      'codigo_factura',
      'clienteNombre',
      'empleadoNombre',
      'estado',
      'bodegaNombre',
      'dateFrom',
      'dateTo',
      'minTotal',
      'maxTotal',
      'moneda',
      'tipo_pago',
    ];
    keys.forEach((k) => sp.delete(k));
    setSearchParams(sp, { replace: true });
  };

  const codigoExactoValue = searchParams.get('codigo_factura') ?? '';
  const nombreClienteValue = searchParams.get('clienteNombre') ?? '';
  const nombreEmpleadoValue = searchParams.get('empleadoNombre') ?? '';

  const filterKeys: Array<{ key: string; label: string; value: string }> = [
    {
      key: 'codigoLike',
      label: 'Código',
      value: searchParams.get('codigoLike') ?? '',
    },
    { key: 'codigoExacto', label: 'Código exacto', value: codigoExactoValue },
    {
      key: 'clienteNombre',
      label: 'Cliente',
      value: nombreClienteValue,
    },
    {
      key: 'empleadoNombre',
      label: 'Empleado',
      value: nombreEmpleadoValue,
    },
    { key: 'estado', label: 'Estado', value: searchParams.get('estado') ?? '' },
    {
      key: 'bodegaNombre',
      label: 'Bodega',
      value: searchParams.get('bodegaNombre') ?? '',
    },
    {
      key: 'dateFrom',
      label: 'Desde',
      value: searchParams.get('dateFrom') ?? '',
    },
    {
      key: 'dateTo',
      label: 'Hasta',
      value: searchParams.get('dateTo') ?? '',
    },
    {
      key: 'minTotal',
      label: 'Monto mínimo',
      value: searchParams.get('minTotal') ?? '',
    },
    {
      key: 'maxTotal',
      label: 'Monto máximo',
      value: searchParams.get('maxTotal') ?? '',
    },
    {
      key: 'moneda',
      label: 'Moneda',
      value: searchParams.get('moneda') ?? '',
    },
    {
      key: 'tipo_pago',
      label: 'Tipo de Pago',
      value: searchParams.get('tipo_pago') ?? '',
    },
  ];
  const activeFilters = filterKeys.filter(
    (f) => f.value && f.value.toString().trim() !== ''
  );

  const removeFilter = (key: string) => {
    const sp = new URLSearchParams(searchParams);
    if (key === 'codigoExacto') {
      sp.delete('codigo_factura');
    } else {
      sp.delete(key);
    }
    sp.delete('page');
    setSearchParams(sp, { replace: true });
  };

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 justify-between">
          <Filter className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Filtros</CardTitle>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Limpiar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Cerrar filtros"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex items-center flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
              >
                <span className="font-medium">{f.label}:</span>
                <span>{f.value}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${f.label}`}
                  className="ml-1 rounded hover:bg-background/60 p-0.5"
                  onClick={() => removeFilter(f.key)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Código Factura
            </label>
            <Input
              key={`codigo_factura:${codigoExactoValue}`}
              placeholder="FAC-001"
              className="h-9"
              defaultValue={codigoExactoValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  // Normalizar a snake_case para backend y eliminar camelCase
                  const sp = new URLSearchParams(searchParams);
                  if (v.trim()) {
                    sp.set('codigo_factura', v.trim());
                  } else {
                    sp.delete('codigo_factura');
                  }
                  setSearchParams(sp, { replace: true });
                }
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Nombre del Cliente
            </label>
            <ClienteSelect
              value={nombreClienteValue}
              onSelect={(nombre) => commitParam('clienteNombre', nombre)}
              onClear={() => commitParam('clienteNombre', '')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Nombre del Empleado
            </label>
            <Input
              key={`empleadoNombre:${nombreEmpleadoValue}`}
              placeholder="Nombre del Empleado"
              className="h-9"
              defaultValue={nombreEmpleadoValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  commitParam('empleadoNombre', v);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Estado
            </label>
            <Select
              key={`estado:${searchParams.get('estado') ?? ''}`}
              defaultValue={searchParams.get('estado') ?? undefined}
              onValueChange={(v) => commitParam('estado', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="PAGADA">Pagada</SelectItem>
                <SelectItem value="VENCIDA">Vencida</SelectItem>
                <SelectItem value="ANULADA">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Bodega
            </label>
            <Select
              key={`bodegaNombre:${searchParams.get('bodegaNombre') ?? ''}`}
              defaultValue={searchParams.get('bodegaNombre') ?? undefined}
              onValueChange={(v) => commitParam('bodegaNombre', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {bodegas?.map((bodega) => (
                  <SelectItem
                    key={bodega.idBodega.toString()}
                    value={bodega.descripcion}
                  >
                    {bodega.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Moneda
            </label>
            <Select
              key={`moneda:${searchParams.get('moneda') ?? ''}`}
              defaultValue={searchParams.get('moneda') ?? undefined}
              onValueChange={(v) => commitParam('moneda', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {monedas?.map((moneda) => (
                  <SelectItem
                    key={moneda.idMoneda.toString()}
                    value={moneda.descripcion}
                  >
                    {moneda.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Tipo de pago
            </label>
            <Select
              key={`tipo_pago:${searchParams.get('tipo_pago') ?? ''}`}
              defaultValue={searchParams.get('tipo_pago') ?? undefined}
              onValueChange={(v) => commitParam('tipo_pago', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {tipoPagos?.map((tipoPago) => (
                  <SelectItem
                    key={tipoPago.idTipoPago.toString()}
                    value={tipoPago.descripcion}
                  >
                    {tipoPago.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(['dateFrom', 'dateTo'] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />{' '}
                {key === 'dateFrom' ? 'Fecha Desde' : 'Fecha Hasta'}
              </label>
              <Input
                key={`${key}:${searchParams.get(key) ?? ''}`}
                type="date"
                className="h-9"
                placeholder="dd/mm/aaaa"
                defaultValue={searchParams.get(key) ?? ''}
                onChange={(e) =>
                  commitParam(key, (e.target as HTMLInputElement).value)
                }
              />
            </div>
          ))}
          {(['minTotal', 'maxTotal'] as const).map((key) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />{' '}
                {key === 'minTotal' ? 'Monto Mínimo' : 'Monto Máximo'}
              </label>
              <Input
                key={`${key}:${searchParams.get(key) ?? ''}`}
                type="number"
                className="h-9"
                placeholder={key === 'minTotal' ? '0.00' : '999999.99'}
                defaultValue={searchParams.get(key) ?? ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const raw = (e.target as HTMLInputElement).value;
                    const num = raw === '' ? '' : Number(raw);
                    commitParam(
                      key,
                      Number.isFinite(num as number) ? (num as number) : ''
                    );
                  }
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
