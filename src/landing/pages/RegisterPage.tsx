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
import { useAuthStore } from '@/auth/store/auth.store';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
    ruc: '',
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

  // Formatear RUC automáticamente (1234567-8)
  const formatRUC = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, '');

    // Aplicar formato: 1234567-8
    if (numbers.length <= 7) {
      return numbers;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 7)}-${numbers.slice(7)}`;
    } else {
      // Limitar a 8 dígitos
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 8)}`;
    }
  };

  const handleRUCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRUC(e.target.value);
    setFormData((prev) => ({
      ...prev,
      ruc: formatted,
    }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      telefono: value || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setLoading(true);

    try {
      // Preparar clienteData
      const clienteData = {
        primerNombre: formData.primerNombre,
        primerApellido: formData.primerApellido,
        ruc: formData.ruc,
        direccion: formData.direccion,
        telefono: formData.telefono,
      };

      await registerAction({
        email: formData.email,
        password: formData.password,
        clienteData,
      });

      const authStore = useAuthStore.getState();
      const loginOk = await authStore.login(formData.email, formData.password);
      if (loginOk) {
        const updatedAuthStore = useAuthStore.getState();
        const cliente = updatedAuthStore.user?.cliente;
        const token = updatedAuthStore.token;

        if (cliente && token) {
          setAuth(token, {
            id: Number(updatedAuthStore.user?.id) || 0,
            email: formData.email,
            clienteId: cliente.idCliente,
            nombre:
              [cliente.primerNombre, cliente.primerApellido]
                .filter(Boolean)
                .join(' ') || cliente.ruc,
          });
        }
      }

      toast.success('Registro exitoso');
      navigate(redirect);
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

    // Si es RUC, usar el formateador especial
    if (id === 'ruc') {
      const formatted = formatRUC(value);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC *</Label>
                  <Input
                    id="ruc"
                    placeholder="1234567-8"
                    value={formData.ruc}
                    onChange={handleRUCChange}
                    required
                    className="h-10 sm:h-11"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <div className="[&_.PhoneInputInput]:h-10 [&_.PhoneInputInput]:sm:h-11 [&_.PhoneInputInput]:rounded-md [&_.PhoneInputInput]:border [&_.PhoneInputInput]:border-input [&_.PhoneInputInput]:bg-background [&_.PhoneInputInput]:px-3 [&_.PhoneInputInput]:py-2 [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:ring-offset-background [&_.PhoneInputInput]:focus-visible:outline-none [&_.PhoneInputInput]:focus-visible:ring-2 [&_.PhoneInputInput]:focus-visible:ring-ring [&_.PhoneInputInput]:focus-visible:ring-offset-2 [&_.PhoneInputInput]:disabled:cursor-not-allowed [&_.PhoneInputInput]:disabled:opacity-50 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4 [&_.PhoneInputCountrySelect]:h-10 [&_.PhoneInputCountrySelect]:sm:h-11 [&_.PhoneInputCountrySelect]:border [&_.PhoneInputCountrySelect]:border-input [&_.PhoneInputCountrySelect]:bg-background [&_.PhoneInputCountrySelect]:rounded-l-md [&_.PhoneInputCountrySelect]:px-2">
                    <PhoneInput
                      international
                      defaultCountry="NI"
                      value={formData.telefono}
                      onChange={handlePhoneChange}
                      placeholder="Ingresa tu teléfono"
                      required
                    />
                  </div>
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
