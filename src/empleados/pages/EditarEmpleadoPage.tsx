import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getEmpleadoById } from "../actions/get-empleado-by-id";
import { patchEmpleadoAction } from "../actions/patch-empleado";
import { EstadoActivo } from "@/shared/types/status";

export default function EditarEmpleadoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const empleadoId = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    primerNombre: "",
    primerApellido: "",
    cedula: "",
    telefono: "",
    direccion: "",
    activo: EstadoActivo.ACTIVO as EstadoActivo,
  });

  // Validar formato de cédula
  const validateCedula = (cedula: string): boolean => {
    // Formato: 13 números + 1 letra (ejemplo: 0010606051003H)
    const cedulaRegex = /^[0-9]{13}[A-Z]$/;
    return cedulaRegex.test(cedula);
  };

  // Formatear cédula mientras se escribe
  const handleCedulaChange = (value: string) => {
    // Solo permitir números y letras
    const cleaned = value.replace(/[^0-9A-Za-z]/g, "");
    // Si tiene más de 13 caracteres y el último es una letra, mantenerlo
    if (cleaned.length <= 13) {
      // Solo números hasta 13 caracteres
      const numbers = cleaned.replace(/[^0-9]/g, "").slice(0, 13);
      setFormData({ ...formData, cedula: numbers });
    } else if (cleaned.length === 14) {
      // 13 números + 1 letra
      const numbers = cleaned.slice(0, 13).replace(/[^0-9]/g, "");
      const letter = cleaned
        .slice(13)
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .slice(0, 1);
      if (numbers.length === 13 && letter.length === 1) {
        setFormData({ ...formData, cedula: numbers + letter });
      }
    }
  };

  // Formatear teléfono (solo 8 dígitos)
  const handleTelefonoChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    setFormData({ ...formData, telefono: cleaned });
  };

  useEffect(() => {
    if (!params.id) {
      toast.error("ID de empleado no proporcionado");
      navigate("/admin/administracion");
      return;
    }

    if (!Number.isFinite(empleadoId)) {
      toast.error("ID de empleado inválido");
      navigate("/admin/administracion");
      return;
    }

    const loadEmpleado = async () => {
      setLoading(true);
      const dismiss = toast.loading("Cargando empleado...");
      try {
        const empleado = await getEmpleadoById(empleadoId);
        // Convertir teléfono del backend (50587781633) al formato frontend (87781633)
        const telefonoFrontend = (() => {
          const tel = empleado.telefono ?? "";
          if (tel.startsWith("505") && tel.length === 11) {
            return tel.slice(3); // Remover "505" del inicio
          }
          return tel;
        })();

        setFormData({
          primerNombre: empleado.primerNombre ?? "",
          primerApellido: empleado.primerApellido ?? "",
          cedula: empleado.cedula ?? "",
          telefono: telefonoFrontend,
          direccion: empleado.direccion ?? "",
          activo:
            (empleado.activo as EstadoActivo | undefined) ??
            EstadoActivo.ACTIVO,
        });
      } catch (error: any) {
        const raw = error?.response?.data;
        const message =
          raw?.message ||
          (typeof raw === "string" ? raw : undefined) ||
          (error instanceof Error ? error.message : undefined) ||
          "No se pudo cargar el empleado";
        toast.error(message);
        navigate("/admin/administracion");
      } finally {
        toast.dismiss(dismiss);
        setLoading(false);
      }
    };

    loadEmpleado();
  }, [empleadoId, navigate, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (
      !formData.primerNombre ||
      !formData.primerApellido ||
      !formData.cedula ||
      !formData.telefono ||
      !formData.direccion
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    // Validar formato de cédula
    if (!validateCedula(formData.cedula)) {
      toast.error(
        "La cédula debe tener el formato: 13 números seguidos de 1 letra (ejemplo: 0010606051003H)"
      );
      return;
    }

    setSaving(true);
    const dismiss = toast.loading("Actualizando empleado...");
    try {
      // Convertir teléfono de formato frontend (87781633) a backend (50587781633)
      const telefonoLimpio = formData.telefono.replace(/\D/g, "");
      const telefonoBackend =
        telefonoLimpio.length === 8 ? `505${telefonoLimpio}` : telefonoLimpio;

      await patchEmpleadoAction(empleadoId, {
        primerNombre: formData.primerNombre.trim(),
        primerApellido: formData.primerApellido.trim(),
        cedula: formData.cedula.trim(),
        telefono: telefonoBackend,
        direccion: formData.direccion.trim(),
        activo: formData.activo,
      });

      toast.success("Empleado actualizado correctamente");

      await queryClient.invalidateQueries({
        queryKey: ["empleados"],
        exact: false,
      });

      navigate("/admin/administracion");
    } catch (error: any) {
      const raw = error?.response?.data;
      const message =
        raw?.message ||
        (typeof raw === "string" ? raw : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        "No se pudo actualizar el empleado";
      toast.error(message);
    } finally {
      toast.dismiss(dismiss);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/administracion")}
            className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Editar Empleado</h1>
        </div>
      </div>

      <Card className="card-elegant">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Información del Empleado</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="primerNombre" className="text-sm">Primer Nombre *</Label>
                <Input
                  id="primerNombre"
                  value={formData.primerNombre}
                  onChange={(e) =>
                    setFormData({ ...formData, primerNombre: e.target.value })
                  }
                  className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="primerApellido" className="text-sm">Primer Apellido *</Label>
                <Input
                  id="primerApellido"
                  value={formData.primerApellido}
                  onChange={(e) =>
                    setFormData({ ...formData, primerApellido: e.target.value })
                  }
                  className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cedula" className="text-sm">Cédula *</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => handleCedulaChange(e.target.value)}
                placeholder="0010606051003H"
                maxLength={14}
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                required
              />
              <p className="text-xs text-muted-foreground">
                Formato: 13 números seguidos de 1 letra
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="telefono" className="text-sm">Teléfono *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground font-medium pointer-events-none">
                  +505
                </div>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  placeholder="87781633"
                  maxLength={8}
                  className="pl-14 h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                8 dígitos (se enviará como 505 + 8 dígitos)
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="direccion" className="text-sm">Dirección *</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                required
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="estado" className="text-sm">Estado *</Label>
              <Select
                value={formData.activo}
                onValueChange={(value) =>
                  setFormData({ ...formData, activo: value as EstadoActivo })
                }
              >
                <SelectTrigger id="estado" className="h-10 sm:h-11 text-sm sm:text-base">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoActivo.ACTIVO}>Activo</SelectItem>
                  <SelectItem value={EstadoActivo.INACTIVO}>
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/administracion")}
                className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{saving ? "Guardando..." : "Guardar Cambios"}</span>
                <span className="sm:hidden">{saving ? "Guardando..." : "Guardar"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
