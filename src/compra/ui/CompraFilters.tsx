// import { useBodega } from '@/bodega/hook/useBodega';
// import { useMoneda } from '@/moneda/hook/useMoneda';
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
import { Calendar, DollarSign, Filter, X } from '@/shared/icons';
// import { useTipoPago } from '@/tiposPago/hook/useTipoPago';
import { useSearchParams } from 'react-router';

type Props = {
  onClose?: () => void;
};

export const CompraFilters = ({ onClose }: Props) => {
  // referencias removidas porque ya no se filtra por estas entidades
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
      'estado',
      'anulado',
      'dateFrom',
      'dateTo',
      'minTotal',
      'maxTotal',
      'page',
      'limit',
      'sortBy',
      'sortDir',
    ];
    keys.forEach((k) => sp.delete(k));
    setSearchParams(sp, { replace: true });
  };

  // nuevos filtros del backend

  const filterKeys: Array<{ key: string; label: string; value: string }> = [
    { key: 'estado', label: 'Estado', value: searchParams.get('estado') ?? '' },
    {
      key: 'anulado',
      label: 'Anulado',
      value: searchParams.get('anulado') ?? '',
    },
    {
      key: 'dateFrom',
      label: 'Desde',
      value: searchParams.get('dateFrom') ?? '',
    },
    { key: 'dateTo', label: 'Hasta', value: searchParams.get('dateTo') ?? '' },
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
      key: 'sortBy',
      label: 'Ordenar por',
      value: searchParams.get('sortBy') ?? '',
    },
    {
      key: 'sortDir',
      label: 'Dirección',
      value: searchParams.get('sortDir') ?? '',
    },
  ];
  const activeFilters = filterKeys.filter(
    (f) => f.value && f.value.toString().trim() !== ''
  );

  const removeFilter = (key: string) => {
    const sp = new URLSearchParams(searchParams);
    sp.delete(key);
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
                <SelectItem value="COMPLETADA">Completada</SelectItem>
                <SelectItem value="ANULADA">Anulada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Anulado
            </label>
            <Select
              key={`anulado:${searchParams.get('anulado') ?? ''}`}
              defaultValue={searchParams.get('anulado') ?? undefined}
              onValueChange={(v) => commitParam('anulado', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Ordenar por
            </label>
            <Select
              key={`sortBy:${searchParams.get('sortBy') ?? ''}`}
              defaultValue={searchParams.get('sortBy') ?? undefined}
              onValueChange={(v) => commitParam('sortBy', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="FECHA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FECHA">Fecha</SelectItem>
                <SelectItem value="TOTAL">Total</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Dirección
            </label>
            <Select
              key={`sortDir:${searchParams.get('sortDir') ?? ''}`}
              defaultValue={searchParams.get('sortDir') ?? undefined}
              onValueChange={(v) => commitParam('sortDir', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="DESC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ASC">Ascendente</SelectItem>
                <SelectItem value="DESC">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
