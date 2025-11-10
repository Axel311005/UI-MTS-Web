import { useEffect, useMemo, useState } from "react";
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
import { useTramiteSeguro } from "../hook/useTramiteSeguro";
import type { TramiteSeguro } from "../types/tramiteSeguro.interface";
import { TramiteSeguroSearchBar } from "../ui/TramiteSeguroSearchBar";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { TramiteSeguroEstado } from "@/shared/types/status";
import {
  getClienteNombre,
  getClienteSearchText,
} from "@/clientes/utils/cliente.utils";

const estadoVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [TramiteSeguroEstado.INICIADO]: "default",
  [TramiteSeguroEstado.EN_REVISION]: "secondary",
  [TramiteSeguroEstado.APROBADO]: "default",
  [TramiteSeguroEstado.RECHAZADO]: "destructive",
  [TramiteSeguroEstado.CERRADO]: "outline",
  [TramiteSeguroEstado.PENDIENTE_DE_PAGO]: "secondary",
  EN_REVISION: "secondary",
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const normalizeEstado = (estado?: string | null) => {
  if (!estado) return "—";
  return estado.replace(/_/g, " ");
};

export default function TramitesSegurosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const currentParam = searchParams.get("q") || "";
    if (currentParam !== searchTerm) {
      setSearchTerm(currentParam);
    }
  }, [searchParams, searchTerm]);

  const debouncedSearch = useDebounce(searchTerm.trim().toLowerCase(), 300);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const shouldUsePagination = debouncedSearch.length === 0;

  const {
    tramiteSeguros = [],
    totalItems = 0,
    isLoading,
  } = useTramiteSeguro({
    usePagination: shouldUsePagination,
    limit: shouldUsePagination ? limit : undefined,
    offset: shouldUsePagination ? offset : undefined,
  });

  const filteredTramites = useMemo<TramiteSeguro[]>(() => {
    const items = tramiteSeguros ?? [];
    if (!debouncedSearch) return items;

    return items.filter((tramite) => {
      const numero = tramite.numeroTramite?.toLowerCase?.() ?? "";
      const cliente = tramite.cliente
        ? getClienteSearchText(tramite.cliente)
        : "";
      const vehiculo = tramite.vehiculo?.placa?.toLowerCase?.() ?? "";
      const aseguradora =
        tramite.aseguradora?.descripcion?.toLowerCase?.() ?? "";
      const estado = (tramite.estado ?? "").toString().toLowerCase();

      return (
        numero.includes(debouncedSearch) ||
        cliente.includes(debouncedSearch) ||
        vehiculo.includes(debouncedSearch) ||
        aseguradora.includes(debouncedSearch) ||
        estado.includes(debouncedSearch)
      );
    });
  }, [debouncedSearch, tramiteSeguros]);

  const totalFiltered = shouldUsePagination
    ? totalItems
    : filteredTramites.length;

  const paginatedTramites = useMemo(() => {
    if (shouldUsePagination) return filteredTramites;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTramites.slice(startIndex, endIndex);
  }, [filteredTramites, page, pageSize, shouldUsePagination]);

  useEffect(() => {
    if (isLoading) return;
    const computedTotalPages = totalFiltered
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

    if (page > computedTotalPages) {
      const lastPage = Math.max(1, computedTotalPages);
      const params = new URLSearchParams(searchParams);
      if (lastPage > 1) {
        params.set("page", lastPage.toString());
      } else {
        params.delete("page");
      }
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalFiltered]);

  const totalPages = totalFiltered ? Math.ceil(totalFiltered / pageSize) : 1;
  const showEmptyState = !isLoading && totalFiltered === 0;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trámites de Seguros</h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de trámites de seguros
          </p>
        </div>
        <Button onClick={() => navigate("/admin/tramites-seguros/nuevo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo trámite
        </Button>
      </div>

      <TramiteSeguroSearchBar
        value={searchTerm}
        onValueChange={handleSearchChange}
        className="w-full md:max-w-md"
      />

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Listado de trámites</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Aseguradora</TableHead>
                <TableHead data-mobile-keep>Estado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm">
                    Cargando trámites de seguros...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                paginatedTramites.map((tramite) => (
                  <TableRow
                    key={tramite.idTramiteSeguro}
                    className="table-row-hover"
                  >
                    <TableCell className="font-medium">
                      {tramite.numeroTramite}
                    </TableCell>
                    <TableCell>
                      {tramite.cliente
                        ? getClienteNombre(tramite.cliente)
                        : "—"}
                    </TableCell>
                    <TableCell>{tramite.vehiculo?.placa ?? "—"}</TableCell>
                    <TableCell>
                      {tramite.aseguradora?.descripcion ?? "—"}
                    </TableCell>
                    <TableCell data-mobile-keep>
                      {tramite.estado ? (
                        <Badge
                          variant={
                            estadoVariantMap[tramite.estado] ?? "outline"
                          }
                        >
                          {normalizeEstado(tramite.estado)}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(tramite.fechaInicio)}</TableCell>
                    <TableCell>{formatDate(tramite.fechaFin)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/tramites-seguros/editar/${tramite.idTramiteSeguro}`
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {showEmptyState && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron trámites de seguros.
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
              if (newPage > 1) {
                params.set("page", newPage.toString());
              } else {
                params.delete("page");
              }
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete("page");
              if (newSize !== 10) {
                params.set("pageSize", newSize.toString());
              } else {
                params.delete("pageSize");
              }
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>
    </div>
  );
}
