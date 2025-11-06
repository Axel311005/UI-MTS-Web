import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useMemo, useState } from 'react';
import { useItem } from '@/items/hooks/useItem';
import { useExistenciaBodega } from '@/existencia-bodega/hook/useExistenciaBodega';
import { toast } from 'sonner';
import type { ItemResponse } from '@/items/types/item.response';

type Props = {
  value: number | '';
  onChange: (value: number | '') => void;
  error?: string;
  onItemPick?: (item: ItemResponse) => void;
  bodegaId?: number | '';
  showStock?: boolean; // Si true, muestra stock y deshabilita sin stock
};

export function ItemSelect({
  value,
  onChange,
  error,
  onItemPick,
  bodegaId,
  showStock = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { items } = useItem();
  const { existencias } = useExistenciaBodega();
  const list: ItemResponse[] = Array.isArray(items) ? items : [];

  const stockMap = useMemo(() => {
    if (!showStock) return new Map<string, number>();
    const map = new Map<string, number>();
    const exList = Array.isArray(existencias) ? existencias : [];
    for (const ex of exList) {
      const bId = (ex as any)?.bodega?.idBodega;
      const iId = (ex as any)?.item?.idItem;
      const key = `${bId}-${iId}`;
      const cantidad = Number((ex as any)?.cantDisponible ?? 0) || 0;
      map.set(key, cantidad);
    }
    return map;
  }, [existencias, showStock]);

  // Mapa de stock total por item (suma de todas las bodegas)
  const stockTotalMap = useMemo(() => {
    if (!showStock) return new Map<number, number>();
    const map = new Map<number, number>();
    const exList = Array.isArray(existencias) ? existencias : [];
    for (const ex of exList) {
      const iId = (ex as any)?.item?.idItem;
      if (iId) {
        const cantidad = Number((ex as any)?.cantDisponible ?? 0) || 0;
        const current = map.get(iId) || 0;
        map.set(iId, current + cantidad);
      }
    }
    return map;
  }, [existencias, showStock]);

  const getStock = (itemId?: number) => {
    if (!showStock || !itemId) return undefined;
    const bId = typeof bodegaId === 'number' ? bodegaId : undefined;
    
    // Si hay bodegaId, retornar stock de esa bodega específica
    if (bId !== undefined) {
      const key = `${bId}-${itemId}`;
      return stockMap.get(key) ?? 0;
    }
    
    // Si no hay bodegaId, retornar stock total (suma de todas las bodegas)
    return stockTotalMap.get(itemId) ?? 0;
  };

  const selectedItem = useMemo(() => {
    if (value === '' || value === 0) return undefined;
    return list.find((i) => i.idItem === value);
  }, [list, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((i) =>
      `${i.codigoItem} ${i.descripcion}`.toLowerCase().includes(q)
    );
  }, [list, query]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={list.length === 0}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {selectedItem ? (
              <span className="truncate">
                {selectedItem.codigoItem} - {selectedItem.descripcion}
              </span>
            ) : value === 0 || value === '' ? (
              'Seleccionar item...'
            ) : list.length === 0 ? (
              'Cargando items...'
            ) : (
              'Seleccionar item...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar item..."
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>No se encontraron items.</CommandEmpty>
              <CommandGroup>
                {filtered.map((item) => {
                  const stock = getStock(item.idItem);
                  const zeroStock = showStock && typeof stock === 'number' && stock <= 0;
                  return (
                    <CommandItem
                      key={item.idItem}
                      value={`${item.codigoItem} ${item.descripcion}`}
                      onSelect={() => {
                        if (zeroStock) {
                          toast.warning(
                            'Sin stock disponible para este item en la bodega seleccionada'
                          );
                          return;
                        }
                        onChange(item.idItem);
                        onItemPick?.(item);
                        setOpen(false);
                      }}
                      className={cn(zeroStock && 'opacity-60 cursor-not-allowed')}
                      disabled={zeroStock}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === item.idItem ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{item.codigoItem}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.descripcion}
                        </span>
                      </div>
                      {showStock && typeof stock === 'number' && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full ml-2',
                            stock > 0
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          )}
                        >
                          {stock > 0 ? `Stock: ${stock}` : 'Sin stock'}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

