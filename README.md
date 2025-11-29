## 🛠️ Taller MTS – Sistema de Gestión para Taller Mecánico y Seguros

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)

**Sistema integral de gestión para taller mecánico, clientes, seguros e inventario**

_Optimizando la operación del taller, la experiencia del cliente y el control financiero en un solo lugar_

[Características](#-características) • [Tecnologías](#-tecnologías) • [Instalación](#-instalación) • [Uso](#-uso) • [Arquitectura](#-arquitectura)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Características Principales](#-características-principales)
- [Arquitectura](#-arquitectura)
- [Despliegue](#-despliegue)
- [Documentación Adicional](#-documentación-adicional)

---

## 🌟 Descripción

Aplicación web desarrollada en **React + TypeScript** para la gestión integral de un **taller mecánico** y sus operaciones relacionadas con:

- Clientes y vehículos
- Citas, recepciones y seguimiento de servicios
- Facturación, proformas, cotizaciones y compras
- Inventario, bodegas y existencias
- Aseguradoras y trámites de seguros

El sistema se compone de:

- **Landing pública** para clientes finales (cotizaciones, citas y seguimiento).
- **Panel administrativo protegido** (`/admin`) para el personal del taller (gerencia, administración, recepción, etc.).

Construido con prácticas modernas, modularidad por dominio y un enfoque fuerte en seguridad y mantenibilidad.

---

## ✨ Características

### 🌐 Landing pública (cliente final)

- ✅ Solicitud de **cotizaciones** en línea.
- ✅ Programación de **citas** para servicios del taller.
- ✅ **Seguimiento** del estado de servicios / vehículos.
- ✅ Flujo de autenticación para clientes de landing.

### 🛠️ Panel administrativo `/admin`

- ✅ **Dashboard / Home** con visión general del taller.
- ✅ **Perfil de usuario** y gestión básica de cuenta.
- ✅ **Gestión de clientes** (alta, edición, detalle).
- ✅ **Gestión de vehículos** asociados a clientes.
- ✅ **Recepciones** y **seguimiento de recepciones** (estado de trabajos en curso).
- ✅ **Facturas**: creación, edición, detalle y búsqueda.
- ✅ **Compras**: registro y gestión de compras a proveedores.
- ✅ **Proformas** y generación de facturas desde proformas.
- ✅ **Cotizaciones**: detalle, edición y seguimiento.
- ✅ **Aseguradoras** y **trámites de seguros**.
- ✅ **Productos / ítems** con clasificación, unidades de medida y detalles.
- ✅ **Impuestos, monedas y tipos de pago** configurables.
- ✅ **Bodegas y existencias por bodega**, con restricciones por rol.

### 👤 Autenticación, roles y seguridad

- ✅ Autenticación con verificación de sesión (`checkAuthStatus`).
- ✅ Rutas protegidas usando:
  - `ProtectedRoute`
  - `NotAuthenticatedRoute`
  - `LandingProtectedRoute`
  - `RoleGuard`
- ✅ Soporte de roles como **gerente** y **superuser** para módulos críticos (bodegas, existencias, administración, reportes, etc.).
- ✅ Manejo de errores de carga de chunks (`useChunkErrorHandler`) para despliegues seguros.

### 🎨 Experiencia de usuario

- ✅ Notificaciones con `sonner`.
- ✅ Diseño moderno con Tailwind CSS y animaciones (`framer-motion`, `tailwindcss-animate`).
- ✅ Componentes accesibles basados en Radix UI.
- ✅ Navegación SPA optimizada con React Router y code splitting (lazy loading).

---

## 🛠️ Tecnologías

### Core

- **React** 19.1.1 – Biblioteca de UI.
- **TypeScript** 5.8.x – Tipado estático.
- **Vite** 7.1.6 – Dev server y bundler.

### Routing & State Management

- **React Router** 7.9.1 – Enrutamiento SPA.
- **TanStack Query (React Query)** 5.90.x – Estado del servidor y caché.
- **Zustand** 5.x – Estado global ligero (auth y otros stores).

### UI & Styling

- **Tailwind CSS** 3.4.17 – Utility-first CSS.
- **tailwindcss-animate** y `tw-animate-css` – Animaciones.
- **Radix UI** (`@radix-ui/react-*`) – Primitivas accesibles.
- **Lucide React** – Iconografía.
- **cmdk** – Componentes tipo command palette.

### Formularios y Validación

- **React Hook Form** 7.66.x – Manejo de formularios.
- **DOMPurify** – Sanitización de HTML.

### HTTP, WebSockets y Utilidades

- **Axios** – Cliente HTTP.
- **Socket.IO Client** – Comunicación en tiempo real (namespaces `/admin` y `/cliente`).
- **date-fns** – Utilidades de fechas.
- **clsx**, **tailwind-merge** y **class-variance-authority** – Utilidades para clases CSS.

### Calidad de Código

- **ESLint** 9.x con reglas para React, hooks y TypeScript.
- **TypeScript** estricto.

---

## 📦 Requisitos Previos

- **Node.js** ≥ 18
- **npm** ≥ 9 (o cualquier otro gestor de paquetes si se adapta la configuración)
- Acceso a una **API backend** (idealmente NestJS) con soporte para:
  - HTTP REST (`VITE_API_URL`)
  - WebSockets / Socket.IO (`VITE_SOCKET_URL`, namespaces `/admin` y `/cliente`)

---

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd ui-mts-web
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   - Crear un archivo `.env.local` (o `.env`) en la raíz del proyecto con al menos:

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SOCKET_URL=http://localhost:3000/admin
   # Opcional: cuando el cliente final está identificado
   VITE_CLIENTE_ID=
   ```

4. **Iniciar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173` (por defecto).

---

## ⚙️ Configuración

### Variables de Entorno

| Variable          | Descripción                                              | Requerido |
| ----------------- | -------------------------------------------------------- | --------- |
| `VITE_API_URL`    | URL base del backend HTTP                                | ✅ Sí     |
| `VITE_SOCKET_URL` | URL base del servidor Socket.IO (namespace `/admin`)     | ✅ Sí     |
| `VITE_CLIENTE_ID` | Identificador opcional de cliente para namespace cliente | ⛔ No     |

### Configuración de Paths

El proyecto utiliza alias de paths configurados en `tsconfig.json`, por ejemplo:

```ts
import { AppLayout } from '@/shared/components/layouts/AppLayout';
```

El alias `@` apunta a `./src`.

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo con HMR

# Producción
npm run build        # Compila el proyecto para producción (TypeScript + Vite)
npm run preview      # Sirve el build de producción localmente

# Calidad de código
npm run lint         # Ejecuta ESLint sobre el código del proyecto
```

---

## 📁 Estructura del Proyecto

```txt
ui-mts-web/
├── public/                      # Archivos estáticos (imágenes, sitemap, robots, sonidos)
├── src/
│   ├── admin/                   # Páginas y componentes de administración
│   │   ├── components/
│   │   └── pages/
│   ├── auth/                    # Autenticación, acciones y store
│   ├── landing/                 # Landing pública (cotización, cita, seguimiento)
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/ & types/
│   ├── clientes/                # Módulo de clientes
│   ├── vehiculo/                # Módulo de vehículos
│   ├── cita/                    # Citas y motivos de cita
│   ├── recepcion/               # Recepciones
│   ├── recepcion-seguimiento/   # Seguimiento de recepciones
│   ├── facturas/                # Facturación
│   ├── compra/                  # Compras a proveedores
│   ├── proforma/                # Proformas
│   ├── cotizacion/              # Cotizaciones
│   ├── aseguradora/             # Aseguradoras
│   ├── tramite-seguro/          # Trámites de seguro
│   ├── items/                   # Productos / ítems
│   ├── clasificacion-item/      # Clasificaciones de ítems
│   ├── unidad-medida/           # Unidades de medida
│   ├── tiposPago/               # Tipos de pago
│   ├── moneda/                  # Monedas
│   ├── impuesto/                # Impuestos
│   ├── bodega/                  # Bodegas
│   ├── existencia-bodega/       # Existencias por bodega
│   ├── shared/                  # Componentes, hooks y utilidades compartidas
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── router/
│   │   └── app.router.tsx       # Definición global de rutas
│   ├── TallerApp.tsx            # Componente raíz de la aplicación
│   ├── main.tsx                 # Punto de entrada React
│   ├── app.css / index.css      # Estilos base
│   └── vite-env.d.ts            # Tipos de Vite
├── netlify.toml                 # Configuración de despliegue (Netlify)
├── package.json
├── tsconfig*.json               # Configuración TypeScript
├── tailwind.config.ts           # Configuración Tailwind
└── vite.config.ts               # Configuración Vite
```

---

## 🎯 Características Principales

### 🔄 Gestión de datos por dominio

Cada módulo (`facturas`, `compra`, `clientes`, `vehiculo`, `cita`, `items`, `bodega`, etc.) sigue una estructura coherente:

- `actions/`: llamadas a la API y lógica de negocio (capa de servicios).
- `api/`: configuración del cliente HTTP específico del módulo.
- `hook/` o `hooks/`: hooks personalizados para consumo en componentes.
- `pages/`: páginas principales del módulo.
- `ui/`: componentes UI específicos del dominio.
- `types/`: interfaces y tipos TypeScript del módulo.

### 📝 Formularios robustos

- Formularios construidos con **React Hook Form**.
- Validaciones en tiempo real y manejo de errores de usuario.
- Integración con notificaciones (`sonner`) para feedback inmediato.

### 📊 Gestión de estado de servidor

- Uso intensivo de **React Query** para:
  - Caché de peticiones.
  - Refetch automático.
  - Manejo de estados de carga y error.

---

## 🏗️ Arquitectura

### Patrón de organización

El proyecto sigue una **arquitectura modular por dominio funcional**:

```txt
módulo/
├── actions/      # Llamadas a API (servicios)
├── api/          # Cliente HTTP del módulo
├── hook(s)/      # Hooks de negocio
├── pages/        # Vistas / páginas
├── ui/           # Componentes de interfaz
└── types/        # Tipos e interfaces
```

### Flujo general de datos

```txt
Componente → Hook → Action → API → Backend
                 ↓
          React Query Cache
```

### Ruteo y protección

- `src/router/app.router.tsx` define:
  - Rutas de **landing** (`/`, `/seguimiento`, `/cotizacion`, `/cita`…).
  - Rutas de **auth** (`/auth`, `/login`, `/register`).
  - Panel `/admin` con rutas hijas por módulo.
  - Redirecciones desde rutas cortas (`/facturas/*`, `/clientes/*`, etc.) al panel admin.
  - Protección de rutas mediante `ProtectedRoute`, `LandingProtectedRoute`, `NotAuthenticatedRoute` y `RoleGuard`.

---

## 🌍 Despliegue

1. **Generar build de producción**

   ```bash
   npm run build
   ```

2. **Servir la carpeta `dist`** en un servidor estático (Netlify, Vercel, Nginx, etc.).

El archivo `netlify.toml` ya incluye configuración para despliegue como **SPA** (manejo de rutas y redirecciones).

---

## 📚 Documentación Adicional

En la raíz del proyecto se incluyen archivos complementarios:

- `COLORES_PROYECTO.md` – Paleta y lineamientos de diseño.
- `PROTECCION-SQL-INPUTS.md` – Notas de protección frente a inyección SQL.
- `RESUMEN_VALIDACIONES_Y_SEGURIDAD.md` – Resumen de validaciones y aspectos de seguridad.
- `TESTING-CONSOLA-MALICIOSA.md` – Pruebas relacionadas con consola maliciosa y hardening.

Revisar estos documentos para entender mejor las decisiones de diseño visual y de seguridad del sistema.

---

## 🤝 Contribución (opcional)

- Mantener la estructura modular existente por dominio.
- Seguir las convenciones de nombres y patrón `actions/api/hook/pages/ui/types`.
- Ejecutar `npm run lint` antes de subir cambios.
