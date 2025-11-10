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
import { useSearchParams } from 'react-router';
import { ClienteSelect } from '@/facturas/ui/ClienteSelect';
import { VehiculoSelect } from '@/shared/components/selects/VehiculoSelect';
import { AseguradoraSelect } from '@/shared/components/selects/AseguradoraSelect';
import { useCliente } from '@/clientes/hook/useCliente';
import { useMemo, useEffect, useState } from 'react';
import { getClienteNombre } from '@/clientes/utils/cliente.utils';
import { TramiteSeguroEstado } from '@/shared/types/status';

type Props = {
  onClose?: () => void;
};

const CLIENTE_ID_STORAGE_KEY = 'proforma_filters_clienteId';
const ASEGURADORA_ID_STORAGE_KEY = 'proforma_filters_aseguradoraId';
const MONEDA_ID_STORAGE_KEY = 'proforma_filters_monedaId';
const VEHICULO_ID_STORAGE_KEY = 'proforma_filters_vehiculoId';
const TRAMITE_ID_STORAGE_KEY = 'proforma_filters_tramiteId';

export const ProformaFilters = ({ onClose }: Props) => {
  const { monedas } = useMoneda();
  const { clientes } = useCliente({ usePagination: false });
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado interno para IDs (no se muestran en URL)
  const [clienteId, setClienteId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(CLIENTE_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [aseguradoraId, setAseguradoraId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(ASEGURADORA_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [monedaId, setMonedaId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(MONEDA_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [vehiculoId, setVehiculoId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(VEHICULO_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });
  const [tramiteId, setTramiteId] = useState<number | ''>(() => {
    const stored = sessionStorage.getItem(TRAMITE_ID_STORAGE_KEY);
    return stored ? Number(stored) : '';
  });

  // Sincronizar con sessionStorage cuando cambian
  useEffect(() => {
    if (clienteId && typeof clienteId === 'number') {
      sessionStorage.setItem(CLIENTE_ID_STORAGE_KEY, String(clienteId));
    } else {
      sessionStorage.removeItem(CLIENTE_ID_STORAGE_KEY);
    }
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
  }, [clienteId]);

  useEffect(() => {
    if (aseguradoraId && typeof aseguradoraId === 'number') {
      sessionStorage.setItem(ASEGURADORA_ID_STORAGE_KEY, String(aseguradoraId));
    } else {
      sessionStorage.removeItem(ASEGURADORA_ID_STORAGE_KEY);
    }
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
  }, [aseguradoraId]);

  useEffect(() => {
    if (monedaId && typeof monedaId === 'number') {
      sessionStorage.setItem(MONEDA_ID_STORAGE_KEY, String(monedaId));
    } else {
      sessionStorage.removeItem(MONEDA_ID_STORAGE_KEY);
    }
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
  }, [monedaId]);

  useEffect(() => {
    if (vehiculoId && typeof vehiculoId === 'number') {
      sessionStorage.setItem(VEHICULO_ID_STORAGE_KEY, String(vehiculoId));
    } else {
      sessionStorage.removeItem(VEHICULO_ID_STORAGE_KEY);
    }
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
  }, [vehiculoId]);

  useEffect(() => {
    if (tramiteId && typeof tramiteId === 'number') {
      sessionStorage.setItem(TRAMITE_ID_STORAGE_KEY, String(tramiteId));
    } else {
      sessionStorage.removeItem(TRAMITE_ID_STORAGE_KEY);
    }
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('_refresh', Date.now().toString());
      return sp;
    }, { replace: true });
  }, [tramiteId]);

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
    sp.delete('page');
    setSearchParams(sp, { replace: true });
  };

  const clearFilters = () => {
    const sp = new URLSearchParams(searchParams);
    const keys = [
      'codigoLike',
      'codigo_proforma',
      'clienteNombre',
      'aseguradoraNombre',
      'vehiculoPlaca',
      'vehiculoMarca',
      'numeroTramite',
      'moneda',
      'observacionLike',
      'tramiteEstado',
      'hasFactura',
      'dateFrom',
      'dateTo',
      'minTotal',
      'maxTotal',
    ];
    keys.forEach((k) => sp.delete(k));
    setSearchParams(sp, { replace: true });
    setClienteId('');
    setAseguradoraId('');
    setMonedaId('');
    setVehiculoId('');
    setTramiteId('');
  };

  const codigoExactoValue = searchParams.get('codigo_proforma') ?? '';

  // Obtener nombres para mostrar en filtros activos
  const clienteNombreParaMostrar = useMemo(() => {
    if (!clienteId || typeof clienteId !== 'number' || !clientes) return '';
    const cliente = Array.isArray(clientes)
      ? clientes.find((c) => c.idCliente === clienteId)
      : null;
    return cliente ? getClienteNombre(cliente) : '';
  }, [clienteId, clientes]);

  const monedaNombreParaMostrar = useMemo(() => {
    if (!monedaId || typeof monedaId !== 'number' || !monedas) return '';
    const moneda = Array.isArray(monedas)
      ? monedas.find((m) => m.idMoneda === monedaId)
      : null;
    return moneda ? moneda.descripcion : '';
  }, [monedaId, monedas]);

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
      key: 'aseguradoraId',
      label: 'Aseguradora',
      value: searchParams.get('aseguradoraNombre') ?? '',
    },
    {
      key: 'vehiculoId',
      label: 'Vehículo',
      value: searchParams.get('vehiculoPlaca') ?? '',
    },
    {
      key: 'numeroTramite',
      label: 'Número Trámite',
      value: searchParams.get('numeroTramite') ?? '',
    },
    {
      key: 'monedaId',
      label: 'Moneda',
      value: monedaNombreParaMostrar,
    },
    {
      key: 'tramiteEstado',
      label: 'Estado Trámite',
      value: searchParams.get('tramiteEstado') ?? '',
    },
    {
      key: 'hasFactura',
      label: 'Tiene Factura',
      value: searchParams.get('hasFactura') ?? '',
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
      sp.delete('codigo_proforma');
    } else if (key === 'clienteId') {
      setClienteId('');
    } else if (key === 'aseguradoraId') {
      setAseguradoraId('');
    } else if (key === 'vehiculoId') {
      setVehiculoId('');
    } else if (key === 'tramiteId') {
      setTramiteId('');
    } else if (key === 'monedaId') {
      setMonedaId('');
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
          {/* Código proforma (exacto) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Código Proforma (exacto)
            </label>
            <Input
              key={`codigo_proforma:${codigoExactoValue}`}
              placeholder="PRO-001"
              className="h-9"
              defaultValue={codigoExactoValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  const sp = new URLSearchParams(searchParams);
                  if (v.trim()) {
                    sp.set('codigo_proforma', v.trim());
                  } else {
                    sp.delete('codigo_proforma');
                  }
                  sp.delete('page');
                  setSearchParams(sp, { replace: true });
                }
              }}
            />
          </div>
          {/* Código proforma (parcial) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Código (contiene)
            </label>
            <Input
              key={`codigoLike:${searchParams.get('codigoLike') ?? ''}`}
              placeholder="PRO-"
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
          {/* Cliente */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Cliente
            </label>
            <ClienteSelect
              selectedId={clienteId || ''}
              onSelectId={(id) => setClienteId(id)}
              onClear={() => setClienteId('')}
            />
          </div>
          {/* Aseguradora */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Aseguradora
            </label>
            <AseguradoraSelect
              selectedId={aseguradoraId || ''}
              onSelectId={(id) => setAseguradoraId(id)}
              onClear={() => setAseguradoraId('')}
            />
          </div>
          {/* Vehículo */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Vehículo
            </label>
            <VehiculoSelect
              selectedId={vehiculoId || ''}
              onSelectId={(id) => setVehiculoId(id)}
              onClear={() => setVehiculoId('')}
            />
          </div>
          {/* Número Trámite */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Número Trámite
            </label>
            <Input
              key={`numeroTramite:${searchParams.get('numeroTramite') ?? ''}`}
              placeholder="TRAM-001"
              className="h-9"
              defaultValue={searchParams.get('numeroTramite') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  commitParam('numeroTramite', v);
                }
              }}
            />
          </div>
          {/* Moneda */}
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
          {/* Estado Trámite */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Estado Trámite
            </label>
            <Select
              key={`tramiteEstado:${searchParams.get('tramiteEstado') ?? ''}`}
              defaultValue={searchParams.get('tramiteEstado') ?? undefined}
              onValueChange={(v) => commitParam('tramiteEstado', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TramiteSeguroEstado.INICIADO}>Iniciado</SelectItem>
                <SelectItem value={TramiteSeguroEstado.EN_REVISION}>En Revisión</SelectItem>
                <SelectItem value={TramiteSeguroEstado.APROBADO}>Aprobado</SelectItem>
                <SelectItem value={TramiteSeguroEstado.RECHAZADO}>Rechazado</SelectItem>
                <SelectItem value={TramiteSeguroEstado.CERRADO}>Cerrado</SelectItem>
                <SelectItem value={TramiteSeguroEstado.PENDIENTE_DE_PAGO}>Pendiente de Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Tiene Factura */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Tiene Factura
            </label>
            <Select
              key={`hasFactura:${searchParams.get('hasFactura') ?? ''}`}
              defaultValue={searchParams.get('hasFactura') ?? undefined}
              onValueChange={(v) => commitParam('hasFactura', v)}
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
          {/* Observaciones */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Observaciones (contiene)
            </label>
            <Input
              key={`observacionLike:${searchParams.get('observacionLike') ?? ''}`}
              placeholder="Buscar en observaciones..."
              className="h-9"
              defaultValue={searchParams.get('observacionLike') ?? ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  const v = (e.target as HTMLInputElement).value;
                  commitParam('observacionLike', v);
                }
              }}
            />
          </div>
          {/* Fechas */}
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
          {/* Montos */}
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

