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
  const { isAuthenticated, user, logout } = useLandingAuthStore();
  const logoutPanel = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // También limpiar el auth store del panel si está activo
    logoutPanel();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent"
            >
              MST MTS
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-slate-700 hover:text-orange-500 transition-colors"
            >
              Inicio
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="text-slate-700 hover:text-orange-500 transition-colors"
                >
                  Seguimiento
                </Link>
                <Link
                  to="/cotizacion"
                  className="text-slate-700 hover:text-orange-500 transition-colors"
                >
                  Cotización
                </Link>
                <Link
                  to="/cita"
                  className="text-slate-700 hover:text-orange-500 transition-colors"
                >
                  Cita
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full"
                    >
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        {user?.nombre || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {user?.nombre || 'Cliente'}
                        </span>
                        {user?.email && (
                          <span className="text-xs text-slate-500">
                            {user.email}
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-slate-700 focus:bg-gradient-to-r focus:from-orange-50 focus:to-pink-50 focus:text-orange-600 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
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
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  onClick={() => navigate('/register')}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
            className="md:hidden py-4 space-y-4 border-t border-slate-200"
          >
            <Link
              to="/"
              className="block text-slate-700 hover:text-orange-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/seguimiento"
                  className="block text-slate-700 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Seguimiento
                </Link>
                <Link
                  to="/cotizacion"
                  className="block text-slate-700 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cotización
                </Link>
                <Link
                  to="/cita"
                  className="block text-slate-700 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cita
                </Link>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700">
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
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
