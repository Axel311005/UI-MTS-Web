import React, { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { X } from '@/shared/icons';
import { useTramiteSeguro } from '@/tramite-seguro/hook/useTramiteSeguro';
import { TramiteSeguroEstado } from '@/shared/types/status';
import { getClienteNombre, getClienteSearchText } from '@/clientes/utils/cliente.utils';

type Props = {
  selectedId?: number | '';
  onSelectId: (id: number) => void;
  onClear: () => void;
  error?: string;
  onlyAprobados?: boolean; // Si true, solo muestra trámites aprobados
};

export const TramiteSeguroSelect: React.FC<Props> = ({
  selectedId,
  onSelectId,
  onClear,
  error,
  onlyAprobados = true,
}) => {
  const { tramiteSeguros = [] } = useTramiteSeguro({ usePagination: false });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Filtrar solo aprobados si es necesario
  const availableTramites = useMemo(() => {
    if (onlyAprobados) {
      return tramiteSeguros.filter(
        (t) => t.estado === TramiteSeguroEstado.APROBADO
      );
    }
    return tramiteSeguros;
  }, [tramiteSeguros, onlyAprobados]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableTramites;
    return availableTramites.filter(
      (t) =>
        (t.numeroTramite?.toLowerCase?.() ?? '').includes(q) ||
        (t.cliente ? getClienteSearchText(t.cliente) : '').includes(q) ||
        (t.vehiculo?.placa?.toLowerCase?.() ?? '').includes(q) ||
        (t.aseguradora?.descripcion?.toLowerCase?.() ?? '').includes(q)
    );
  }, [availableTramites, query]);

  const selected = useMemo(() => {
    if (selectedId !== undefined && selectedId !== '') {
      return tramiteSeguros.find((t) => t.idTramiteSeguro === selectedId);
    }
    return undefined;
  }, [tramiteSeguros, selectedId]);

  const getEstadoBadge = (estado: TramiteSeguroEstado) => {
    const estadoStr = estado.toString().replace(/_/g, ' ');
    const isAprobado = estado === TramiteSeguroEstado.APROBADO;
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          isAprobado
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}
      >
        {estadoStr}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <div className="flex flex-col flex-1">
            <span className="font-medium leading-tight">
              {selected.numeroTramite}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {selected.cliente ? getClienteNombre(selected.cliente) : '—'} - {selected.vehiculo?.placa}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getEstadoBadge(selected.estado)}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Quitar trámite"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild className="h-9">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between ${
                error ? 'border-destructive' : ''
              }`}
            >
              Seleccionar trámite...
              <span className="ml-2 text-xs text-muted-foreground">▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[400px] p-0">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="Buscar por número, cliente, vehículo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filtered[0];
                    if (first) {
                      onSelectId(first.idTramiteSeguro);
                      setOpen(false);
                    }
                  }
                }}
              />
            </div>
            <ScrollArea className="max-h-60">
              <div className="py-1">
                {filtered.length > 0 ? (
                  filtered.map((t) => {
                    const isAprobado = t.estado === TramiteSeguroEstado.APROBADO;
                    const isDisabled = onlyAprobados && !isAprobado;
                    return (
                      <DropdownMenuItem
                        key={t.idTramiteSeguro}
                        onClick={() => {
                          if (!isDisabled) {
                            onSelectId(t.idTramiteSeguro);
                            setOpen(false);
                          }
                        }}
                        className={`cursor-pointer ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isDisabled}
                      >
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium leading-tight">
                              {t.numeroTramite}
                            </span>
                            {getEstadoBadge(t.estado)}
                          </div>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {t.cliente ? getClienteNombre(t.cliente) : '—'} - {t.vehiculo?.placa} -{' '}
                            {t.aseguradora?.descripcion}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    {onlyAprobados
                      ? 'No se encontraron trámites aprobados.'
                      : 'No se encontraron trámites.'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

