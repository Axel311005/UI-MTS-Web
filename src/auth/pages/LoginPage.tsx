import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../store/auth.store';
import { useLandingAuthStore } from '@/landing/store/landing-auth.store';

export default function LoginPage() {
  const [isPosting, setIsPosting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const setLandingAuth = useLandingAuthStore((s) => s.setAuth);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPosting(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const ok = await login(email, password);
      if (ok) {
        const authStore = useAuthStore.getState();
        const hasPanelAccess = authStore.hasPanelAccess();
        const empleado = authStore.user?.empleado;
        const cliente = authStore.user?.cliente;
        const token = authStore.token;
        
        const user = empleado
          ? empleado.nombreCompleto ||
            [empleado.primerNombre, empleado.primerApellido]
              .filter(Boolean)
              .join(' ')
          : cliente
          ? [cliente.primerNombre, cliente.primerApellido]
              .filter(Boolean)
              .join(' ') || cliente.ruc
          : 'Usuario';

        if (hasPanelAccess) {
          // Usuario con acceso al panel (gerente, vendedor, superuser)
          const userName = user || 'Usuario';
          toast.success(`Inicio de sesión exitoso. Bienvenido ${userName}`, {
            position: 'top-right',
          });
          const from = (location.state as any)?.from?.pathname || '/admin/facturas';
          navigate(from, { replace: true });
        } else if (cliente && token) {
          // Usuario cliente - redirigir a landing y actualizar landing auth
          // El API puede devolver cliente.id o cliente.idCliente
          const clienteId = (cliente as any).id || cliente.idCliente;
          const clienteNombre = 
            (cliente as any).nombreCompleto ||
            [cliente.primerNombre, cliente.primerApellido]
              .filter(Boolean)
              .join(' ') || 
            cliente.ruc || 
            'Cliente';
          console.log('🔐 Login - Cliente objeto:', cliente);
          console.log('🔐 Login - ClienteId extraído:', clienteId);
          console.log('🔐 Login - Token recibido:', token ? 'Token presente' : 'Token ausente');
          console.log('🔐 Login - Token completo:', token);
          setLandingAuth(token, {
            id: Number(authStore.user?.id) || 0,
            email: email,
            clienteId: clienteId,
            nombre: clienteNombre,
          });
          // Verificar que se guardó en localStorage
          const savedToken = localStorage.getItem('token');
          console.log('🔐 Login - Token guardado en localStorage:', savedToken ? 'Sí' : 'No');
          console.log('🔐 Login - Token guardado completo:', savedToken);
          toast.success(`Bienvenido ${clienteNombre}`, {
            position: 'top-right',
          });
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          // Usuario sin rol válido
          toast.error(
            'Tu cuenta no tiene permisos para acceder al sistema.',
            { position: 'top-right' }
          );
          useAuthStore.getState().logout();
          const currentPath = location.pathname;
          navigate(currentPath, { replace: true });
        }
      } else {
        toast.error('Error al iniciar sesión. Verifica tus credenciales.', {
          position: 'top-right',
        });
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión. Verifica tus credenciales.';
      toast.error(errorMessage, {
        position: 'top-right',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md card-elegant">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-muted-foreground">Recordarme</span>
              </label>
              <a className="text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPosting}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
