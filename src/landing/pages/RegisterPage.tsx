import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { registerAction } from '../actions/auth.actions';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, isAuthenticated } = useLandingAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    primerNombre: '',
    primerApellido: '',
    direccion: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);

  // Formatear teléfono: solo 8 números (el +505 se agrega automáticamente)
  const formatPhone = (value: string) => {
    // Solo permitir números, máximo 8 dígitos
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      telefono: formatted,
    }));
  };

  // Validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  };

  // Sanitizar texto
  const sanitizeText = (text: string, maxLength: number = 255): string => {
    return text.trim().slice(0, maxLength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitizar todos los inputs
    const emailLimpio = sanitizeText(formData.email, 255).toLowerCase();
    const primerNombreLimpio = sanitizeText(formData.primerNombre, 100);
    const primerApellidoLimpio = sanitizeText(formData.primerApellido, 100);
    const direccionLimpio = sanitizeText(formData.direccion, 200);

    // Validaciones de email
    if (!emailLimpio || !validateEmail(emailLimpio)) {
      toast.error('El correo electrónico no es válido', {
        position: 'top-right',
      });
      return;
    }

    // Validaciones de nombres
    if (!primerNombreLimpio || primerNombreLimpio.length < 2) {
      toast.error('El primer nombre debe tener al menos 2 caracteres', {
        position: 'top-right',
      });
      return;
    }

    if (!primerApellidoLimpio || primerApellidoLimpio.length < 2) {
      toast.error('El primer apellido debe tener al menos 2 caracteres', {
        position: 'top-right',
      });
      return;
    }

    // Validación de teléfono
    if (!formData.telefono || formData.telefono.length !== 8) {
      toast.error('El teléfono debe tener 8 dígitos', {
        position: 'top-right',
      });
      return;
    }

    // Validación de dirección
    if (!direccionLimpio || direccionLimpio.length < 5) {
      toast.error('La dirección debe tener al menos 5 caracteres', {
        position: 'top-right',
      });
      return;
    }

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden', {
        position: 'top-right',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres', {
        position: 'top-right',
      });
      return;
    }

    if (formData.password.length > 128) {
      toast.error('La contraseña es demasiado larga (máximo 128 caracteres)', {
        position: 'top-right',
      });
      return;
    }

    // Validar que la contraseña tenga al menos una letra y un número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        'La contraseña debe contener al menos una letra y un número',
        {
          position: 'top-right',
        }
      );
      return;
    }

    setLoading(true);

    try {
      // Preparar clienteData
      // Convertir teléfono de formato frontend (87781633) a backend (+50587781633)
      // Solo números, todo pegado, con código de país y el signo +
      const telefonoLimpio = formData.telefono.replace(/\D/g, ''); // Solo números
      const telefonoBackend =
        telefonoLimpio.length === 8
          ? `+505${telefonoLimpio}`
          : telefonoLimpio.startsWith('+')
          ? telefonoLimpio
          : `+${telefonoLimpio}`;

      const clienteData = {
        primerNombre: primerNombreLimpio,
        primerApellido: primerApellidoLimpio,
        ruc: null, // RUC siempre null según el backend
        direccion: direccionLimpio,
        telefono: telefonoBackend,
      };

      // 1. Registrar al usuario
      await registerAction({
        email: emailLimpio,
        password: formData.password,
        clienteData,
      });

      // 2. Después del registro exitoso, hacer login automático
      const { loginAction } = await import('../actions/auth.actions');
      const loginResponse = await loginAction({
        email: emailLimpio,
        password: formData.password,
      });

      // 3. El login devuelve directamente { token, id, email, roles, cliente: {...} }
      // Según la respuesta del backend: { id, email, roles, cliente: {...}, token }
      const { token, id, roles, cliente } = loginResponse;

      if (token && cliente) {
        // El backend devuelve cliente.idCliente en la respuesta del login
        const clienteId = cliente.idCliente || cliente.id || 0;
        const clienteNombre =
          cliente.nombreCompleto ||
          [cliente.primerNombre, cliente.primerApellido]
            .filter(Boolean)
            .join(' ') ||
          cliente.ruc ||
          'Cliente';

        // El id del usuario puede ser string (UUID) o number
        const userId = typeof id === 'string' ? id : Number(id) || 0;

        const landingUser = {
          id: userId,
          email: emailLimpio,
          clienteId: Number(clienteId) || 0,
          nombre: clienteNombre,
        };

        // Guardar primero en localStorage para asegurar que esté disponible inmediatamente
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('landing-user', JSON.stringify(landingUser));
        }

        // Actualizar el store de landing
        setAuth(token, landingUser);

        // También sincronizar con el store principal
        try {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: id,
              email: emailLimpio,
              cliente: cliente,
              roles: roles || [],
            })
          );
        } catch (error) {
          console.warn('Error al sincronizar con store principal:', error);
        }

        toast.success(`Registro exitoso. Bienvenido ${clienteNombre}!`, {
          position: 'top-right',
        });

        // Redirigir a la página de destino
        navigate(redirect);
      } else {
        // Si no viene el token o cliente, redirigir al login
        toast.success(
          'Registro exitoso. Por favor, inicia sesión con tus credenciales.',
          {
            position: 'top-right',
            duration: 5000,
          }
        );
        navigate(
          `/login?email=${encodeURIComponent(
            emailLimpio
          )}&redirect=${encodeURIComponent(redirect)}`
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (error instanceof Error ? error.message : undefined) ||
        'Error al registrarse';
      toast.error(message, {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Si es teléfono, usar el formateador especial
    if (id === 'telefono') {
      // Si es teléfono, usar el formateador especial
      const formatted = formatPhone(value);
      setFormData((prev) => ({
        ...prev,
        [id]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-2 sm:p-4 py-8">
      <Card className="w-full max-w-2xl card-elegant my-4">
        <CardHeader className="space-y-2 text-center px-4 sm:px-6">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Completa el formulario para registrarte
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Credenciales */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Credenciales
              </h3>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10 h-10 sm:h-11"
                      value={formData.password}
                      onChange={handleChange}
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
                  <Label htmlFor="confirmPassword">Repetir Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10 h-10 sm:h-11"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primerNombre">Primer Nombre *</Label>
                  <Input
                    id="primerNombre"
                    placeholder="Juan"
                    value={formData.primerNombre}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primerApellido">Primer Apellido *</Label>
                  <Input
                    id="primerApellido"
                    placeholder="Pérez"
                    value={formData.primerApellido}
                    onChange={handleChange}
                    required
                    className="h-10 sm:h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                    +505
                  </div>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="87781633"
                    value={formData.telefono}
                    onChange={handlePhoneChange}
                    required
                    className="h-10 sm:h-11 pl-14"
                    maxLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  placeholder="Av. Principal 123"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  className="h-10 sm:h-11"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full button-hover text-sm sm:text-base"
              size="lg"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-primary hover:underline font-medium"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
