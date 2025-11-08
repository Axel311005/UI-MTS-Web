import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
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
import { useItem } from '@/items/hooks/useItem';
import type { ItemResponse } from '@/items/types/item.response';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { useExistenciaBodega } from '@/existencia-bodega/hook/useExistenciaBodega';
import { ItemSelect } from '@/shared/components/selects/ItemSelect';

interface CompraLine {
  id?: number;
  itemId: number | '';
  cantidad: number | '';
  precioUnitario: number | '';
  totalLinea: number;
}

interface CompraLineaTablaProps {
  lines: CompraLine[];
  onLinesChange: (lines: CompraLine[]) => void;
  monedaId?: number | '';
  bodegaId?: number | '';
  currencyNameHint?: string;
  errors?: Array<{
    cantidad?: string;
    precioUnitario?: string;
    item?: string;
  }>;
}

export function CompraLineaTabla({
  lines,
  onLinesChange,
  monedaId,
  bodegaId,
  currencyNameHint,
  errors = [],
}: CompraLineaTablaProps) {
  const { monedas } = useMoneda();
  const monedaNombre = useMemo(() => {
    const id = typeof monedaId === 'number' ? monedaId : Number(monedaId);
    if (currencyNameHint && currencyNameHint.trim().length > 0)
      return currencyNameHint;
    const found = (monedas ?? []).find((m) => m.idMoneda === id);
    return found?.descripcion ?? '';
  }, [monedas, monedaId, currencyNameHint]);

  const normalize = (s: string) =>
    (s || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

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
                      <ItemSelect
                        value={line.itemId || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? '' : Number(value);
                          updateLine(index, 'itemId', numValue);
                        }}
                        onItemPick={(item) => {
                          // Merge: si el item ya está en otra línea, aumentar cantidad y eliminar esta fila
                          const existingIdx = lines.findIndex(
                            (l, i) =>
                              i !== index && Number(l.itemId) === item.idItem
                          );
                          if (existingIdx >= 0) {
                            const newLines = [...lines];
                            const current = newLines[index];
                            const existing = newLines[existingIdx];
                            const addQty = Number(current.cantidad) || 1;
                            const exQty = Number(existing.cantidad) || 0;
                            newLines[existingIdx] = {
                              ...existing,
                              cantidad: exQty + (addQty > 0 ? addQty : 1),
                            } as CompraLine;
                            newLines.splice(index, 1);
                            onLinesChange(newLines);
                            return;
                          }
                          const mName = normalize(monedaNombre);
                          const isCordobas = mName.includes('CORDOBA');
                          const isDolares = mName.includes('DOLAR');
                          const priceStr = isCordobas
                            ? item.precioBaseLocal
                            : isDolares
                            ? item.precioBaseDolar
                            : item.precioBaseLocal;
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
                        bodegaId={bodegaId}
                        showStock={true}
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

