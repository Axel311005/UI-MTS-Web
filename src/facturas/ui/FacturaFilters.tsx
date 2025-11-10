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
import { EmpleadoSelect } from './EmpleadoSelect';
import { useCliente } from '@/clientes/hook/useCliente';
import { useEmpleado } from '@/empleados/hook/useEmpleado';
import { useMemo, useEffect, useState } from 'react';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import { getEmpleadoNombre } from '@/empleados/utils/empleado.utils';

type Props = {
  onClose?: () => void;
};
const CLIENTE_ID_STORAGE_KEY = 'factura_filters_clienteId';
const EMPLEADO_ID_STORAGE_KEY = 'factura_filters_empleadoId';
const MONEDA_ID_STORAGE_KEY = 'factura_filters_monedaId';
const TIPO_PAGO_ID_STORAGE_KEY = 'factura_filters_tipoPagoId';

export const FacturaFilters = ({ onClose }: Props) => {
  const { bodegas } = useBodega();
  const { monedas } = useMoneda();
  const { tipoPagos } = useTipoPago();
  const { clientes } = useCliente({ usePagination: false });
  const { empleados } = useEmpleado({ usePagination: false });
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado interno para IDs (no se muestran en URL)
  const [clienteId, setClienteId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(CLIENTE_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [empleadoId, setEmpleadoId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(EMPLEADO_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [monedaId, setMonedaId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(MONEDA_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [tipoPagoId, setTipoPagoId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(TIPO_PAGO_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });

  // Sincronizar con sessionStorage cuando cambian y forzar re-render en FacturasPage
  useEffect(() => {
    if (clienteId && typeof clienteId === 'number') {
      sessionStorage.setItem(CLIENTE_ID_STORAGE_KEY, String(clienteId));
    } else {
      sessionStorage.removeItem(CLIENTE_ID_STORAGE_KEY);
    }
    // Actualizar un parámetro dummy en la URL para forzar re-render en FacturasPage
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  useEffect(() => {
    if (empleadoId && typeof empleadoId === 'number') {
      sessionStorage.setItem(EMPLEADO_ID_STORAGE_KEY, String(empleadoId));
    } else {
      sessionStorage.removeItem(EMPLEADO_ID_STORAGE_KEY);
    }
    // Actualizar un parámetro dummy en la URL para forzar re-render en FacturasPage
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadoId]);

  useEffect(() => {
    if (monedaId && typeof monedaId === 'number') {
      sessionStorage.setItem(MONEDA_ID_STORAGE_KEY, String(monedaId));
    } else {
      sessionStorage.removeItem(MONEDA_ID_STORAGE_KEY);
    }
    // Actualizar un parámetro dummy en la URL para forzar re-render en FacturasPage
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monedaId]);

  useEffect(() => {
    if (tipoPagoId && typeof tipoPagoId === 'number') {
      sessionStorage.setItem(TIPO_PAGO_ID_STORAGE_KEY, String(tipoPagoId));
    } else {
      sessionStorage.removeItem(TIPO_PAGO_ID_STORAGE_KEY);
    }
    // Actualizar un parámetro dummy en la URL para forzar re-render en FacturasPage
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoPagoId]);

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
    // Limpiar también los IDs del sessionStorage
    setClienteId('');
    setEmpleadoId('');
    setMonedaId('');
    setTipoPagoId('');
  };

  const codigoExactoValue = searchParams.get('codigo_factura') ?? '';

  // Obtener el nombre del cliente desde el ID para mostrarlo en los filtros activos
  const clienteNombreParaMostrar = useMemo(() => {
    if (!clienteId || typeof clienteId !== 'number' || !clientes) return '';
    const cliente = Array.isArray(clientes)
      ? clientes.find((c) => c.idCliente === clienteId)
      : null;
    return cliente ? getClienteNombre(cliente) : '';
  }, [clienteId, clientes]);

  // Obtener el nombre del empleado desde el ID para mostrarlo en los filtros activos
  const empleadoNombreParaMostrar = useMemo(() => {
    if (!empleadoId || typeof empleadoId !== 'number' || !empleados) return '';
    const empleado = Array.isArray(empleados)
      ? empleados.find((e) => e.idEmpleado === empleadoId)
      : null;
    return empleado ? getEmpleadoNombre(empleado) : '';
  }, [empleadoId, empleados]);

  // Obtener el nombre de la moneda desde el ID para mostrarlo en los filtros activos
  const monedaNombreParaMostrar = useMemo(() => {
    if (!monedaId || typeof monedaId !== 'number' || !monedas) return '';
    const moneda = Array.isArray(monedas)
      ? monedas.find((m) => m.idMoneda === monedaId)
      : null;
    return moneda ? moneda.descripcion : '';
  }, [monedaId, monedas]);

  // Obtener el nombre del tipo de pago desde el ID para mostrarlo en los filtros activos
  const tipoPagoNombreParaMostrar = useMemo(() => {
    if (!tipoPagoId || typeof tipoPagoId !== 'number' || !tipoPagos) return '';
    const tipoPago = Array.isArray(tipoPagos)
      ? tipoPagos.find((tp) => tp.idTipoPago === tipoPagoId)
      : null;
    return tipoPago ? tipoPago.descripcion : '';
  }, [tipoPagoId, tipoPagos]);

  const filterKeys: Array<{ key: string; label: string; value: string }> = [
    {
      key: 'codigoLike',
      label: 'Código',
      value: searchParams.get('codigoLike') ?? '',
    },
    { key: 'codigoExacto', label: 'Código exacto', value: codigoExactoValue },
    {
      key: 'clienteId',
      label: 'Cliente',
      value: clienteNombreParaMostrar,
    },
    {
      key: 'empleadoId',
      label: 'Empleado',
      value: empleadoNombreParaMostrar,
    },
    { key: 'estado', label: 'Estado', value: searchParams.get('estado') ?? '' },
    {
      key: 'bodegaNombre',
      label: 'Bodega',
      value: searchParams.get('bodegaNombre') ?? '',
    },
    {
      key: 'monedaId',
      label: 'Moneda',
      value: monedaNombreParaMostrar,
    },
    {
      key: 'tipoPagoId',
      label: 'Tipo de Pago',
      value: tipoPagoNombreParaMostrar,
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
  ];
  const activeFilters = filterKeys.filter(
    (f) => f.value && f.value.toString().trim() !== ''
  );

  const removeFilter = (key: string) => {
    const sp = new URLSearchParams(searchParams);
    if (key === 'codigoExacto') {
      sp.delete('codigo_factura');
    } else if (key === 'clienteId') {
      setClienteId('');
    } else if (key === 'empleadoId') {
      setEmpleadoId('');
    } else if (key === 'monedaId') {
      setMonedaId('');
    } else if (key === 'tipoPagoId') {
      setTipoPagoId('');
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
              <FileText className="h-3 w-3" /> Cliente
            </label>
            <ClienteSelect
              selectedId={clienteId || ''}
              onSelectId={(id) => setClienteId(id)}
              onClear={() => setClienteId('')}
            />
          </div>
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
                <SelectItem value="PAGADO">Pagado</SelectItem>
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
            <div className="flex gap-2">
              <Select
                key={`moneda:${monedaId || ''}`}
                value={monedaId ? monedaId.toString() : undefined}
                onValueChange={(v) => setMonedaId(v ? Number(v) : '')}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {monedas?.map((moneda) => (
                    <SelectItem
                      key={moneda.idMoneda.toString()}
                      value={moneda.idMoneda.toString()}
                    >
                      {moneda.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {monedaId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMonedaId('')}
                  aria-label="Limpiar moneda"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Tipo de pago
            </label>
            <div className="flex gap-2">
              <Select
                key={`tipo_pago:${tipoPagoId || ''}`}
                value={tipoPagoId ? tipoPagoId.toString() : undefined}
                onValueChange={(v) => setTipoPagoId(v ? Number(v) : '')}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {tipoPagos?.map((tipoPago) => (
                    <SelectItem
                      key={tipoPago.idTipoPago.toString()}
                      value={tipoPago.idTipoPago.toString()}
                    >
                      {tipoPago.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tipoPagoId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setTipoPagoId('')}
                  aria-label="Limpiar tipo de pago"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
