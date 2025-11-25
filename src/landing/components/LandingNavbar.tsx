import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useLandingAuthStore } from '../store/landing-auth.store';
import { useAuthStore } from '@/auth/store/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isAuthenticated: landingIsAuthenticated,
    user: landingUser,
    logout,
  } = useLandingAuthStore();
  const authUser = useAuthStore((s) => s.user);
  const logoutPanel = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Obtener usuario desde landingUser o desde authUser como fallback
  const user =
    landingUser ||
    (authUser?.cliente
      ? {
          id: Number(authUser.id) || 0,
          email: authUser.email || '',
          clienteId: authUser.cliente.id || authUser.cliente.idCliente || 0,
          nombre:
            authUser.cliente.nombreCompleto ||
            (authUser.cliente.primerNombre
              ? `${authUser.cliente.primerNombre} ${
                  authUser.cliente.primerApellido || ''
                }`.trim()
              : null) ||
            authUser.cliente.ruc ||
            'Cliente',
        }
      : null);

  const isAuthenticated = landingIsAuthenticated || !!authUser?.cliente;

  const handleLogout = () => {
    logout();
    // También limpiar el auth store del panel si está activo
    logoutPanel();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-orange-500/20">
      {/* Top bar */}
      <div className="bg-black border-b border-orange-500/10">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
          <div className="flex items-center justify-end h-8"></div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center">
            <motion.img
              src="/logo-mts-trans.png"
              alt="MTS - Taller de Motos - Logo"
              className="w-auto"
              style={{ height: '115px' }} // puedes ajustar el valor aquí
              whileHover={{ scale: 1.05 }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide relative group font-montserrat"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="text-white hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide relative group font-montserrat"
                >
                  Seguimiento
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/cotizacion"
                  className="text-white hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide relative group font-montserrat"
                >
                  Cotización
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/cita"
                  className="text-white hover:text-orange-500 transition-colors font-medium text-sm uppercase tracking-wide relative group font-montserrat"
                >
                  Cita
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* Este botón ya estaba perfecto para tu tema oscuro */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/20"
                    >
                      <User className="h-4 w-4 text-white" />
                      <span className="text-sm text-white">
                        {user?.nombre || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-black border border-zinc-800 text-gray-200 font-montserrat"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">
                          {user?.nombre || 'Cliente'}
                        </span>
                        {user?.email && (
                          /* 3. Cabecera: Texto de email cambiado de negro/60 a gris oscuro */
                          <span className="text-xs text-gray-400">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>

                    {/* 4. Separador: Color añadido para que sea visible en fondo oscuro */}
                    <DropdownMenuSeparator className="bg-zinc-700" />

                    {/* Esta parte ya estaba perfecta */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-gray-200 focus:bg-orange-500/10 focus:text-orange-600 cursor-pointer transition-all duration-200 hover:bg-orange-500/10 hover:text-orange-600 font-montserrat"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="font-medium">Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="border-2 border-white/60 text-white hover:bg-orange-500/20 hover:border-orange-500 hover:text-orange-400 bg-transparent font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/50 transition-all duration-200"
                  onClick={() => navigate('/register')}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-orange-500/20 bg-black"
          >
            <Link
              to="/"
              className="block text-white hover:text-orange-500 transition-colors uppercase text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="block text-white hover:text-orange-500 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seguimiento
                </Link>
                <Link
                  to="/cotizacion"
                  className="block text-white hover:text-orange-500 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cotización
                </Link>
                <Link
                  to="/cita"
                  className="block text-white hover:text-orange-500 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cita
                </Link>
                <div className="pt-4 border-t border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-white" />
                    <span className="text-sm text-white">
                      {user?.nombre || user?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Salir
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-orange-500/20 space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-2 border-white/70 text-white hover:bg-orange-500/20 hover:border-orange-500 hover:text-orange-400 bg-transparent font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-500/30 min-h-[44px] touch-manipulation"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/50 transition-all duration-200 min-h-[44px] touch-manipulation"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
