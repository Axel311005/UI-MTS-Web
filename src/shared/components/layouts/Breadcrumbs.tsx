import React from 'react';
import { Link, useMatches, useLocation } from 'react-router';
import { ChevronRight, Home } from '@/shared/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';

interface CrumbHandle {
  crumb: string | ((data: any) => string);
}

interface RouteMatch {
  handle?: CrumbHandle;
  pathname: string;
  data?: any;
}

interface Crumb {
  to: string;
  label: string;
}

// Props para el componente Breadcrumbs
interface BreadcrumbsProps {
  userType?: 'admin' | 'vendedor';
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  userType = 'admin',
}) => {
  const matches = useMatches() as RouteMatch[];
  const location = useLocation();

  // Determinar si estamos en el panel admin
  const isAdminPanel = location.pathname.startsWith('/admin');
  const homeLink = isAdminPanel ? '/admin/home' : '/';

  const crumbs: Crumb[] = matches
    .filter((match: RouteMatch) => (match.handle as CrumbHandle)?.crumb)
    .map((match: RouteMatch) => {
      const handle = match.handle as CrumbHandle;
      const data = match.data;

      // Determina el nombre del 'crumb'. Si es una función, la ejecuta.
      const label =
        typeof handle.crumb === 'function' ? handle.crumb(data) : handle.crumb;

      return {
        to: match.pathname,
        label: label,
      };
    });

  // Lógica para breadcrumbs según tipo de usuario
  const getFilteredCrumbs = () => {
    if (userType === 'admin') {
      return crumbs; // Admin ve todos los breadcrumbs
    } else {
      // Vendedor ve breadcrumbs limitados (sin rutas administrativas)
      return crumbs.filter(
        (crumb) =>
          !crumb.to.includes('/usuarios') && !crumb.to.includes('/reportes')
      );
    }
  };

  const filteredCrumbs = getFilteredCrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to={homeLink}
              className="flex items-center hover:text-primary"
            >
              <Home className="h-4 w-4 mr-1" />
              Inicio
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {filteredCrumbs.map((crumb: Crumb, index: number) => {
          const isLast = index === filteredCrumbs.length - 1;

          return (
            <React.Fragment key={crumb.to}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to} className="hover:text-primary">
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
