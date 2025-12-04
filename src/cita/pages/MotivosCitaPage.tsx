import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Search, Edit, Trash2 } from "@/shared/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
import { useMotivoCita } from "../hook/useMotivoCita";
import { patchMotivoCitaAction } from "../actions/patch-motivo-cita";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MotivoCita } from "../types/motivo-cita.interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { postMotivoCitaAction } from "../actions/post-motivo-cita";
import { inactivateMotivoCitaAction } from "../actions/inactivate-motivo-cita";
import {
  sanitizeText,
  validateText,
  VALIDATION_RULES,
} from '@/shared/utils/validation';

export default function MotivosCitaPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer parámetros de URL o usar valores por defecto
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMotivo, setEditingMotivo] = useState<MotivoCita | null>(null);
  const [formData, setFormData] = useState({ descripcion: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    motivosCita,
    totalItems = 0,
    isLoading,
  } = useMotivoCita({
    usePagination: true,
    limit,
    offset,
  });

  const filteredMotivos = useMemo<MotivoCita[]>(() => {
    const items = motivosCita ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((motivo) => {
      const descripcion = motivo.descripcion?.toLowerCase() ?? "";
      return descripcion.includes(term);
    });
  }, [motivosCita, searchTerm]);

  // Validar página cuando cambian los datos
  useEffect(() => {
    if (isLoading) return;
    const computedTotalPages = totalItems
      ? Math.ceil(totalItems / pageSize)
      : 1;

    if (totalItems === 0) {
      if (page !== 1) {
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        setSearchParams(params, { replace: true });
      }
      return;
    }

    if (page > computedTotalPages) {
      const lastPage = Math.max(1, computedTotalPages);
      const params = new URLSearchParams(searchParams);
      if (lastPage > 1) {
        params.set('page', lastPage.toString());
      } else {
        params.delete('page');
      }
      setSearchParams(params, { replace: true });
    }
  }, [isLoading, page, pageSize, searchParams, setSearchParams, totalItems]);

  const handleDelete = async (id: number) => {
    if (
      !confirm("¿Estás seguro de que deseas inactivar este motivo de cita?")
    ) {
      return;
    }
    try {
      await inactivateMotivoCitaAction(id);
      toast.success("Motivo de cita inactivado");
      await queryClient.invalidateQueries({ queryKey: ["motivosCita"] });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "No se pudo inactivar el motivo de cita";
      toast.error(message);
    }
  };

  const handleCreate = async () => {
    if (!formData.descripcion.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    
    const validation = validateText(
      formData.descripcion.trim(),
      VALIDATION_RULES.descripcion.min,
      VALIDATION_RULES.descripcion.max,
      false
    );
    if (!validation.isValid) {
      toast.error(validation.error || "Descripción inválida");
      return;
    }

    setIsSubmitting(true);
    try {
      await postMotivoCitaAction({
        descripcion: sanitizeText(
          formData.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false, // No permitir 3 caracteres repetidos
          true // Preservar espacios (permitir espacios en descripción)
        ),
      });
      toast.success("Motivo de cita creado exitosamente");
      setIsCreateDialogOpen(false);
      setFormData({ descripcion: "" });
      await queryClient.invalidateQueries({ queryKey: ["motivosCita"] });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "No se pudo crear el motivo de cita";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingMotivo || !formData.descripcion.trim()) {
      toast.error("La descripción es requerida");
      return;
    }
    
    const validation = validateText(
      formData.descripcion.trim(),
      VALIDATION_RULES.descripcion.min,
      VALIDATION_RULES.descripcion.max,
      false
    );
    if (!validation.isValid) {
      toast.error(validation.error || "Descripción inválida");
      return;
    }

    setIsSubmitting(true);
    try {
      await patchMotivoCitaAction(editingMotivo.idMotivoCita, {
        descripcion: sanitizeText(
          formData.descripcion.trim(),
          VALIDATION_RULES.descripcion.min,
          VALIDATION_RULES.descripcion.max,
          false, // No permitir 3 caracteres repetidos
          true // Preservar espacios (permitir espacios en descripción)
        ),
      });
      toast.success("Motivo de cita actualizado exitosamente");
      setIsEditDialogOpen(false);
      setEditingMotivo(null);
      setFormData({ descripcion: "" });
      await queryClient.invalidateQueries({ queryKey: ["motivosCita"] });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "No se pudo actualizar el motivo de cita";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (motivo: MotivoCita) => {
    setEditingMotivo(motivo);
    setFormData({ descripcion: motivo.descripcion });
    setIsEditDialogOpen(true);
  };

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">
            Motivos de Cita
          </h1>
          <p className="text-muted-foreground text-left">
            Gestiona los motivos de cita disponibles
          </p>
        </div>
        <Button
          className="button-hover"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Motivo
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar motivos de cita..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const params = new URLSearchParams(searchParams);
              params.delete('page');
              setSearchParams(params, { replace: true });
            }}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Lista de Motivos de Cita</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando motivos de cita...
            </div>
          ) : filteredMotivos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "No se encontraron motivos que coincidan con la búsqueda"
                : "No hay motivos de cita registrados"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMotivos.map((motivo) => (
                  <TableRow
                    key={motivo.idMotivoCita}
                    className="table-row-hover"
                  >
                    <TableCell>{motivo.descripcion}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(motivo)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(motivo.idMotivoCita)}
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
          )}
        </CardContent>
        {totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams);
              if (newPage > 1) {
                params.set('page', newPage.toString());
              } else {
                params.delete('page');
              }
              setSearchParams(params, { replace: true });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={(newSize) => {
              const params = new URLSearchParams(searchParams);
              params.delete('page'); // Reset a página 1
              if (newSize !== 10) {
                params.set('pageSize', newSize.toString());
              } else {
                params.delete('pageSize');
              }
              setSearchParams(params, { replace: true });
            }}
          />
        )}
      </Card>

      {/* Dialog para crear */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Motivo de Cita</DialogTitle>
            <DialogDescription>
              Ingresa la descripción del nuevo motivo de cita
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion-create">Descripción *</Label>
              <Textarea
                id="descripcion-create"
                placeholder="Ej: Mantenimiento preventivo, Reparación de frenos, etc."
                value={formData.descripcion}
                onChange={(e) => {
                  const sanitized = sanitizeText(
                    e.target.value,
                    VALIDATION_RULES.descripcion.min,
                    VALIDATION_RULES.descripcion.max,
                    false, // No permitir 3 caracteres repetidos
                    true // Preservar espacios (permitir espacios en descripción)
                  );
                  setFormData({ ...formData, descripcion: sanitized });
                }}
                onBlur={(e) => {
                  // Validar que no sea solo espacios
                  const trimmed = e.target.value.trim();
                  if (e.target.value.length > 0 && trimmed.length === 0) {
                    setFormData({ ...formData, descripcion: '' });
                  }
                }}
                rows={3}
                maxLength={VALIDATION_RULES.descripcion.max}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setFormData({ descripcion: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Motivo de Cita</DialogTitle>
            <DialogDescription>
              Modifica la descripción del motivo de cita
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion-edit">Descripción *</Label>
              <Textarea
                id="descripcion-edit"
                placeholder="Ej: Mantenimiento preventivo, Reparación de frenos, etc."
                value={formData.descripcion}
                onChange={(e) => {
                  const sanitized = sanitizeText(
                    e.target.value,
                    VALIDATION_RULES.descripcion.min,
                    VALIDATION_RULES.descripcion.max,
                    false, // No permitir 3 caracteres repetidos
                    true // Preservar espacios (permitir espacios en descripción)
                  );
                  setFormData({ ...formData, descripcion: sanitized });
                }}
                onBlur={(e) => {
                  // Validar que no sea solo espacios
                  const trimmed = e.target.value.trim();
                  if (e.target.value.length > 0 && trimmed.length === 0) {
                    setFormData({ ...formData, descripcion: '' });
                  }
                }}
                rows={3}
                maxLength={VALIDATION_RULES.descripcion.max}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingMotivo(null);
                setFormData({ descripcion: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
