# Auditoría Técnica Inicial: Plantilla Syndron (PideGas)

## 1. Resumen Ejecutivo
Se realizó la inspección del paquete descargado `syndron-tailwind-css-next-js-admin-template-2026-09-09-05-47-09-utc`. El archivo fuente contenía tres distribuciones independientes:
1. `Bootstrap-5-Admin-Template` (~197.5 MB): Maquetación tradicional con Bootstrap 5, HTML5 y jQuery. Descartada por no cumplir el stack requerido.
2. `eCommerce-Template` (~19.1 MB): Plantilla HTML estática de comercio electrónico. Descartada por no ser el backoffice ni usar Next.js.
3. `Tailwind+Nextjs-Admin` (~38.3 MB): **Plantilla seleccionada y activada**. Cumple con el stack moderno oficial para el Backoffice de PideGas.

El proyecto fue reubicado formalmente en `pidegas-frontend/` para alinearse con la arquitectura monolítica modular de PideGas (`pidegas-frontend/` y `pidegas-backend/`).

---

## 2. Inventario de Versiones y Stack Real
- **Framework**: Next.js 16.1.6 (App Router)
- **Librería Core**: React 19.2.3 / React DOM 19.2.3
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4.2.1 con `@tailwindcss/postcss` 4.2.1 y `tailwindcss-animate`
- **UI Kit**: Shadcn UI (`radix-nova` style) sobre primitivas Radix UI (`radix-ui` 1.4.3)
- **Iconos**: `lucide-react` (0.577.0) y complementos de `@boxicons/react` / `bootstrap-icons`
- **Estado Global**: `zustand` 5.0.12
- **Visualización y Gráficos**: `recharts` 2.15.4, `apexcharts` 5.10.3 / `react-apexcharts` 2.1.0
- **Tablas y Datos**: `@tanstack/react-table` 8.21.3
- **Formularios y Utilidades**: `date-fns` 4.1.0, `clsx` 2.1.1, `tailwind-merge` 3.5.0, `cmdk` 1.1.1, `sonner` 2.0.7
- **Exportación**: `jspdf`, `jspdf-autotable`, `xlsx`, `file-saver`

---

## 3. Estructura de Rutas y Navegación (App Router)
La plantilla organiza sus rutas dentro de `src/app/`:
- `(layout-pages)/`:
  - `dashboard/`: Páginas analíticas y dashboards reutilizables para el panel **Empresa** y **Super Admin**.
  - `eCommerce/`: Gestión de órdenes, detalles de productos y catálogo. Reutilizable para el módulo de Catálogo e Inventario de Empresa.
  - `tables/`: Tablas avanzadas con filtros y paginación (`@tanstack/react-table`).
  - `forms/`: Formularios de configuración y altas de entidades.
  - `ui-components/`: Catálogo completo de componentes atómicos Shadcn UI.
  - `applications/`: Chat, calendario, gestor de archivos. Reutilizable para soporte y gestión de evidencias/documentos.
- `(no-layout-pages)/`:
  - `auth/`: Páginas de Login, Registro, Recuperación de contraseña y bloqueo de pantalla.
  - `error/`: Páginas 404, 500 y mantenimiento.

---

## 4. Hallazgos y Ajustes Críticos Aplicados
1. **Configuración de Demo en `next.config.ts`**:
   - *Hallazgo*: La plantilla venía configurada con `output: "export"`, `basePath: "/syndron-ui-next"` y `assetPrefix: "/syndron-ui-next/"`, pensada para un hosting estático de demostración.
   - *Ajuste*: Se removieron el `basePath` y el `output: "export"` estático, permitiendo a Next.js operar en la raíz `/` con soporte para rutas dinámicas, Server Components y llamadas a API.
2. **Identificador del Proyecto**:
   - Se renombró el paquete en `package.json` de `next-admin-dashboard` a `pidegas-frontend`.
3. **Depuración de Archivos Innecesarios**:
   - Se eliminaron las variantes de Bootstrap 5 y eCommerce HTML puro, liberando más de 216 MB de espacio en disco.

---

## 5. Mapeo para PideGas (Fase 1 en adelante)
| Módulo PideGas | Componente / Vista Syndron Reutilizable | Adaptación Requerida |
|---|---|---|
| **Panel Empresa: Dashboard** | `(layout-pages)/dashboard/analytics` | Integrar métricas de pedidos de gas, stock crítico de balones y ventas. |
| **Panel Empresa: Pedidos / Kanban** | `(layout-pages)/eCommerce/orders` + Kanban de `applications` | Conectar con la máquina de estados del pedido y WebSockets de Spring Boot. |
| **Panel Empresa: Catálogo & Stock** | `(layout-pages)/eCommerce/products` | Adaptar a tipos de gas (10kg, 15kg, 45kg, granel), válvulas y marcas. |
| **Panel Empresa: Flota & Repartidores** | Tablas de datos + Widgets de logística | Asignación de pedidos y geolocalización. |
| **Panel Super Admin: Empresas** | `(layout-pages)/tables/data-table` | Aprobación/rechazo de distribuidoras, polígonos de cobertura. |
| **Autenticación Multi-rol** | `(no-layout-pages)/auth/login` | Conectar con Spring Boot JWT y derivar según rol (EMPRESA, ADMIN, CLIENTE, REPARTIDOR). |
| **Cliente / Repartidor** | Layouts separados | Diseñar layouts móviles ultraligeros sin los bundles pesados de gráficos/tablas administrativas. |
