import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Edit, Trash2, CreditCard } from "@/shared/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Pagination } from "@/shared/components/ui/pagination";
import { TipoPagoHeader } from "../ui/TipoPagoHeader";
import { TipoPagoSearchBar } from "../ui/TipoPagoSearchBar";
import { useTipoPago } from "../hook/useTipoPago";
import { patchTipoPago } from "../actions/patch-tipo-pago";
import { EstadoActivo } from "@/shared/types/status";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDate } from "@/shared/utils/formatters";
import type { TipoPago } from "../types/tipoPago.interface";

export function TiposPagoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { tipoPagos, totalItems = 0 } = useTipoPago({
    usePagination: true,
    limit,
    offset,
  });

  const filteredTiposPago = useMemo<TipoPago[]>(() => {
    const items = tipoPagos ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((tipo) => {
      const descripcion = tipo.descripcion?.toLowerCase() ?? "";
      return descripcion.includes(term);
    });
  }, [tipoPagos, searchTerm]);

  useEffect(() => {
    const computedTotalPages = Math.max(
      Math.ceil((totalItems || 0) / pageSize),
      1
    );

    if (page > computedTotalPages) {
      setPage(computedTotalPages);
    }
  }, [page, totalItems, pageSize]);

  const handleDelete = async (id: number) => {
    try {
      await patchTipoPago(id, { activo: EstadoActivo.INACTIVO });
      toast.success("Tipo de pago eliminado");
      await queryClient.invalidateQueries({ queryKey: ["tipoPagos"] });
    } catch (error: any) {
      toast.error("No se pudo eliminar el tipo de pago");
    }
  };

  return (
    <div className="space-y-6">
      <TipoPagoHeader
        onNewTipoPago={() => navigate("/admin/tipos-pago/nuevo")}
      />

      <TipoPagoSearchBar
        value={searchTerm}
        onValueChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
      />

      {showFilters && (
        <div>
          {/* TipoPagoFilters puede agregarse después si se necesita */}
        </div>
      )}

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Tipos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <Table minTableWidth="48rem">
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTiposPago.map((tipo) => (
                <TableRow key={tipo.idTipoPago} className="table-row-hover">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{tipo.descripcion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tipo.activo === EstadoActivo.ACTIVO
                          ? "default"
                          : "secondary"
                      }
                    >
                      {tipo.activo === EstadoActivo.ACTIVO
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(tipo.fechaCreacion)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(
                              `/admin/tipos-pago/${tipo.idTipoPago}/editar`
                            )
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(tipo.idTipoPago)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.max(Math.ceil(totalItems / pageSize), 1)}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        )}
      </Card>
    </div>
  );
}
