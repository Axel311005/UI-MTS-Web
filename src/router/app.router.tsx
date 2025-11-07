import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from '@/auth/pages/LoginPage';
import { AppLayout } from '@/shared/components/layouts/AppLayout';
import { ProtectedRoute } from '@/shared/components/routes/ProtectedRoute';
import { NotAuthenticatedRoute } from '@/shared/components/routes/NotAuthenticatedRoute';
import { RoleGuard } from '@/shared/components/routes/RoleGuard';
const AseguradorasPage = lazy(() =>
  import('@/aseguradora/pages/AseguradoraPage').then((m) => ({
    default: m.default,
  }))
);
const NuevaAseguradoraPage = lazy(() =>
  import('@/aseguradora/pages/NuevaAseguradoraPage').then((m) => ({
    default: m.default,
  }))
);
const EditarAseguradoraPage = lazy(() =>
  import('@/aseguradora/pages/EditarAseguradoraPage').then((m) => ({
    default: m.default,
  }))
);
const TramitesSegurosPage = lazy(() =>
  import('@/tramite-seguro/pages/TramiteSeguroPage').then((m) => ({
    default: m.default,
  }))
);
const NuevoTramiteSeguroPage = lazy(() =>
  import('@/tramite-seguro/pages/NuevoTramiteSeguro').then((m) => ({
    default: m.default,
  }))
);
const EditarTramiteSeguroPage = lazy(() =>
  import('@/tramite-seguro/pages/EditarTramiteSeguro').then((m) => ({
    default: m.default,
  }))
);
// Proformas
const ProformasPage = lazy(() =>
  import('@/proforma/pages/ProformaPage').then((m) => ({
    default: m.default,
  }))
);
const NuevaProformaPage = lazy(() =>
  import('@/proforma/pages/NuevaProformaPage').then((m) => ({
    default: m.default,
  }))
);
const EditarProformaPage = lazy(() =>
  import('@/proforma/pages/EditarProformaPage').then((m) => ({
    default: m.default,
  }))
);
const NuevaFacturaFromProformaPage = lazy(() =>
  import('@/facturas/pages/NuevaFacturaFormProformaPage').then((m) => ({
    default: m.default,
  }))
);
// Recepciones
const RecepcionesPage = lazy(() =>
  import('@/recepcion/page/RecepcionPage').then((m) => ({
    default: m.default,
  }))
);
const NuevaRecepcionPage = lazy(() =>
  import('@/recepcion/page/NuevaRecepcionPage').then((m) => ({
    default: m.default,
  }))
);
const EditarRecepcionPage = lazy(() =>
  import('@/recepcion/page/EditarRecepcionPage').then((m) => ({
    default: m.default,
  }))
);
// Recepción Seguimiento
const RecepcionSeguimientoPage = lazy(() =>
  import('@/recepcion-seguimiento/page/RecepcionSeguimientoPage').then(
    (m) => ({
      default: m.default,
    })
  )
);
const NuevaRecepcionSeguimientoPage = lazy(() =>
  import(
    '@/recepcion-seguimiento/page/NuevaRecepcionSeguimientoPage'
  ).then((m) => ({
    default: m.default,
  }))
);
const EditarRecepcionSeguimientoPage = lazy(() =>
  import(
    '@/recepcion-seguimiento/page/EditarRecepcionSeguimientoPage'
  ).then((m) => ({
    default: m.default,
  }))
);
// Vehículos
const VehiculosPage = lazy(() =>
  import('@/vehiculo/pages/VehiculosPage').then((m) => ({
    default: m.VehiculosPage,
  }))
);
const NuevoVehiculoPage = lazy(() =>
  import('@/vehiculo/pages/NuevoVehiculoPage').then((m) => ({
    default: m.default,
  }))
);
const EditarVehiculoPage = lazy(() =>
  import('@/vehiculo/pages/EditarVehiculoPage').then((m) => ({
    default: m.default,
  }))
);

// Lazy loaded pages
const FacturasPage = lazy(() =>
  import('@/facturas/pages/FacturasPage').then((m) => ({
    default: m.FacturasPage,
  }))
);

const NuevaFacturaPage = lazy(() =>
  import('@/facturas/pages/NuevaFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const EditarFacturaPage = lazy(() =>
  import('@/facturas/pages/EditarFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const VerDetallesFacturaPage = lazy(() =>
  import('@/facturas/pages/VerDetallesFacturaPage').then((m) => ({
    default: m.default,
  }))
);

const ClientePage = lazy(() =>
  import('@/clientes/pages/ClientePage').then((m) => ({
    default: m.ClientesPage,
  }))
);

const NuevoClientePage = lazy(() =>
  import('@/clientes/pages/NuevoClientePage').then((m) => ({
    default: m.default,
  }))
);

const EditarClientePage = lazy(() =>
  import('@/clientes/pages/EditarClientePage').then((m) => ({
    default: m.default,
  }))
);

const VerDetallesClientePage = lazy(() =>
  import('@/clientes/pages/VerDetallesClientePage').then((m) => ({
    default: m.default,
  }))
);

const ItemPage = lazy(() =>
  import('@/items/pages/ItemPage').then((m) => ({
    default: m.ItemPage,
  }))
);
const EditarItemPage = lazy(() =>
  import('@/items/pages/EditarItemPage').then((m) => ({
    default: m.default,
  }))
);
const NuevoItemPage = lazy(() =>
  import('@/items/pages/NuevoItemPage').then((m) => ({
    default: m.default,
  }))
);
const VerDetallesItemPage = lazy(() =>
  import('@/items/pages/VerDetallesItemPage').then((m) => ({
    default: m.default,
  }))
);

// Compras
const ComprasPage = lazy(() =>
  import('@/compra/pages/ComprasPage').then((m) => ({
    default: m.ComprasPage,
  }))
);
const NuevaCompraPage = lazy(() =>
  import('@/compra/pages/NuevaCompraPage').then((m) => ({
    default: m.default,
  }))
);
const EditarCompraPage = lazy(() =>
  import('@/compra/pages/EditarCompraPage').then((m) => ({
    default: m.default,
  }))
);
const VerDetallesCompraPage = lazy(() =>
  import('@/compra/pages/VerDetallesCompraPage').then((m) => ({
    default: m.default,
  }))
);

// Clasificaciones
const ClasificacionesPage = lazy(() =>
  import('@/clasificacion-item/pages/ClasificacionesPage').then((m) => ({
    default: m.ClasificacionesPage,
  }))
);
const NuevaClasificacionPage = lazy(() =>
  import('@/clasificacion-item/pages/NuevaClasificacionPage').then((m) => ({
    default: m.default,
  }))
);
const EditarClasificacionPage = lazy(() =>
  import('@/clasificacion-item/pages/EditarClasifacionPage').then((m) => ({
    default: m.default,
  }))
);

// Unidades de Medida
const UnidadesMedidaPage = lazy(() =>
  import('@/unidad-medida/pages/UnidadMedidaPage').then((m) => ({
    default: m.UnidadesMedidaPage,
  }))
);
const NuevaUnidadMedidaPage = lazy(() =>
  import('@/unidad-medida/pages/NuevaUnidadMedidaPage').then((m) => ({
    default: m.default,
  }))
);
const EditarUnidadMedidaPage = lazy(() =>
  import('@/unidad-medida/pages/EditarUnidadMedida').then((m) => ({
    default: m.default,
  }))
);

// Tipos de Pago
const TiposPagoPage = lazy(() =>
  import('@/tiposPago/pages/TipoPagoPage').then((m) => ({
    default: m.TiposPagoPage,
  }))
);
const NuevoTipoPagoPage = lazy(() =>
  import('@/tiposPago/pages/NuevoTipoPago').then((m) => ({
    default: m.default,
  }))
);
const EditarTipoPagoPage = lazy(() =>
  import('@/tiposPago/pages/EditarTipoPago').then((m) => ({
    default: m.default,
  }))
);

const BodegasPage = lazy(() =>
  import('@/bodega/pages/BodegasPage').then((m) => ({
    default: m.BodegasPage,
  }))
);

const NuevaBodegaPage = lazy(() =>
  import('@/bodega/pages/NuevaBodegaPage').then((m) => ({
    default: m.default,
  }))
);

const EditarBodegaPage = lazy(() =>
  import('@/bodega/pages/EditarBodegaPage').then((m) => ({
    default: m.default,
  }))
);

const ExistenciaBodegaPage = lazy(() =>
  import('@/existencia-bodega/pages/ExistenciaBodegaPage').then((m) => ({
    default: m.ExistenciaBodegaPage,
  }))
);

const NuevaExistenciaPage = lazy(() =>
  import('@/existencia-bodega/pages/NuevaExistenciaPage').then((m) => ({
    default: m.default,
  }))
);

const EditarExistenciaPage = lazy(() =>
  import('@/existencia-bodega/pages/EditarExistenciaPage').then((m) => ({
    default: m.default,
  }))
);

export const appRouter = createBrowserRouter([
  // Rutas de la app (protegidas)
  {
    element: <ProtectedRoute />, // protege todo debajo
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/facturas" replace /> },
          {
            path: 'facturas',
            element: <FacturasPage />,
            handle: { crumb: 'Facturas' },
          },
          {
            path: 'compras',
            element: <ComprasPage />,
            handle: { crumb: 'Compras' },
          },
          {
            path: 'facturas/nueva',
            element: <NuevaFacturaPage />,
            handle: { crumb: 'Nueva factura' },
          },
          {
            path: 'compras/nueva',
            element: <NuevaCompraPage />,
            handle: { crumb: 'Nueva compra' },
          },
          {
            path: 'facturas/:id/editar',
            element: <EditarFacturaPage />,
            handle: { crumb: 'Editar factura' },
          },
          {
            path: 'compras/:id/editar',
            element: <EditarCompraPage />,
            handle: { crumb: 'Editar compra' },
          },
          {
            path: 'facturas/:id',
            element: <VerDetallesFacturaPage />,
            handle: { crumb: 'Factura' },
          },
          {
            path: 'compras/:id',
            element: <VerDetallesCompraPage />,
            handle: { crumb: 'Compra' },
          },
          {
            path: 'facturas/search',
            element: <FacturasPage />,
            handle: { crumb: 'Buscar' },
          },
          {
            path: 'vehiculos',
            element: <VehiculosPage />,
            handle: { crumb: 'Vehículos' },
          },
          {
            path: 'recepciones',
            element: <RecepcionesPage />,
            handle: { crumb: 'Recepciones' },
          },
          {
            path: 'recepciones/nueva',
            element: <NuevaRecepcionPage />,
            handle: { crumb: 'Nueva recepción' },
          },
          {
            path: 'recepciones/editar/:id',
            element: <EditarRecepcionPage />,
            handle: { crumb: 'Editar recepción' },
          },
          {
            path: 'recepcion-seguimiento',
            element: <RecepcionSeguimientoPage />,
            handle: { crumb: 'Seguimiento Recepciones' },
          },
          {
            path: 'recepcion-seguimiento/nueva',
            element: <NuevaRecepcionSeguimientoPage />,
            handle: { crumb: 'Nuevo seguimiento' },
          },
          {
            path: 'recepcion-seguimiento/editar/:id',
            element: <EditarRecepcionSeguimientoPage />,
            handle: { crumb: 'Editar seguimiento' },
          },
          {
            path: 'aseguradoras',
            element: <AseguradorasPage />,
            handle: { crumb: 'Aseguradoras' },
          },
          {
            path: 'aseguradoras/nueva',
            element: <NuevaAseguradoraPage />,
            handle: { crumb: 'Nueva aseguradora' },
          },
          {
            path: 'aseguradoras/editar/:id',
            element: <EditarAseguradoraPage />,
            handle: { crumb: 'Editar aseguradora' },
          },
          {
            path: 'tramites-seguros',
            element: <TramitesSegurosPage />,
            handle: { crumb: 'Trámites de seguros' },
          },
          {
            path: 'tramites-seguros/nuevo',
            element: <NuevoTramiteSeguroPage />,
            handle: { crumb: 'Nuevo trámite de seguro' },
          },
          {
            path: 'tramites-seguros/editar/:id',
            element: <EditarTramiteSeguroPage />,
            handle: { crumb: 'Editar trámite de seguro' },
          },
          {
            path: 'vehiculos/nuevo',
            element: <NuevoVehiculoPage />,
            handle: { crumb: 'Nuevo vehículo' },
          },
          {
            path: 'vehiculos/:id/editar',
            element: <EditarVehiculoPage />,
            handle: { crumb: 'Editar vehículo' },
          },
          {
            path: 'clientes',
            element: <ClientePage />,
            handle: { crumb: 'Clientes' },
          },
          {
            path: 'clientes/nuevo',
            element: <NuevoClientePage />,
            handle: { crumb: 'Nuevo cliente' },
          },
          {
            path: 'clientes/:id/editar',
            element: <EditarClientePage />,
            handle: { crumb: 'Editar cliente' },
          },
          {
            path: 'clientes/:id',
            element: <VerDetallesClientePage />,
            handle: { crumb: 'Cliente' },
          },
          {
            path: 'productos',
            element: <ItemPage />,
            handle: { crumb: 'Productos' },
          },
          {
            path: 'productos/nuevo',
            element: <NuevoItemPage />,
            handle: { crumb: 'Nuevo producto' },
          },
          {
            path: 'productos/:id',
            element: <VerDetallesItemPage />,
            handle: { crumb: 'Producto' },
          },
          {
            path: 'productos/:id/editar',
            element: <EditarItemPage />,
            handle: { crumb: 'Editar producto' },
          },
          {
            path: 'proformas',
            element: <ProformasPage />,
            handle: { crumb: 'Proformas' },
          },
          {
            path: 'proformas/nueva',
            element: <NuevaProformaPage />,
            handle: { crumb: 'Nueva proforma' },
          },
          {
            path: 'proformas/editar/:id',
            element: <EditarProformaPage />,
            handle: { crumb: 'Editar proforma' },
          },
          {
            path: 'facturas/from-proforma',
            element: <NuevaFacturaFromProformaPage />,
            handle: { crumb: 'Factura desde proforma' },
          },
          {
            path: 'clasificaciones',
            element: <ClasificacionesPage />,
            handle: { crumb: 'Clasificaciones' },
          },
          {
            path: 'unidades-medida',
            element: <UnidadesMedidaPage />,
            handle: { crumb: 'Unidades de Medida' },
          },
          {
            path: 'unidades-medida/nueva',
            element: <NuevaUnidadMedidaPage />,
            handle: { crumb: 'Nueva unidad de medida' },
          },
          {
            path: 'unidades-medida/:id/editar',
            element: <EditarUnidadMedidaPage />,
            handle: { crumb: 'Editar unidad de medida' },
          },
          {
            path: 'tipos-pago',
            element: <TiposPagoPage />,
            handle: { crumb: 'Tipos de Pago' },
          },
          {
            path: 'tipos-pago/nuevo',
            element: <NuevoTipoPagoPage />,
            handle: { crumb: 'Nuevo tipo de pago' },
          },
          {
            path: 'tipos-pago/:id/editar',
            element: <EditarTipoPagoPage />,
            handle: { crumb: 'Editar tipo de pago' },
          },
          {
            path: 'clasificaciones/nueva',
            element: <NuevaClasificacionPage />,
            handle: { crumb: 'Nueva clasificación' },
          },
          {
            path: 'clasificaciones/:id/editar',
            element: <EditarClasificacionPage />,
            handle: { crumb: 'Editar clasificación' },
          },
          {
            element: <RoleGuard allow={['gerente']} />,
            children: [
              {
                path: 'bodegas',
                element: <BodegasPage />,
                handle: { crumb: 'Bodegas' },
              },
              {
                path: 'bodegas/nueva',
                element: <NuevaBodegaPage />,
                handle: { crumb: 'Nueva bodega' },
              },
              {
                path: 'bodegas/editar/:id',
                element: <EditarBodegaPage />,
                handle: { crumb: 'Editar bodega' },
              },
              {
                path: 'existencia-bodega',
                element: <ExistenciaBodegaPage />,
                handle: { crumb: 'Existencia en bodega' },
              },
              {
                path: 'existencia-bodega/nueva',
                element: <NuevaExistenciaPage />,
                handle: { crumb: 'Nueva existencia' },
              },
              {
                path: 'existencia-bodega/editar/:id',
                element: <EditarExistenciaPage />,
                handle: { crumb: 'Editar existencia' },
              },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: <RoleGuard allow={['admin', 'gerente']} />, // mapea 'admin' a 'gerente'
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: 'facturas',
                element: <FacturasPage />,
                handle: { crumb: 'Facturas' },
              },
              {
                path: 'clientes',
                element: <ClientePage />,
                handle: { crumb: 'Clientes' },
              },
              {
                path: 'clientes/nuevo',
                element: <NuevoClientePage />,
                handle: { crumb: 'Nuevo cliente' },
              },
              {
                path: 'clientes/:id/editar',
                element: <EditarClientePage />,
                handle: { crumb: 'Editar cliente' },
              },
              {
                path: 'clientes/:id',
                element: <VerDetallesClientePage />,
                handle: { crumb: 'Cliente' },
              },
              {
                path: 'productos',
                element: <ItemPage />,
                handle: { crumb: 'Productos' },
              },
              {
                path: 'productos/nuevo',
                element: <NuevoItemPage />,
                handle: { crumb: 'Nuevo producto' },
              },
              {
                path: 'productos/:id',
                element: <VerDetallesItemPage />,
                handle: { crumb: 'Producto' },
              },
              {
                path: 'productos/:id/editar',
                element: <EditarItemPage />,
                handle: { crumb: 'Editar producto' },
              },
            ],
          },
        ],
      },
    ],
  },

  // Auth
  {
    path: '/auth',
    element: <NotAuthenticatedRoute />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
