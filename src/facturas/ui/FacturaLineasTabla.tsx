import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  validateCantidad,
  validatePrecio,
  VALIDATION_RULES,
} from '@/shared/utils/validation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { useMoneda } from '@/moneda/hook/useMoneda';
import { ItemSelect } from '@/shared/components/selects/ItemSelect';
import { cn } from '@/shared/lib/utils';

interface InvoiceLine {
  id?: number;
  itemId: number | '';
  cantidad: number | '';
  precioUnitario: number | '';
  totalLinea: number;
}

interface InvoiceLinesTableProps {
  lines: InvoiceLine[];
  onLinesChange: (lines: InvoiceLine[]) => void;
  monedaId?: number | '';
  bodegaId?: number | '';
  currencyNameHint?: string; // opcional: nombre de moneda ya resuelto (evita fallback a local)
  errors?: Array<{
    cantidad?: string;
    precioUnitario?: string;
    item?: string;
  }>;
}

// Items come from API via hook

export function FacturaLineaTabla({
  lines,
  onLinesChange,
  monedaId,
  bodegaId,
  currencyNameHint,
  errors = [],
}: InvoiceLinesTableProps) {
  const { monedas } = useMoneda();
  const monedaNombre = useMemo(() => {
    const id = typeof monedaId === 'number' ? monedaId : Number(monedaId);
    // Si recibimos hint, úsalo prioritariamente para evitar fallback incorrecto cuando aun no carga "monedas"
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
    field: keyof InvoiceLine,
    value: number | ''
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    onLinesChange(newLines);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Líneas de factura</h3>
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
                <TableHead className="w-[30%] max-w-[220px]">Item</TableHead>
                <TableHead className="w-[10%] min-w-[80px]">Cantidad</TableHead>
                <TableHead className="w-[25%] min-w-[140px]">Precio unitario</TableHead>
                <TableHead className="w-[20%] min-w-[120px]">Total línea</TableHead>
                <TableHead className="w-[5%] min-w-[50px]"></TableHead>
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
                    <TableCell className="max-w-[220px]">
                      <div className="w-full max-w-[220px]">
                        <ItemSelect
                        value={line.itemId || ''}
                        onChange={(value) => {
                          const numValue = value === '' ? '' : Number(value);
                          updateLine(index, 'itemId', numValue);
                        }}
                        onItemPick={(item) => {
                          // Si el item ya existe en otra línea, en vez de crear/duplicar,
                          // incrementamos la cantidad de esa línea y eliminamos la actual.
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
                            };
                            // Eliminar la fila actual (que intentaba duplicar el item)
                            newLines.splice(index, 1);
                            onLinesChange(newLines);
                            toast.info(
                              'Item ya estaba en la factura, se aumentó la cantidad'
                            );
                            return;
                          }
                          // Precio sugerido según nombre de moneda
                          const mName = normalize(monedaNombre);
                          const isCordobas = mName.includes('CORDOBA');
                          const isDolares = mName.includes('DOLAR');
                          const priceStr = isCordobas
                            ? item.precioBaseLocal
                            : isDolares
                            ? item.precioBaseDolar
                            : item.precioBaseLocal; // fallback seguro
                          const autoPrice = Number(priceStr) || 0;
                          const newLines = [...lines];
                          const current = newLines[index];
                          const qtyNum = Number(current.cantidad) || 0;
                          newLines[index] = {
                            ...current,
                            // set selected item too to avoid losing selection due to stale updates
                            itemId: item.idItem,
                            precioUnitario: autoPrice,
                            // if missing or zero, default to 1 to make the line valid
                            cantidad: qtyNum > 0 ? qtyNum : 1,
                          } as InvoiceLine;
                          onLinesChange(newLines);
                        }}
                        error={errors[index]?.item}
                        bodegaId={bodegaId}
                        showStock={true}
                      />
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[80px]">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={line.cantidad}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : '';
                          if (value !== '') {
                            const validation = validateCantidad(value, VALIDATION_RULES.cantidad.max);
                            if (!validation.isValid) {
                              // El error se manejará en la validación del formulario
                            }
                          }
                          updateLine(index, 'cantidad', value);
                        }}
                        className={cn(
                          'w-full',
                          errors[index]?.cantidad && 'border-destructive'
                        )}
                        placeholder="1"
                      />
                      {errors[index]?.cantidad && (
                        <p className="text-xs text-destructive mt-1">
                          {errors[index].cantidad}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.precioUnitario}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : '';
                          if (value !== '') {
                            const validation = validatePrecio(value, VALIDATION_RULES.precio.max);
                            if (!validation.isValid) {
                              // El error se manejará en la validación del formulario
                            }
                          }
                          updateLine(index, 'precioUnitario', value);
                        }}
                        className={cn(
                          'w-full min-w-[120px]',
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
                    <TableCell className="min-w-[120px]">
                      {(() => {
                        const qty = Number(line.cantidad) || 0;
                        const price = Number(line.precioUnitario) || 0;
                        const total = qty * price;
                        return (
                          <Input
                            value={total.toFixed(2)}
                            readOnly
                            className="bg-muted w-full"
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

