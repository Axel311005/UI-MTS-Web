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
import { toast } from 'sonner';
import { EmpleadoSelect } from '@/facturas/ui/EmpleadoSelect';
import { useEmpleado } from '@/empleados/hook/useEmpleado';
import { useMemo, useEffect, useState } from 'react';
import { getEmpleadoNombre } from '@/empleados/utils/empleado.utils';

type Props = {
  onClose?: () => void;
};

const EMPLEADO_ID_STORAGE_KEY = 'compra_filters_empleadoId';

export const CompraFilters = ({ onClose }: Props) => {
  const { bodegas } = useBodega();
  const { monedas } = useMoneda();
  const { tipoPagos } = useTipoPago();
  const { empleados } = useEmpleado({ usePagination: false });
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado interno para empleadoId (no se muestra en URL)
  const [empleadoId, setEmpleadoId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(EMPLEADO_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });

  // Sincronizar con sessionStorage cuando cambia y forzar re-render en ComprasPage
  useEffect(() => {
    if (empleadoId && typeof empleadoId === 'number') {
      sessionStorage.setItem(EMPLEADO_ID_STORAGE_KEY, String(empleadoId));
    } else {
      sessionStorage.removeItem(EMPLEADO_ID_STORAGE_KEY);
    }
    // Actualizar un parámetro dummy en la URL para forzar re-render en ComprasPage
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadoId]);

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
      'codigo_compra',
      'estado',
      'anulado',
      'dateFrom',
      'dateTo',
      'minTotal',
      'maxTotal',
      'bodegaNombre',
      'empleadoNombre',
      'tipo_pago',
      'moneda',
      'id_bodega',
      'id_empleado',
      'id_tipo_pago',
      'id_moneda',
      'page',
      'limit',
      'sortBy',
      'sortDir',
    ];
    keys.forEach((k) => sp.delete(k));
    setSearchParams(sp, { replace: true });
    // Limpiar también el ID del sessionStorage
    setEmpleadoId('');
  };

  // nuevos filtros del backend

  const filterKeys: Array<{ key: string; label: string; value: string }> = [
    {
      key: 'codigoLike',
      label: 'Código',
      value: searchParams.get('codigoLike') ?? '',
    },
    {
      key: 'codigoExacto',
      label: 'Código exacto',
      value: searchParams.get('codigo_compra') ?? '',
    },
    { key: 'estado', label: 'Estado', value: searchParams.get('estado') ?? '' },
    {
      key: 'anulado',
      label: 'Anulado',
      value: searchParams.get('anulado') ?? '',
    },
    {
      key: 'bodegaNombre',
      label: 'Bodega',
      value: searchParams.get('bodegaNombre') ?? '',
    },
    {
      key: 'empleadoId',
      label: 'Empleado',
      value: useMemo(() => {
        if (!empleadoId || typeof empleadoId !== 'number' || !empleados) return '';
        const empleado = Array.isArray(empleados)
          ? empleados.find((e) => e.idEmpleado === empleadoId)
          : null;
        return empleado ? getEmpleadoNombre(empleado) : '';
      }, [empleadoId, empleados]),
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
    if (key === 'codigoExacto') {
      sp.delete('codigo_compra');
    } else {
      sp.delete(key);
    }
    // Borrar ids asociados cuando se quita por nombre
    if (key === 'bodegaNombre') sp.delete('id_bodega');
    if (key === 'moneda') sp.delete('id_moneda');
    if (key === 'tipo_pago') sp.delete('id_tipo_pago');
    if (key === 'empleadoId') {
      setEmpleadoId('');
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
          {/* Código compra (exacto) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Código Compra (exacto)
            </label>
            <Input
              key={`codigo_compra:${searchParams.get('codigo_compra') ?? ''}`}
              placeholder="COM-001"
              className="h-9"
              defaultValue={searchParams.get('codigo_compra') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  const sp = new URLSearchParams(searchParams);
                  if (v.trim()) sp.set('codigo_compra', v.trim());
                  else sp.delete('codigo_compra');
                  sp.delete('page');
                  setSearchParams(sp, { replace: true });
                }
              }}
            />
          </div>
          {/* Código compra (parcial) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Código (contiene)
            </label>
            <Input
              key={`codigoLike:${searchParams.get('codigoLike') ?? ''}`}
              placeholder="COM-"
              className="h-9"
              defaultValue={searchParams.get('codigoLike') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  commitParam('codigoLike', v);
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
          {/* Bodega por nombre -> enviar id y nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Bodega
            </label>
            <Select
              key={`bodega:${searchParams.get('id_bodega') ?? ''}`}
              defaultValue={searchParams.get('id_bodega') ?? undefined}
              onValueChange={(v) => {
                const id = v;
                const found = (bodegas ?? []).find(
                  (b) =>
                    String((b as any).idBodega ?? (b as any).id_bodega) ===
                    String(id)
                );
                commitParam('id_bodega', id);
                commitParam('bodegaNombre', (found as any)?.descripcion ?? '');
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue
                  placeholder={searchParams.get('bodegaNombre') ?? 'Todas'}
                />
              </SelectTrigger>
              <SelectContent>
                {(bodegas ?? []).map((b) => {
                  const id = String(
                    (b as any).idBodega ?? (b as any).id_bodega
                  );
                  return (
                    <SelectItem key={id} value={id}>
                      {(b as any).descripcion}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {/* Empleado */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Empleado
            </label>
            <EmpleadoSelect
              selectedId={empleadoId || ''}
              onSelectId={(id) => setEmpleadoId(id)}
              onClear={() => setEmpleadoId('')}
            />
          </div>
          {/* Moneda */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Moneda
            </label>
            <Select
              key={`moneda:${searchParams.get('id_moneda') ?? ''}`}
              defaultValue={searchParams.get('id_moneda') ?? undefined}
              onValueChange={(v) => {
                const id = v;
                const found = (monedas ?? []).find(
                  (m) =>
                    String((m as any).idMoneda ?? (m as any).id_moneda) ===
                    String(id)
                );
                commitParam('id_moneda', id);
                commitParam('moneda', (found as any)?.descripcion ?? '');
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue
                  placeholder={searchParams.get('moneda') ?? 'Todas'}
                />
              </SelectTrigger>
              <SelectContent>
                {(monedas ?? []).map((m) => {
                  const id = String(
                    (m as any).idMoneda ?? (m as any).id_moneda
                  );
                  return (
                    <SelectItem key={id} value={id}>
                      {(m as any).descripcion}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {/* Tipo de Pago */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Tipo de pago
            </label>
            <Select
              key={`tipo_pago:${searchParams.get('id_tipo_pago') ?? ''}`}
              defaultValue={searchParams.get('id_tipo_pago') ?? undefined}
              onValueChange={(v) => {
                const id = v;
                const found = (tipoPagos ?? []).find(
                  (t) =>
                    String((t as any).idTipoPago ?? (t as any).id_tipo_pago) ===
                    String(id)
                );
                commitParam('id_tipo_pago', id);
                commitParam('tipo_pago', (found as any)?.descripcion ?? '');
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue
                  placeholder={searchParams.get('tipo_pago') ?? 'Todos'}
                />
              </SelectTrigger>
              <SelectContent>
                {(tipoPagos ?? []).map((t) => {
                  const id = String(
                    (t as any).idTipoPago ?? (t as any).id_tipo_pago
                  );
                  return (
                    <SelectItem key={id} value={id}>
                      {(t as any).descripcion}
                    </SelectItem>
                  );
                })}
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
              onValueChange={(v) => {
                const hasFrom = (searchParams.get('dateFrom') ?? '').trim();
                const hasTo = (searchParams.get('dateTo') ?? '').trim();
                if (!hasFrom || !hasTo) {
                  toast.info(
                    'Para ordenar, primero seleccione un rango de fechas (Desde y Hasta).'
                  );
                  return;
                }
                commitParam('sortBy', v);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha">Fecha</SelectItem>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="codigo_compra">Código</SelectItem>
                <SelectItem value="bodega">Bodega</SelectItem>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="tipo_pago">Tipo de Pago</SelectItem>
                <SelectItem value="moneda">Moneda</SelectItem>
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
              onValueChange={(v) => {
                const hasFrom = (searchParams.get('dateFrom') ?? '').trim();
                const hasTo = (searchParams.get('dateTo') ?? '').trim();
                if (!hasFrom || !hasTo) {
                  toast.info(
                    'Para ordenar, primero seleccione un rango de fechas (Desde y Hasta).'
                  );
                  return;
                }
                commitParam('sortDir', v);
              }}
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
