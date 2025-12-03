import { useEffect, useState } from 'react';
import { useAuthStore } from '@/auth/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { User, Mail, Shield, Building2, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTokenExpirationDate, getTokenIssuedAt, getTokenTimeRemaining } from '@/shared/utils/tokenUtils';

export default function PerfilPage() {
  const { user } = useAuthStore();
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [issuedAt, setIssuedAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Calcular información del token solo una vez al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const expDate = getTokenExpirationDate(token);
      const iat = getTokenIssuedAt(token);
      const remaining = getTokenTimeRemaining(token);
      
      setExpirationDate(expDate);
      setIssuedAt(iat);
      setTimeRemaining(remaining);
    }
  }, []); // Solo ejecutar una vez al montar

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">No hay información de usuario disponible</p>
      </div>
    );
  }

  // Determinar el nombre completo
  const getNombreCompleto = () => {
    // Si hay empleado
    if (user.empleado) {
      if (user.empleado.nombreCompleto) {
        return user.empleado.nombreCompleto;
      }
      // Construir desde primerNombre y primerApellido
      const nombres = [
        user.empleado.primerNombre,
        user.empleado.primerApellido,
      ].filter(Boolean);
      if (nombres.length > 0) {
        return nombres.join(' ');
      }
    }
    // Si hay cliente
    if (user.cliente) {
      // Construir desde primerNombre y primerApellido si están disponibles
      const nombres = [
        user.cliente.primerNombre,
        user.cliente.primerApellido,
      ].filter(Boolean);
      if (nombres.length > 0) {
        return nombres.join(' ');
      }
      // Fallback al RUC si no hay nombres
      if (user.cliente.ruc) {
        return user.cliente.ruc;
      }
    }
    // Fallback al email
    return user.email?.split('@')[0] || 'Usuario';
  };

  const nombreCompleto = getNombreCompleto();

  // Determinar los roles
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasPanelAccess = roles.some(role => 
    ['gerente', 'vendedor', 'superuser'].includes(role.toLowerCase())
  );

  // Obtener información del empleado si existe
  const empleadoInfo = user.empleado;
  const clienteInfo = user.cliente;

  // Estado activo
  const isActive = user.isActive !== undefined ? user.isActive : true;

  // Formatear tiempo restante
  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Sesión expirada';
    
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Información de tu cuenta y perfil
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                  {nombreCompleto.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <CardTitle className="text-2xl sm:text-3xl">{nombreCompleto}</CardTitle>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                      <Shield className="h-3 w-3 mr-1" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            {/* Información de cuenta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Información de Cuenta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{user.email || 'No disponible'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-medium text-green-500">Activo</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm font-medium text-destructive">Inactivo</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Acceso al Panel</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {hasPanelAccess ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Usuario</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {empleadoInfo ? 'Empleado' : clienteInfo ? 'Cliente' : 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Empleado */}
            {empleadoInfo && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información del Empleado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="text-sm font-medium">
                        {empleadoInfo.nombreCompleto || 
                         [empleadoInfo.primerNombre, empleadoInfo.primerApellido]
                           .filter(Boolean)
                           .join(' ') || 
                         'No disponible'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Información del Cliente */}
            {clienteInfo && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="text-sm font-medium">
                        {[
                          clienteInfo.primerNombre,
                          clienteInfo.primerApellido,
                        ]
                          .filter(Boolean)
                          .join(' ') || clienteInfo.ruc || 'No disponible'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Tipo de Cliente</p>
                      <p className="text-sm font-medium">Cliente</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Información de Sesión */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Información de Sesión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issuedAt && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Inicio de Sesión</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {issuedAt.toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {expirationDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Expiración de Sesión</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {expirationDate.toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Restante</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className={`text-sm font-medium ${
                      timeRemaining < 300000 ? 'text-destructive' : 
                      timeRemaining < 600000 ? 'text-orange-500' : 
                      'text-green-600'
                    }`}>
                      {formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nota informativa - Solo para vendedores */}
            {roles.some(role => role.toLowerCase() === 'vendedor') && 
             !roles.some(role => ['gerente', 'superuser'].includes(role.toLowerCase())) && (
              <>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Para actualizar tu información de contacto, por favor contacta con el gerente del sistema.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

