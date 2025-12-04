import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
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
  const location = useLocation();

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

  const handleInicioClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Si ya estamos en la página principal, hacer scroll al hero
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const navbarHeight = 80; // Altura aproximada del navbar
        const heroPosition = heroElement.offsetTop - navbarHeight;
        window.scrollTo({ top: heroPosition, behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra página, navegar y luego hacer scroll
      navigate('/');
      setTimeout(() => {
        const heroElement = document.getElementById('hero');
        if (heroElement) {
          const navbarHeight = 80; // Altura aproximada del navbar
          const heroPosition = heroElement.offsetTop - navbarHeight;
          window.scrollTo({ top: heroPosition, behavior: 'smooth' });
        }
      }, 300);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-neutral-200/60 shadow-sm">
      {/* Main nav */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          <Link to="/" className="flex items-center">
            <motion.img
              src="/logo-mts-trans.png"
              alt="MTS - Taller de Motos - Logo"
              className="h-14 sm:h-18 md:h-24 lg:h-28 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              onClick={handleInicioClick}
              className="text-neutral-800 hover:text-orange-600 transition-colors font-semibold text-sm uppercase tracking-wide relative group font-montserrat"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="text-neutral-800 hover:text-orange-600 transition-colors font-semibold text-sm uppercase tracking-wide relative group font-montserrat"
                >
                  Seguimiento
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/cotizacion"
                  className="text-neutral-800 hover:text-orange-600 transition-colors font-semibold text-sm uppercase tracking-wide relative group font-montserrat"
                >
                  Cotización
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/cita"
                  className="text-neutral-800 hover:text-orange-600 transition-colors font-semibold text-sm uppercase tracking-wide relative group font-montserrat"
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
                      className="flex items-center gap-2 px-3 py-1 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors"
                    >
                      <User className="h-4 w-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700">
                        {user?.nombre || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white border border-neutral-200 text-neutral-700 font-montserrat shadow-xl"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900">
                          {user?.nombre || 'Cliente'}
                        </span>
                        {user?.email && (
                          <span className="text-xs text-neutral-500">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>

                    {/* 4. Separador: Color añadido para que sea visible en fondo oscuro */}
                    <DropdownMenuSeparator className="bg-neutral-200" />

                    {/* Esta parte ya estaba perfecta */}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-neutral-700 focus:bg-neutral-50 focus:text-orange-600 cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:text-orange-600 font-montserrat"
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
                  className="border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-orange-500 hover:text-orange-600 bg-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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
            className="md:hidden p-2 text-black"
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
            className="md:hidden py-4 space-y-4 border-t border-neutral-200 bg-white"
          >
            <Link
              to="/"
              onClick={handleInicioClick}
              className="block text-neutral-700 hover:text-orange-600 transition-colors uppercase text-sm font-medium"
            >
              Inicio
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="block text-neutral-700 hover:text-orange-600 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seguimiento
                </Link>
                <Link
                  to="/cotizacion"
                  className="block text-neutral-700 hover:text-orange-600 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cotización
                </Link>
                <Link
                  to="/cita"
                  className="block text-neutral-700 hover:text-orange-600 transition-colors uppercase text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cita
                </Link>
                <div className="pt-4 border-t border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-black">
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
                  className="w-full border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-orange-500 hover:text-orange-600 bg-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg min-h-[44px] touch-manipulation"
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
