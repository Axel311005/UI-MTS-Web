import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { toast } from "sonner";
import { tallerApi } from "@/shared/api/tallerApi";
import { useEmpleado } from "@/empleados/hook/useEmpleado";
import {
  UserPlus,
  Shield,
  Users,
  UserCheck,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmpleadoAction,
  type CreateEmpleadoPayload,
} from "@/empleados/actions/post-empleado";
import { patchEmpleadoAction } from "@/empleados/actions/patch-empleado";
import { EstadoActivo } from "@/shared/types/status";
import { useNavigate } from "react-router";
import { CustomSearchControl } from "@/shared/components/custom/CustomSearchControl";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface RegisterEmployeePayload {
  email: string;
  password: string;
  empleadoId: number;
}

export default function AdministracionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { empleados, isLoading: isLoadingEmpleados } = useEmpleado({
    usePagination: false,
  });

  // Form para crear empleado
  const [empleadoForm, setEmpleadoForm] = useState<CreateEmpleadoPayload>({
    primerNombre: "",
    primerApellido: "",
    cedula: "",
    telefono: "",
    direccion: "",
    activo: EstadoActivo.ACTIVO,
  });

  // Form para crear usuario
  const [usuarioForm, setUsuarioForm] = useState({
    email: "",
    password: "",
    empleadoId: "",
  });

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Crear empleado
  const createEmpleadoMutation = useMutation({
    mutationFn: createEmpleadoAction,
    onSuccess: (data) => {
      toast.success("Empleado creado correctamente");
      setEmpleadoForm({
        primerNombre: "",
        primerApellido: "",
        cedula: "",
        telefono: "",
        direccion: "",
        activo: EstadoActivo.ACTIVO,
      });
      // Auto-seleccionar el empleado recién creado en el formulario de usuario
      if (data?.idEmpleado) {
        setUsuarioForm((prev) => ({
          ...prev,
          empleadoId: String(data.idEmpleado),
        }));
      }
      queryClient.invalidateQueries({ queryKey: ["empleados"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al crear empleado";
      toast.error(message);
    },
  });

  // Registrar usuario para empleado
  const registerUsuarioMutation = useMutation({
    mutationFn: async (payload: RegisterEmployeePayload) => {
      const { data } = await tallerApi.post("/auth/register/employee", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Usuario creado correctamente");
      setUsuarioForm({ email: "", password: "", empleadoId: "" });
      // Refrescar empleados para que se actualice la lista de usuarios
      queryClient.invalidateQueries({ queryKey: ["empleados"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al crear usuario";
      toast.error(message);
    },
  });

  // Obtener usuarios desde los empleados (que ya tienen la relación con user)
  // Los usuarios se extraen de los empleados que tienen un user asociado
  const users = useMemo(() => {
    if (!empleados || empleados.length === 0) return [];
    const usuarios: any[] = [];
    empleados.forEach((empleado: any) => {
      if (empleado.user && empleado.user.id) {
        usuarios.push({
          id: empleado.user.id,
          email: empleado.user.email,
          roles: empleado.user.roles || [],
          empleado: {
            idEmpleado: empleado.idEmpleado,
            id: empleado.idEmpleado,
            primerNombre: empleado.primerNombre,
            primerApellido: empleado.primerApellido,
          },
        });
      }
    });
    return usuarios;
  }, [empleados]);

  const isLoadingUsers = isLoadingEmpleados;

  // Búsqueda en frontend
  const debouncedSearch = useDebounce(searchTerm.trim().toLowerCase(), 300);

  const formatTelefono = (value: string) =>
    value.replace(/\D/g, "").slice(0, 8);

  const handleTelefonoChange = (value: string) => {
    const cleaned = formatTelefono(value);
    setEmpleadoForm((prev) => ({
      ...prev,
      telefono: cleaned,
    }));
  };

  // Filtrar empleados basado en la búsqueda
  const filteredEmpleados = useMemo(() => {
    if (!empleados) return [];
    if (!debouncedSearch) return empleados;

    return empleados.filter((empleado) => {
      const nombre = (empleado.primerNombre || "").toLowerCase();
      const apellido = (empleado.primerApellido || "").toLowerCase();
      const cedula = (empleado.cedula || "").toLowerCase();
      const telefono = (empleado.telefono || "").toLowerCase();
      const direccion = (empleado.direccion || "").toLowerCase();
      const estado = (empleado.activo || "").toLowerCase();

      // Buscar email del usuario asociado
      const associatedUser = users?.find((user: any) => {
        if (!user.empleado) return false;
        if (user.empleado.idEmpleado === empleado.idEmpleado) return true;
        if (user.empleado.id === empleado.idEmpleado) return true;
        const userNombre = `${user.empleado.primerNombre || ""} ${
          user.empleado.primerApellido || ""
        }`.trim();
        const empleadoNombre =
          `${empleado.primerNombre} ${empleado.primerApellido}`.trim();
        return userNombre === empleadoNombre && userNombre.length > 0;
      });
      const email = (
        associatedUser?.email ||
        empleado.correo ||
        ""
      ).toLowerCase();

      return (
        nombre.includes(debouncedSearch) ||
        apellido.includes(debouncedSearch) ||
        cedula.includes(debouncedSearch) ||
        telefono.includes(debouncedSearch) ||
        direccion.includes(debouncedSearch) ||
        estado.includes(debouncedSearch) ||
        email.includes(debouncedSearch) ||
        `${nombre} ${apellido}`.includes(debouncedSearch)
      );
    });
  }, [empleados, debouncedSearch, users]);

  // Eliminar empleado (marcar como inactivo)
  const deleteEmpleadoMutation = useMutation({
    mutationFn: async (idEmpleado: number) => {
      await patchEmpleadoAction(idEmpleado, {
        activo: EstadoActivo.INACTIVO,
      });
    },
    onSuccess: () => {
      toast.success("Empleado marcado como inactivo");
      queryClient.invalidateQueries({ queryKey: ["empleados"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al eliminar empleado";
      toast.error(message);
    },
  });

  const handleDeleteEmpleado = (idEmpleado: number) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas marcar este empleado como inactivo?"
      )
    ) {
      deleteEmpleadoMutation.mutate(idEmpleado);
    }
  };

  // Actualizar roles
  const updateRolesMutation = useMutation({
    mutationFn: async ({
      userId,
      roles,
    }: {
      userId: string;
      roles: string[];
    }) => {
      const { data } = await tallerApi.patch(`/auth/users/${userId}/roles`, {
        roles,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Roles actualizados correctamente");
      setSelectedUserId("");
      setSelectedRoles([]);
      // Refrescar empleados para que se actualice la lista de usuarios y la tabla
      queryClient.invalidateQueries({ queryKey: ["empleados"] });
      queryClient.refetchQueries({ queryKey: ["empleados"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al actualizar roles";
      toast.error(message);
    },
  });

  // Validar formato de cédula
  const validateCedula = (cedula: string): boolean => {
    // Formato: 13 números + 1 letra (ejemplo: 0010606051003H)
    const cedulaRegex = /^[0-9]{13}[A-Z]$/;
    return cedulaRegex.test(cedula);
  };

  const handleCreateEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !empleadoForm.primerNombre ||
      !empleadoForm.primerApellido ||
      !empleadoForm.cedula ||
      !empleadoForm.telefono ||
      !empleadoForm.direccion
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    // Validar formato de cédula
    if (!validateCedula(empleadoForm.cedula)) {
      toast.error(
        "La cédula debe tener el formato: 13 números seguidos de 1 letra (ejemplo: 0010606051003H)"
      );
      return;
    }
    const telefonoLimpio = empleadoForm.telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 8) {
      toast.error("El teléfono debe tener 8 dígitos");
      return;
    }
    const telefonoBackend = `505${telefonoLimpio}`;
    createEmpleadoMutation.mutate({
      ...empleadoForm,
      telefono: telefonoBackend,
      activo: EstadoActivo.ACTIVO, // Siempre ACTIVO por defecto
    });
  };

  const handleRegisterUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !usuarioForm.email ||
      !usuarioForm.password ||
      !usuarioForm.empleadoId
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    // Limpiar y validar email
    const emailLimpio = usuarioForm.email.trim().toLowerCase();
    if (!emailLimpio || !emailLimpio.includes("@")) {
      toast.error("El email no es válido");
      return;
    }
    registerUsuarioMutation.mutate({
      email: emailLimpio,
      password: usuarioForm.password,
      empleadoId: Number(usuarioForm.empleadoId),
    });
  };

  const handleUpdateRoles = () => {
    if (!selectedUserId || selectedRoles.length === 0) {
      toast.error("Selecciona un usuario y al menos un rol");
      return;
    }
    // Convertir roles a minúsculas y limpiar espacios antes de enviarlos
    const rolesEnMinusculas = selectedRoles
      .map((role) => role.trim().toLowerCase())
      .filter((role) => role.length > 0);

    // Validar que los roles sean válidos - solo vendedor puede ser asignado desde aquí
    const rolesValidos = ["vendedor"];
    const rolesInvalidos = rolesEnMinusculas.filter(
      (role) => !rolesValidos.includes(role)
    );

    if (rolesInvalidos.length > 0) {
      toast.error(
        `Solo se puede asignar el rol vendedor desde esta sección. Roles inválidos: ${rolesInvalidos.join(", ")}`
      );
      return;
    }

    updateRolesMutation.mutate({
      userId: selectedUserId,
      roles: rolesEnMinusculas,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-muted-foreground">
          Gestiona usuarios y roles del sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Crear Empleado */}
        <Card className="card-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>Crear Empleado</CardTitle>
            </div>
            <CardDescription>
              Registra un nuevo empleado en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEmpleado} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primerNombre">Primer Nombre *</Label>
                <Input
                  id="primerNombre"
                  type="text"
                  placeholder="Juan"
                  value={empleadoForm.primerNombre}
                  onChange={(e) =>
                    setEmpleadoForm({
                      ...empleadoForm,
                      primerNombre: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primerApellido">Primer Apellido *</Label>
                <Input
                  id="primerApellido"
                  type="text"
                  placeholder="Pérez"
                  value={empleadoForm.primerApellido}
                  onChange={(e) =>
                    setEmpleadoForm({
                      ...empleadoForm,
                      primerApellido: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder="0010606051003H"
                  value={empleadoForm.cedula}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Eliminar espacios y caracteres especiales
                    value = value.replace(/[^0-9A-Za-z]/g, "");

                    // Separar números y letras
                    const numbers = value.match(/[0-9]/g)?.join("") || "";
                    const letters = value.match(/[A-Za-z]/g)?.join("") || "";

                    // Si hay menos de 13 números, solo permitir números (no letras)
                    if (numbers.length < 13) {
                      value = numbers;
                    }
                    // Si hay exactamente 13 números, permitir números + letras (solo letras después)
                    else if (numbers.length === 13) {
                      // Convertir letras a mayúsculas
                      const upperLetters = letters.toUpperCase();
                      // Solo permitir una letra después de los 13 números
                      value = numbers + upperLetters.slice(0, 1);
                    }
                    // Si hay más de 13 números, mantener solo los primeros 13 + letras
                    else {
                      const first13Numbers = numbers.slice(0, 13);
                      const upperLetters = letters.toUpperCase();
                      value = first13Numbers + upperLetters.slice(0, 1);
                    }

                    setEmpleadoForm({ ...empleadoForm, cedula: value });
                  }}
                  required
                  pattern="[0-9]{13}[A-Z]"
                  title="Formato: 13 números seguidos de 1 letra (ejemplo: 0010606051003H)"
                />
                {empleadoForm.cedula && empleadoForm.cedula.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {empleadoForm.cedula.length < 14
                      ? `Faltan ${14 - empleadoForm.cedula.length} caracteres`
                      : /^[0-9]{13}[A-Z]$/.test(empleadoForm.cedula)
                      ? "✓ Formato correcto"
                      : "Formato: 13 números + 1 letra"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    +505
                  </div>
                  <Input
                    id="telefono"
                    type="tel"
                    inputMode="numeric"
                    placeholder="83895193"
                    value={empleadoForm.telefono}
                    onChange={(e) => handleTelefonoChange(e.target.value)}
                    className="pl-14"
                    maxLength={8}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Managua, Nicaragua"
                  value={empleadoForm.direccion}
                  onChange={(e) =>
                    setEmpleadoForm({
                      ...empleadoForm,
                      direccion: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createEmpleadoMutation.isPending}
              >
                {createEmpleadoMutation.isPending
                  ? "Creando..."
                  : "Crear Empleado"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Registrar Usuario para Empleado */}
        <Card className="card-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <CardTitle>Crear Usuario</CardTitle>
            </div>
            <CardDescription>
              Crea un usuario para un empleado existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterUsuario} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="empleado@empresa.com"
                  value={usuarioForm.email}
                  onChange={(e) =>
                    setUsuarioForm({ ...usuarioForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ClaveTemporal123"
                    value={usuarioForm.password}
                    onChange={(e) =>
                      setUsuarioForm({
                        ...usuarioForm,
                        password: e.target.value,
                      })
                    }
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empleadoId">Empleado *</Label>
                <Select
                  value={usuarioForm.empleadoId}
                  onValueChange={(value) =>
                    setUsuarioForm({ ...usuarioForm, empleadoId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEmpleados ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : empleados && empleados.length > 0 ? (
                      (() => {
                        // Filtrar solo empleados que NO tienen usuario asociado
                        const empleadosSinUsuario = empleados.filter(
                          (empleado: any) => !empleado.user || !empleado.user.id
                        );
                        return empleadosSinUsuario.length > 0 ? (
                          empleadosSinUsuario.map((empleado: any) => (
                            <SelectItem
                              key={empleado.idEmpleado}
                              value={empleado.idEmpleado.toString()}
                            >
                              {empleado.primerNombre} {empleado.primerApellido}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-empleados" disabled>
                            Todos los empleados ya tienen usuario
                          </SelectItem>
                        );
                      })()
                    ) : (
                      <SelectItem value="no-empleados" disabled>
                        No hay empleados disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  registerUsuarioMutation.isPending || !usuarioForm.empleadoId
                }
              >
                {registerUsuarioMutation.isPending
                  ? "Creando..."
                  : "Crear Usuario"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Actualizar Roles */}
        <Card className="card-elegant">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Actualizar Roles</CardTitle>
            </div>
            <CardDescription>
              Cambia los roles de un usuario existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Usuario</Label>
              <Select
                value={selectedUserId}
                onValueChange={(value) => {
                  setSelectedUserId(value);
                  // Cargar roles del usuario seleccionado y convertirlos a minúsculas
                  const user = users?.find((u: any) => u.id === value);
                  if (user?.roles) {
                    const roles = Array.isArray(user.roles) ? user.roles : [];
                    // Solo mostrar vendedor como opción asignable
                    const rolesValidos = ["vendedor"];
                    // Convertir a minúsculas, limpiar espacios y filtrar solo roles válidos
                    const rolesFiltrados = roles
                      .map((role: string) => String(role).trim().toLowerCase())
                      .filter((role: string) => rolesValidos.includes(role));
                    setSelectedRoles(rolesFiltrados);
                  } else {
                    setSelectedRoles([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      Cargando usuarios...
                    </SelectItem>
                  ) : users && users.length > 0 ? (
                    users.map((user: any) => {
                      const empleadoName = user.empleado
                        ? `${user.empleado.primerNombre || ""} ${
                            user.empleado.primerApellido || ""
                          }`.trim()
                        : "";
                      const rolesText =
                        user.roles && user.roles.length > 0
                          ? user.roles.join(", ")
                          : "Sin roles";
                      const displayText = empleadoName
                        ? `${user.email} - ${empleadoName} (${rolesText})`
                        : `${user.email} (${rolesText})`;
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          {displayText}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-users" disabled>
                      No hay usuarios disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedUserId && (
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {["vendedor"].map((role) => {
                    const roleLower = role.toLowerCase();
                    return (
                      <div
                        key={roleLower}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={roleLower}
                          checked={selectedRoles.includes(roleLower)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles([...selectedRoles, roleLower]);
                            } else {
                              setSelectedRoles(
                                selectedRoles.filter((r) => r !== roleLower)
                              );
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor={roleLower}
                          className="font-normal cursor-pointer"
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <Button
              onClick={handleUpdateRoles}
              className="w-full"
              disabled={updateRolesMutation.isPending || !selectedUserId}
            >
              {updateRolesMutation.isPending
                ? "Actualizando..."
                : "Actualizar Roles"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empleados */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Empleados</CardTitle>
          </div>
          <CardDescription>Lista de empleados del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEmpleados ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando empleados...
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <CustomSearchControl
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onKeyDown={setSearchTerm}
                    placeholder="Buscar por nombre, apellido, cédula, teléfono, email o estado"
                    className="pl-10"
                    ariaLabel="Buscar empleados"
                    clearable
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpleados?.map((empleado) => {
                    // Buscar el usuario asociado a este empleado
                    // Intentar diferentes formas de relacionar el empleado con el usuario
                    const associatedUser = users?.find((user: any) => {
                      if (!user.empleado) return false;
                      // Verificar por idEmpleado directo
                      if (user.empleado.idEmpleado === empleado.idEmpleado)
                        return true;
                      // Verificar por id
                      if (user.empleado.id === empleado.idEmpleado) return true;
                      // Verificar por nombre y apellido (fallback)
                      const userNombre = `${user.empleado.primerNombre || ""} ${
                        user.empleado.primerApellido || ""
                      }`.trim();
                      const empleadoNombre =
                        `${empleado.primerNombre} ${empleado.primerApellido}`.trim();
                      return (
                        userNombre === empleadoNombre && userNombre.length > 0
                      );
                    });
                    const email =
                      associatedUser?.email || empleado.correo || "—";
                    const roles = associatedUser?.roles || [];

                    return (
                      <TableRow key={empleado.idEmpleado}>
                        <TableCell>{empleado.primerNombre}</TableCell>
                        <TableCell>{empleado.primerApellido}</TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell>
                          {roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {roles.map((role: string) => (
                                <Badge
                                  key={role}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{empleado.telefono || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              empleado.activo === EstadoActivo.ACTIVO
                                ? "default"
                                : "secondary"
                            }
                          >
                            {empleado.activo === EstadoActivo.ACTIVO
                              ? "Activo"
                              : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/admin/administracion/empleados/${empleado.idEmpleado}/editar`
                                )
                              }
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteEmpleado(empleado.idEmpleado)
                              }
                              disabled={
                                deleteEmpleadoMutation.isPending ||
                                empleado.activo === EstadoActivo.INACTIVO
                              }
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredEmpleados.length === 0 && debouncedSearch && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron empleados que coincidan con la búsqueda
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
