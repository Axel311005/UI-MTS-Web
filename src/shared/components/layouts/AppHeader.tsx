// src/shared/components/layouts/AppHeader.tsx

import { User, Sun, Moon, Menu, LogOut } from '@/shared/icons';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { useAuthStore } from '@/auth/store/auth.store';
import { useLandingAuthStore } from '@/landing/store/landing-auth.store';
import { toast } from 'sonner';
import { NotificationCenter } from './NotificationCenter';
import { useNotifications } from '@/shared/hooks/use-notification';
import { useNavigate } from 'react-router';

export const AppHeader = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const logoutLanding = useLandingAuthStore((s) => s.logout);
  const { notifications, markAsRead, markAllAsRead, removeNotification } =
    useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Primero limpiar los stores
    logout();
    logoutLanding();
    toast.success('Sesión cerrada correctamente');
    // Usar window.location para forzar la navegación completa y evitar interceptación de ProtectedRoute
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    navigate('/admin/perfil');
  };

  return (
    <header className="header-glass h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 border-b border-sidebar-border">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Sidebar trigger con icono */}
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Toggle de tema */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="button-hover h-8 w-8 sm:h-9 sm:w-9 p-0"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notificaciones */}
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRemoveNotification={removeNotification}
        />

        {/* Avatar con dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="button-hover h-8 w-8 sm:h-9 sm:w-9 p-0">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
