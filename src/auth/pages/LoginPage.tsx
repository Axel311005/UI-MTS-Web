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
import { useLocation, useNavigate, Link } from 'react-router';
import { useAuthStore } from '../store/auth.store';
import { useLandingAuthStore } from '@/landing/store/landing-auth.store';

export default function LoginPage() {
  const [isPosting, setIsPosting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  const login = useAuthStore((s) => s.login);
  const setLandingAuth = useLandingAuthStore((s) => s.setAuth);

  // Validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  };

  // Sanitizar input
  const sanitizeInput = (input: string): string => {
    return input.trim().slice(0, 500); // Limitar longitud
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Rate limiting básico: máximo 5 intentos por minuto
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (timeSinceLastAttempt < 60000) { // 1 minuto
      if (loginAttempts >= 5) {
        toast.error('Demasiados intentos. Por favor espera un minuto.', {
          position: 'top-right',
        });
        return;
      }
    } else {
      setLoginAttempts(0); // Resetear contador después de 1 minuto
    }

    setIsPosting(true);
    const formData = new FormData(event.currentTarget);
    let email = formData.get('email') as string;
    let password = formData.get('password') as string;

    // Sanitizar inputs
    email = sanitizeInput(email);
    password = sanitizeInput(password);

    // Validaciones
    if (!email || email.length === 0) {
      toast.error('El correo electrónico es requerido', {
        position: 'top-right',
      });
      setIsPosting(false);
      return;
    }

    if (!validateEmail(email)) {
      toast.error('El correo electrónico no es válido', {
        position: 'top-right',
      });
      setIsPosting(false);
      return;
    }

    if (!password || password.length < 4) {
      toast.error('La contraseña debe tener al menos 4 caracteres', {
        position: 'top-right',
      });
      setIsPosting(false);
      return;
    }

    if (password.length > 128) {
      toast.error('La contraseña es demasiado larga', {
        position: 'top-right',
      });
      setIsPosting(false);
      return;
    }

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
          const userName = user || 'Usuario';
          toast.success(`Inicio de sesión exitoso. Bienvenido ${userName}`, {
            position: 'top-right',
          });
          const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
          navigate(from, { replace: true });
        } else if (cliente && token) {
          const clienteId = (cliente as any).id || cliente.idCliente;
          const clienteNombre = 
            (cliente as any).nombreCompleto ||
            [cliente.primerNombre, cliente.primerApellido]
              .filter(Boolean)
              .join(' ') || 
            cliente.ruc || 
            'Cliente';
          setLandingAuth(token, {
            id: Number(authStore.user?.id) || 0,
            email: email,
            clienteId: clienteId,
            nombre: clienteNombre,
          });
          toast.success(`Bienvenido ${clienteNombre}`, {
            position: 'top-right',
          });
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          toast.error(
            'Tu cuenta no tiene permisos para acceder al sistema.',
            { position: 'top-right' }
          );
          useAuthStore.getState().logout();
          const currentPath = location.pathname;
          navigate(currentPath, { replace: true });
        }
      } else {
        setLoginAttempts(prev => prev + 1);
        setLastAttemptTime(Date.now());
        toast.error('Error al iniciar sesión. Verifica tus credenciales.', {
          position: 'top-right',
        });
      }
    } catch (error: any) {
      setLoginAttempts(prev => prev + 1);
      setLastAttemptTime(Date.now());
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

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6">
      <Card className="w-full max-w-md card-elegant">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription className="text-sm sm:text-base">
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
                className="h-10 sm:h-11"
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
                  className="pr-10 h-10 sm:h-11"
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
            <div className="flex items-center justify-between text-xs sm:text-sm">
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
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="text-primary hover:underline font-semibold"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
