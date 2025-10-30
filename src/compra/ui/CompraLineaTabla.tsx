import { Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
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
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useMemo, useState } from 'react';

interface CompraLine {
  itemId: number | '';
  cantidad: number | '';
  precioUnitario: number | '';
  totalLinea: number;
}

interface CompraLineaTablaProps {
  lines: CompraLine[];
  onLinesChange: (lines: CompraLine[]) => void;
  monedaId?: number | '';
  errors?: Array<{
    cantidad?: string;
    precioUnitario?: string;
    item?: string;
  }>;
}

// Mock items data
const mockItems = [
  {
    idItem: 1,
    codigoItem: 'ITEM-001',
    descripcion: 'Producto A',
    precioBaseDolar: '10.00',
    precioBaseLocal: '365.00',
  },
  {
    idItem: 2,
    codigoItem: 'ITEM-002',
    descripcion: 'Producto B',
    precioBaseDolar: '25.50',
    precioBaseLocal: '930.75',
  },
  {
    idItem: 3,
    codigoItem: 'ITEM-003',
    descripcion: 'Producto C',
    precioBaseDolar: '100.00',
    precioBaseLocal: '3650.00',
  },
];

export function CompraLineaTabla({
  lines,
  onLinesChange,
  monedaId,
  errors = [],
}: CompraLineaTablaProps) {
  const addLine = () => {
    onLinesChange([
      ...lines,
      { itemId: '', cantidad: '', precioUnitario: '', totalLinea: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    onLinesChange(lines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof CompraLine,
    value: number | ''
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    onLinesChange(newLines);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Líneas de compra</h3>
        <Button onClick={addLine} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar línea
        </Button>
      </div>

      <div className="border rounded-lg">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="w-[15%]">Cantidad</TableHead>
                <TableHead className="w-[20%]">Precio unitario</TableHead>
                <TableHead className="w-[20%]">Total línea</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay líneas agregadas. Haz clic en "Agregar línea" para
                    comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>
                      <ItemCombobox
                        value={line.itemId}
                        onChange={(value) => updateLine(index, 'itemId', value)}
                        onItemPick={(item) => {
                          const isCordobas = Number(monedaId) === 1;
                          const priceStr = isCordobas
                            ? item.precioBaseLocal
                            : item.precioBaseDolar;
                          const autoPrice = Number(priceStr) || 0;
                          const newLines = [...lines];
                          const current = newLines[index];
                          const qtyNum = Number(current.cantidad) || 0;
                          newLines[index] = {
                            ...current,
                            itemId: item.idItem,
                            precioUnitario: autoPrice,
                            cantidad: qtyNum > 0 ? qtyNum : 1,
                          } as CompraLine;
                          onLinesChange(newLines);
                        }}
                        error={errors[index]?.item}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={line.cantidad}
                        onChange={(e) =>
                          updateLine(
                            index,
                            'cantidad',
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        className={cn(
                          'w-full',
                          errors[index]?.cantidad && 'border-destructive'
                        )}
                        placeholder="0"
                      />
                      {errors[index]?.cantidad && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[index].cantidad}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.precioUnitario}
                        onChange={(e) =>
                          updateLine(
                            index,
                            'precioUnitario',
                            e.target.value ? Number(e.target.value) : ''
                          )
                        }
                        className={cn(
                          'w-full',
                          errors[index]?.precioUnitario && 'border-destructive'
                        )}
                        placeholder="0.00"
                      />
                      {errors[index]?.precioUnitario && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[index].precioUnitario}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const qty = Number(line.cantidad) || 0;
                        const price = Number(line.precioUnitario) || 0;
                        const total = qty * price;
                        return (
                          <Input
                            value={total.toFixed(2)}
                            readOnly
                            className="bg-muted"
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(index)}
                        aria-label="Eliminar línea"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

function ItemCombobox({
  value,
  onChange,
  error,
  onItemPick,
}: {
  value: number | '';
  onChange: (value: number | '') => void;
  error?: string;
  onItemPick?: (item: (typeof mockItems)[0]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedItem = useMemo(
    () => mockItems.find((i) => i.idItem === value),
    [value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockItems;
    return mockItems.filter((i) =>
      `${i.codigoItem} ${i.descripcion}`.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
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
                {filtered.map((item) => (
                  <CommandItem
                    key={item.idItem}
                    value={`${item.codigoItem} ${item.descripcion}`}
                    onSelect={() => {
                      onChange(item.idItem);
                      onItemPick?.(item);
                      setTimeout(() => setOpen(false), 0);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.idItem ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.codigoItem}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.descripcion}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
