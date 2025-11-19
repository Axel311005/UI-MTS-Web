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
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { patchProformaLineaAction } from '../actions/patch-proforma-linea';
import { ItemSelect } from '@/shared/components/selects/ItemSelect';

export interface ProformaLine {
  idProformaLineas?: number;
  idItem: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

interface ProformaLinesTableProps {
  lines: ProformaLine[];
  onLinesChange: (lines: ProformaLine[]) => void;
  monedaId?: number | '';
  currencyName?: string;
  proformaId?: number;
  immediatePersist?: boolean;
}

export function ProformaLinesTable({
  lines,
  onLinesChange,
  currencyName,
  immediatePersist,
}: ProformaLinesTableProps) {
  const formatCurrency = (val: number) => {
    const name = (currencyName ?? '').toUpperCase();
    if (name === 'DOLARES') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(val);
    }
    if (name === 'CORDOBAS') {
      return new Intl.NumberFormat('es-NI', {
        style: 'currency',
        currency: 'NIO',
        maximumFractionDigits: 2,
      }).format(val);
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Función helper para obtener el precio según la moneda
  const getPrecioByMoneda = (item: any): number => {
    const monedaName = (currencyName ?? '').toUpperCase();
    const baseLocal = Number(item.precioBaseLocal ?? 0) || 0;
    const baseDolar = Number(item.precioBaseDolar ?? 0) || 0;

    // Si la moneda contiene "DOLAR", usar precioBaseDolar
    if (monedaName.includes('DOLAR')) {
      return baseDolar || baseLocal || 0;
    }
    // Si la moneda contiene "CORDOBA", usar precioBaseLocal
    if (monedaName.includes('CORDOBA')) {
      return baseLocal || baseDolar || 0;
    }
    // Por defecto, usar precioBaseLocal
    return baseLocal || baseDolar || 0;
  };

  const handleItemPick = (index: number, item: any) => {
    // Actualizar precio según moneda cuando se selecciona un item
    const precio = getPrecioByMoneda(item);
    const updatedLines = [...lines];
    const current = { ...updatedLines[index] } as ProformaLine;

    // Actualizar idItem, precioUnitario y totalLinea
    current.idItem = item.idItem;
    current.precioUnitario = precio;
    current.totalLinea = current.cantidad * precio;

    updatedLines[index] = current;
    onLinesChange(updatedLines);
  };

  const addLine = async () => {
    // Crear una línea vacía - el usuario seleccionará el item
    const draft: ProformaLine = {
      idItem: 0,
      cantidad: 1,
      precioUnitario: 0,
      totalLinea: 0,
    };

    // No guardar inmediatamente si no hay item seleccionado
    onLinesChange([...lines, draft]);
  };

  const removeLine = (index: number) => {
    onLinesChange(lines.filter((_, i) => i !== index));
  };

  const updateLine = async (
    index: number,
    field: keyof ProformaLine,
    value: number
  ) => {
    const updatedLines = [...lines];
    const current = { ...updatedLines[index], [field]: value } as ProformaLine;

    // El precio se actualiza automáticamente cuando se selecciona un item via onItemPick
    if (
      field === 'cantidad' ||
      field === 'precioUnitario' ||
      field === 'idItem'
    ) {
      // Si se cambia el item a 0, resetear precio y total
      if (field === 'idItem' && value === 0) {
        current.precioUnitario = 0;
        current.totalLinea = 0;
      } else if (field === 'idItem' && value > 0) {
        // Cuando se selecciona un item válido, el precio se actualiza via onItemPick
        // Solo recalcular total si ya hay precio
        if (current.precioUnitario > 0) {
          current.totalLinea = current.cantidad * current.precioUnitario;
        }
      } else {
        // Para cantidad o precioUnitario, recalcular total
        current.totalLinea = current.cantidad * current.precioUnitario;
      }
    }
    updatedLines[index] = current;
    onLinesChange(updatedLines);

    if (immediatePersist && current.idProformaLineas) {
      try {
        const payload: any = {};
        if (field === 'idItem') payload.idItem = current.idItem;
        if (field === 'cantidad') payload.cantidad = current.cantidad;
        if (field === 'precioUnitario' || field === 'idItem')
          payload.precioUnitario = current.precioUnitario;
        await patchProformaLineaAction(current.idProformaLineas, payload);
        toast.success('Línea actualizada');
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ?? 'No se pudo actualizar la línea'
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Líneas de la Proforma</p>
        <Button type="button" onClick={addLine}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Línea
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No hay líneas agregadas. Haga clic en "Agregar Línea" para comenzar.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Total Línea</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <ItemSelect
                      value={line.idItem > 0 ? line.idItem : ''}
                      onChange={(id) => {
                        // El onChange se llama cuando se selecciona un item
                        // Pero el estado completo se actualiza en onItemPick
                        // Solo actualizamos idItem aquí si onItemPick no se llamó
                        const numId = id === '' ? 0 : Number(id);
                        if (numId > 0 && numId !== line.idItem) {
                          updateLine(index, 'idItem', numId);
                        }
                      }}
                      showStock={true}
                      onItemPick={(item) => handleItemPick(index, item)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={line.cantidad}
                      onChange={(e) =>
                        updateLine(
                          index,
                          'cantidad',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.precioUnitario}
                      onChange={(e) =>
                        updateLine(
                          index,
                          'precioUnitario',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(line.totalLinea)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Proforma</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              lines.reduce((sum, line) => sum + line.totalLinea, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
