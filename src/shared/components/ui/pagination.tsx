import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const startItem =
    totalItems !== undefined ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem =
    totalItems !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 px-2 py-4">
      {/* Selector de tamaño - Oculto en móvil */}
      <div className="hidden sm:flex items-center gap-2">
        <p className="text-sm text-muted-foreground">Mostrar</p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {totalItems !== undefined
            ? `de ${totalItems} registros`
            : 'registros por página'}
        </p>
      </div>

      {/* Información de rango - Oculto en móvil */}
      {totalItems !== undefined && (
        <p className="hidden sm:block text-sm text-muted-foreground">
          {startItem !== undefined && endItem !== undefined
            ? `Mostrando ${startItem} a ${endItem} de ${totalItems}`
            : ''}
        </p>
      )}

      {/* Controles de navegación */}
      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
        {/* Botones primera/última - Ocultos en móvil */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex h-8 w-8 p-0 touch-manipulation"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
        >
          <span className="sr-only">Primera página</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation min-h-[44px] sm:min-h-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <span className="sr-only">Página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Información de página */}
        <div className="flex items-center gap-1 px-2 sm:px-3">
          <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
            <span className="sm:hidden">{currentPage}</span>
            <span className="hidden sm:inline">Página {currentPage} de {Math.max(1, totalPages)}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation min-h-[44px] sm:min-h-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <span className="sr-only">Siguiente página</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex h-8 w-8 p-0 touch-manipulation"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
        >
          <span className="sr-only">Última página</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
