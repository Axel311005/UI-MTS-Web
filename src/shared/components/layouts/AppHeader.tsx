// src/shared/components/layouts/AppHeader.tsx

import { Search, Bell, User, Sun, Moon, Menu, LogOut } from '@/shared/icons';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useAuthStore } from '@/auth/store/auth.store';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export const AppHeader = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/auth/login');
  };

  return (
    <header className="header-glass h-16 flex items-center justify-between px-4 md:px-6 border-b border-sidebar-border">
      <div className="flex items-center space-x-4">
        {/* Sidebar trigger con icono */}
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>

        {/* Barra de búsqueda (oculta en móvil) */}
        <div className="hidden md:flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, facturas, clientes..."
            className="w-64 bg-background/50 border-border/50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Toggle de tema */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="button-hover"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notificaciones */}
        <Button variant="ghost" size="sm" className="button-hover relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive">
            3
          </Badge>
        </Button>

        {/* Avatar con dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="button-hover">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
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
