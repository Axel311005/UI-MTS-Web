import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { toast } from 'sonner';
import { tallerApi } from '@/shared/api/tallerApi';
import { useEmpleado } from '@/empleados/hook/useEmpleado';
import { UserPlus, Shield, Users, UserCheck } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmpleadoAction, type CreateEmpleadoPayload } from '@/empleados/actions/post-empleado';
import { EstadoActivo } from '@/shared/types/status';

interface RegisterEmployeePayload {
  email: string;
  password: string;
  empleadoId: number;
}


export default function AdministracionPage() {
  const queryClient = useQueryClient();
  const { empleados, isLoading: isLoadingEmpleados } = useEmpleado({ usePagination: false });
  
  // Form para crear empleado
  const [empleadoForm, setEmpleadoForm] = useState<CreateEmpleadoPayload>({
    primerNombre: '',
    primerApellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
    activo: EstadoActivo.ACTIVO,
  });

  // Form para crear usuario
  const [usuarioForm, setUsuarioForm] = useState({
    email: '',
    password: '',
    empleadoId: '',
  });

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Crear empleado
  const createEmpleadoMutation = useMutation({
    mutationFn: createEmpleadoAction,
    onSuccess: (data) => {
      toast.success('Empleado creado correctamente');
      setEmpleadoForm({
        primerNombre: '',
        primerApellido: '',
        cedula: '',
        telefono: '',
        direccion: '',
        activo: EstadoActivo.ACTIVO,
      });
      // Auto-seleccionar el empleado recién creado en el formulario de usuario
      if (data?.idEmpleado) {
        setUsuarioForm((prev) => ({ ...prev, empleadoId: String(data.idEmpleado) }));
      }
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear empleado';
      toast.error(message);
    },
  });

  // Registrar usuario para empleado
  const registerUsuarioMutation = useMutation({
    mutationFn: async (payload: RegisterEmployeePayload) => {
      const { data } = await tallerApi.post('/auth/register/employee', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
      setUsuarioForm({ email: '', password: '', empleadoId: '' });
      queryClient.invalidateQueries({ queryKey: ['empleados', 'users'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear usuario';
      toast.error(message);
    },
  });

  // Obtener usuarios
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data } = await tallerApi.get('/auth/users');
        return data || [];
      } catch (error: any) {
        // Si el endpoint no existe, retornar array vacío
        if (error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Actualizar roles
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
      const { data } = await tallerApi.patch(`/auth/users/${userId}/roles`, { roles });
      return data;
    },
    onSuccess: () => {
      toast.success('Roles actualizados correctamente');
      setSelectedUserId('');
      setSelectedRoles([]);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al actualizar roles';
      toast.error(message);
    },
  });

  const handleCreateEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoForm.primerNombre || !empleadoForm.primerApellido || !empleadoForm.cedula || !empleadoForm.telefono || !empleadoForm.direccion) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    createEmpleadoMutation.mutate({
      ...empleadoForm,
      activo: EstadoActivo.ACTIVO, // Siempre ACTIVO por defecto
    });
  };

  const handleRegisterUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioForm.email || !usuarioForm.password || !usuarioForm.empleadoId) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    registerUsuarioMutation.mutate({
      email: usuarioForm.email,
      password: usuarioForm.password,
      empleadoId: Number(usuarioForm.empleadoId),
    });
  };

  const handleUpdateRoles = () => {
    if (!selectedUserId || selectedRoles.length === 0) {
      toast.error('Selecciona un usuario y al menos un rol');
      return;
    }
    updateRolesMutation.mutate({
      userId: selectedUserId,
      roles: selectedRoles,
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
                    setEmpleadoForm({ ...empleadoForm, primerNombre: e.target.value })
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
                    setEmpleadoForm({ ...empleadoForm, primerApellido: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder="1-1234-5678"
                  value={empleadoForm.cedula}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, cedula: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="text"
                  placeholder="50583895193"
                  value={empleadoForm.telefono}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, telefono: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Managua, Nicaragua"
                  value={empleadoForm.direccion}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, direccion: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createEmpleadoMutation.isPending}
              >
                {createEmpleadoMutation.isPending ? 'Creando...' : 'Crear Empleado'}
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
                <Input
                  id="password"
                  type="password"
                  placeholder="ClaveTemporal123"
                  value={usuarioForm.password}
                  onChange={(e) =>
                    setUsuarioForm({ ...usuarioForm, password: e.target.value })
                  }
                  required
                />
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
                      empleados.map((empleado) => (
                        <SelectItem
                          key={empleado.idEmpleado}
                          value={empleado.idEmpleado.toString()}
                        >
                          {empleado.primerNombre} {empleado.primerApellido}
                        </SelectItem>
                      ))
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
                disabled={registerUsuarioMutation.isPending || !usuarioForm.empleadoId}
              >
                {registerUsuarioMutation.isPending ? 'Creando...' : 'Crear Usuario'}
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
                  // Cargar roles del usuario seleccionado
                  const user = users?.find((u: any) => u.id === value);
                  if (user?.roles) {
                    setSelectedRoles(Array.isArray(user.roles) ? user.roles : []);
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
                        ? `${user.empleado.primerNombre || ''} ${user.empleado.primerApellido || ''}`.trim()
                        : '';
                      const rolesText = user.roles && user.roles.length > 0
                        ? user.roles.join(', ')
                        : 'Sin roles';
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
                  {['vendedor', 'gerente'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={role}
                        checked={selectedRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role]);
                          } else {
                            setSelectedRoles(selectedRoles.filter((r) => r !== role));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={role} className="font-normal cursor-pointer">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleUpdateRoles}
              className="w-full"
              disabled={updateRolesMutation.isPending || !selectedUserId}
            >
              {updateRolesMutation.isPending ? 'Actualizando...' : 'Actualizar Roles'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuarios */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Usuarios del Sistema</CardTitle>
          </div>
          <CardDescription>
            Lista de usuarios con sus roles y empleados asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>ID Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      {user.empleado
                        ? `${user.empleado.primerNombre || ''} ${user.empleado.primerApellido || ''}`.trim() || '—'
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role: string) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin roles</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay usuarios registrados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Empleados */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Empleados</CardTitle>
          </div>
          <CardDescription>
            Lista de empleados del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEmpleados ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando empleados...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados?.map((empleado) => (
                  <TableRow key={empleado.idEmpleado}>
                    <TableCell>{empleado.idEmpleado}</TableCell>
                    <TableCell>{empleado.primerNombre}</TableCell>
                    <TableCell>{empleado.primerApellido}</TableCell>
                    <TableCell>{empleado.correo || '—'}</TableCell>
                    <TableCell>{empleado.telefono || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

