import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { X, Search } from '@/shared/icons';
import { MARCAS_VEHICULOS } from '@/vehiculo/data/marcas';
import { useDebounce } from '@/shared/hooks/use-debounce';

type Props = {
  selectedValue?: string;
  onSelectValue?: (value: string) => void;
  onClear: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Para estilos personalizados (ej: landing page)
};

const ITEMS_PER_LOAD = 15; // Cargar 15 elementos a la vez

export const MarcaSelect: React.FC<Props> = ({
  selectedValue,
  onSelectValue,
  onClear,
  error,
  placeholder = 'Seleccione una marca',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_LOAD);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 200);

  // Filtrar marcas basado en la búsqueda (frontend)
  const filtered = useMemo(() => {
    if (!debouncedQuery) {
      return MARCAS_VEHICULOS;
    }
    const queryLower = debouncedQuery.toLowerCase();
    return MARCAS_VEHICULOS.filter(
      (marca) =>
        marca.label.toLowerCase().includes(queryLower) ||
        marca.value.toLowerCase().includes(queryLower)
    );
  }, [debouncedQuery]);

  // Resetear el límite cuando cambia la búsqueda o se abre el dropdown
  useEffect(() => {
    if (open) {
      setDisplayLimit(ITEMS_PER_LOAD);
      setQuery(''); // Limpiar búsqueda al abrir
    }
  }, [open]);

  // Mostrar solo los primeros N elementos
  const displayedMarcas = useMemo(() => {
    return filtered.slice(0, displayLimit);
  }, [filtered, displayLimit]);

  const hasMore = filtered.length > displayLimit;

  // Cargar más elementos al hacer scroll
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom && hasMore) {
      setDisplayLimit((prev) => prev + ITEMS_PER_LOAD);
    }
  };

  // Obtener la marca seleccionada
  const selectedMarca = useMemo(() => {
    if (!selectedValue) return null;
    return MARCAS_VEHICULOS.find((m) => m.value === selectedValue);
  }, [selectedValue]);

  const handleSelect = (value: string) => {
    onSelectValue?.(value);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
    setQuery('');
  };

  return (
    <div className="space-y-1.5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-between h-10 sm:h-11 text-sm sm:text-base ${
              error ? 'border-destructive' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedMarca ? selectedMarca.label : placeholder}
            </span>
            <div className="flex items-center gap-1">
              {selectedValue && !disabled && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
          align="start"
        >
          {/* Barra de búsqueda */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar marca..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setDisplayLimit(ITEMS_PER_LOAD); // Resetear límite al buscar
                }}
                className="pl-8 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de marcas */}
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="max-h-[300px] overflow-y-auto"
          >
            {displayedMarcas.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No se encontraron marcas
              </div>
            ) : (
              displayedMarcas.map((marca) => (
                <DropdownMenuItem
                  key={marca.value}
                  onClick={() => handleSelect(marca.value)}
                  className="cursor-pointer"
                >
                  {marca.label}
                </DropdownMenuItem>
              ))
            )}
            {hasMore && (
              <div className="p-2 text-center text-xs text-muted-foreground">
                Mostrando {displayLimit} de {filtered.length} marcas
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

