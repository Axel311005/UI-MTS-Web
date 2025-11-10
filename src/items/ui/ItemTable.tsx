import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { ItemRowActions } from "./ItemRowActions";
import type { ItemResponse } from "../types/item.response";
import { EstadoActivo } from "@/shared/types/status";

interface ItemTableProps {
  items: ItemResponse[];
}

export function ItemTable({ items }: ItemTableProps) {
  const activos = items.filter((item) => item.activo === EstadoActivo.ACTIVO);
  const total = activos.length;

  return (
    <Card className="card-elegant">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Lista de Productos</CardTitle>
        <CardDescription className="text-sm">{total} productos encontrados</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="rounded-md border max-h-[600px] overflow-y-auto overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-full inline-block">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead data-mobile-hidden>Tipo</TableHead>
              <TableHead data-mobile-hidden>Clasificación</TableHead>
              <TableHead className="text-right" data-mobile-keep>
                Precio Córdoba
              </TableHead>
              <TableHead className="text-right" data-mobile-hidden>Precio USD</TableHead>
              <TableHead className="text-right" data-mobile-keep>
                Stock disponible
              </TableHead>
              <TableHead data-mobile-keep>Estado</TableHead>
              <TableHead className="w-[50px]" data-mobile-keep data-mobile-actions />
            </TableRow>
          </TableHeader>
          <TableBody>
            {activos.map((item) => {
              const clasificacion = item.clasificacion?.descripcion ?? "—";
              const precioCordobaValue = Number.parseFloat(
                item.precioBaseLocal ?? "0"
              );
              const precioCordoba = Number.isFinite(precioCordobaValue)
                ? precioCordobaValue
                : 0;
              const precioDolarValue = Number.parseFloat(
                item.precioBaseDolar ?? "0"
              );
              const precioDolar = Number.isFinite(precioDolarValue)
                ? precioDolarValue
                : 0;
              const estado = item.estado || item.activo;
              const stockDisponible = Array.isArray(item.existencias)
                ? item.existencias.reduce((total, existencia) => {
                    const cantidad = Number.parseFloat(
                      existencia.cantDisponible ?? "0"
                    );
                    return Number.isFinite(cantidad) ? total + cantidad : total;
                  }, 0)
                : 0;

              return (
                <TableRow key={item.idItem} className="table-row-hover">
                  <TableCell className="font-mono text-sm">
                    {item.codigoItem}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.descripcion}
                  </TableCell>
                  <TableCell data-mobile-hidden>
                    <Badge
                      variant={
                        item.tipo === "PRODUCTO" ? "default" : "secondary"
                      }
                    >
                      {item.tipo === "PRODUCTO" ? "Producto" : "Servicio"}
                    </Badge>
                  </TableCell>
                  <TableCell data-mobile-hidden>
                    <Badge variant="outline">{clasificacion}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono" data-mobile-keep>
                    {precioCordoba.toLocaleString("es-NI", {
                      style: "currency",
                      currency: "NIO",
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono" data-mobile-hidden>
                    {precioDolar.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-mono" data-mobile-keep>
                    {stockDisponible.toLocaleString("es-PE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell data-mobile-keep>
                    <Badge
                      variant={estado === "ACTIVO" ? "default" : "secondary"}
                    >
                      {estado === "ACTIVO" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell data-mobile-keep data-mobile-actions>
                    <ItemRowActions item={item} />
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No se encontraron productos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
