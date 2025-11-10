import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { useRecepcion } from "../hook/useRecepcion";
import { RecepcionSearchBar } from "../ui/RecepcionSearchBar";
import type { Recepcion } from "../types/recepcion.interface";
import { useDebounce } from "@/shared/hooks/use-debounce";

const estadoVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDIENTE: "secondary",
  EN_PROCESO: "default",
  "EN PROCESO": "default",
  FINALIZADO: "outline",
  ENTREGADO: "default",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d instanceof Date && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString()
    : "—";
};

export default function RecepcionesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const debounced = useDebounce(initialSearch.trim().toLowerCase(), 300);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const shouldUsePagination = debounced.length === 0;

  const {
    recepciones = [],
    totalItems = 0,
    isLoading,
  } = useRecepcion({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filtered = useMemo<Recepcion[]>(() => {
    const list = recepciones ?? [];
    if (!debounced) return list;
    return list.filter((r) => {
      const placa = r.vehiculo?.placa?.toLowerCase?.() ?? "";
      const empleado = `${r.empleado?.primerNombre ?? ""} ${
        r.empleado?.primerApellido ?? ""
      }`
        .trim()
        .toLowerCase();
      const estado = (r.estado ?? "").toString().toLowerCase();
      return (
        placa.includes(debounced) ||
        empleado.includes(debounced) ||
        estado.includes(debounced)
      );
    });
  }, [recepciones, debounced]);

  const totalFiltered = shouldUsePagination ? totalItems : filtered.length;

  const paginated = useMemo(() => {
    if (shouldUsePagination) return filtered;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize, shouldUsePagination]);

  useEffect(() => {
    if (isLoading) return;
    const computedTotal = totalFiltered
      ? Math.ceil(totalFiltered / pageSize)
      : 1;
    if (totalFiltered === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        setSearchParams(params, { replace: true });
      }
      return;
    }
    if (page > computedTotal) {
      const last = Math.max(1, computedTotal);
      const params = new URLSearchParams(searchParams);
      if (last > 1) params.set("page", last.toString());
      else params.delete("page");
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmpty = !isLoading && totalFiltered === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left">Recepciones</h1>
          <p className="text-muted-foreground">
            Gestión de recepciones de vehículos
          </p>
        </div>
        <Button onClick={() => navigate("/admin/recepciones/nueva")}>
          <Plus className="mr-2 h-4 w-4" /> Nueva recepción
        </Button>
      </div>

      <RecepcionSearchBar
        containerClassName="w-full max-w-md"
        className="w-full"
        placeholder="Buscar por vehículo, empleado o estado"
      />

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de recepciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consecutivo</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha Recepción</TableHead>
                <TableHead>Entrega Estimada</TableHead>
                <TableHead data-mobile-keep>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm">
                    Cargando recepciones...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginated.map((r) => (
                  <TableRow key={r.idRecepcion} className="table-row-hover">
                    <TableCell className="font-medium">
                      {r.codigoRecepcion ?? "—"}
                    </TableCell>
                    <TableCell>{r.vehiculo?.placa ?? "—"}</TableCell>
                    <TableCell>
                      {`${r.empleado?.primerNombre ?? ""} ${
                        r.empleado?.primerApellido ?? ""
                      }`.trim() || "—"}
                    </TableCell>
                    <TableCell>{formatDate(r.fechaRecepcion)}</TableCell>
                    <TableCell>{formatDate(r.fechaEntregaEstimada)}</TableCell>
                    <TableCell data-mobile-keep>
                      {r.estado ? (
                        <Badge
                          variant={
                            estadoVariant[r.estado] ??
                            estadoVariant[r.estado.replace(/\s+/g, "_")] ??
                            "outline"
                          }
                        >
                          {r.estado}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/recepciones/editar/${r.idRecepcion}`)
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron recepciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalFiltered > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalFiltered}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) params.set("page", newPage.toString());
              else params.delete("page");
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete("page");
              if (newSize !== 10) params.set("pageSize", newSize.toString());
              else params.delete("pageSize");
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
}
