# Plan de Implementación Consolidado - PideGas MVP

**Versión:** 1.4.0 (PORTAL WEB PÚBLICO & FASES 1-13 COMPLETADAS AL 100%)  
**Fecha:** 04 de octubre de 2026  
**Stack Principal:**  
- **Frontend Backoffice & Web Pública:** Next.js 16 + React 19 + Tailwind CSS 4 + Shadcn UI (Basado en Syndron)  
- **Frontend Cliente / Repartidor:** Next.js App Router (Layouts PWA ultraligeros)  
- **Backend:** Java 21 + Spring Boot 3 (Monolito Modular)  
- **Persistencia & Geo:** PostgreSQL 16 + PostGIS + Flyway  
- **Proxy Inverso & Despliegue:** Nginx + Docker Compose  

---

## Estado Actual: Fases 1 a 13 Completadas al 100% (LISTO PARA PRODUCCIÓN)
- [x] Inspección del repositorio y descarte de plantillas obsoletas (Bootstrap 5 y eCommerce HTML puro).
- [x] Activación e integración de la plantilla administrativa oficial: `pidegas-frontend` (Next.js + Tailwind CSS + Shadcn).
- [x] Eliminación de restricciones de demo estática (`basePath` y `output: 'export'`) en `next.config.ts`.
- [x] Creación de documento de auditoría: `docs/syndron-audit.md`.
- [x] Instalación de dependencias de frontend y compilación verificada.
- [x] Contenedor `pidegas-postgres` con PostgreSQL 16 + PostGIS 3.4 desplegado y saludable.
- [x] Proyecto backend `pidegas-backend` estructurado en Java 21 + Spring Boot 3.3.5.
- [x] 12 migraciones Flyway ejecutadas y validadas contra PostgreSQL/PostGIS.
- [x] Endpoint de salud y Actuator verificados (`/actuator/health`, `/api/v1/publico/salud`).
- [x] Configuración de Docker Compose (`docker-compose.yml`), Nginx (`nginx/nginx.conf`), `.env` y `.env.example`.
- [x] Módulo de identidad y autenticación con roles (`CLIENTE`, `EMPRESA`, `REPARTIDOR`, `ADMIN`).
- [x] Servicio JWT con claims de rol y tenantId, y filtro de seguridad Bearer.
- [x] Usuarios demo inicializados (`admin@pidegas.pe`, `empresa@pidegas.pe`, `cliente@pidegas.pe`, `repartidor@pidegas.pe`).
- [x] Cliente HTTP y API de autenticación (`auth.api.ts`, `cliente-http.ts`).
- [x] Store Zustand (`auth-store.ts`) y formulario de login conectado con branding PideGas.
- [x] Pruebas unitarias de autenticación con cobertura de login, registro, tokens y validaciones.

---

## Roadmap de Implementación

### FASE 1 — Infraestructura y Contenerización (COMPLETADA)
- [x] Configuración de `docker-compose.yml` (PostgreSQL 16 + PostGIS 3.4, Backend Spring Boot, Frontend Next.js, Nginx).
- [x] Configuración inicial de Spring Boot 3 con Java 21 en `pidegas-backend`.
- [x] Configuración y ejecución de 12 migraciones Flyway (PostGIS, UUIDs, Identity, Companies, Coverage, Catalog, Orders, Loyalty, Inventory, Fleet, Promotions, Support, Indexes).
- [x] Verificación de health checks (`/actuator/health` y `/api/v1/publico/salud`).
- [x] Swagger UI / OpenAPI 3 operativo en `/swagger-ui/index.html`.

### FASE 2 — Identidad, Autenticación y Multi-Rol (COMPLETADA)
- [x] Modelo de usuarios con `public_id` UUID y roles: `CLIENTE`, `EMPRESA`, `REPARTIDOR`, `ADMIN`.
- [x] Autenticación stateless con JWT (Access + Refresh tokens con HS512).
- [x] Endpoints `/api/v1/auth/login`, `/api/v1/auth/registro-cliente`, `/api/v1/auth/refresh`, `/api/v1/auth/yo`.
- [x] Inicializador de cuentas base (`admin@pidegas.pe`, `empresa@pidegas.pe`, `cliente@pidegas.pe`, `repartidor@pidegas.pe`).
- [x] Integración de formulario de Login y Registro en `pidegas-frontend` con branding PideGas y botones de prueba rápida.
- [x] Store de estado global con Zustand para gestión de sesión en Next.js.
- [x] Suite de pruebas unitarias (`AutenticacionServicioTest`) ejecutadas y aprobadas (8/8 tests pasando).

### FASE 3 — Multi-Tenancy y Módulo de Empresas (COMPLETADA)
- [x] Arquitectura Zero Trust Multi-Tenant con `TenantContext` (`ThreadLocal`), validación de `tenant_id` en JWT.
- [x] Modelo de dominio `Empresa` con ciclo de vida completo: `PENDIENTE`, `APROBADA`, `SUSPENDIDA`, `RECHAZADA`.
- [x] DTOs y validación estricta (RUC 11 dígitos, SUNAT, emails, contraseñas de admin).
- [x] Endpoints públicos: `POST /api/v1/empresas/registro`, `GET /api/v1/publico/empresas`, `GET /api/v1/publico/empresas/{publicId}`.
- [x] Endpoints autenticados de empresa: `GET /api/v1/empresas/mi-empresa`, `PUT /api/v1/empresas/mi-empresa`.
- [x] Endpoints de Super Admin: `GET /api/v1/admin/empresas`, `GET /api/v1/admin/empresas/{publicId}`, `PATCH /api/v1/admin/empresas/{publicId}/estado`.
- [x] Suite de pruebas automatizadas (`EmpresaServicioTest`) ejecutadas y aprobadas (14/14 tests pasando en backend).
- [x] Script de prueba end-to-end (`test_fase3.ps1`) validando los 7 pasos del ciclo de vida multi-tenant.
- [x] Cliente TypeScript frontend `empresas.api.ts`.
- [x] Panel de Super Admin en frontend (`/admin/empresas`) con KPI cards, filtros por estado, búsqueda en vivo, tabla y acciones de aprobación/suspensión/rechazo.
- [x] Panel de configuración de Distribuidora en frontend (`/empresa/mi-empresa`).
- [x] Portal público de registro/afiliación de distribuidoras (`/auth/registro-empresa`).
- [x] Integración de navegación en `app-sidebar.tsx` con marca PideGas.
- [x] Compilación de producción de Next.js (`npm run build`) validada al 100% (77/77 páginas exitosas).

### FASE 4 — Cobertura Geoespacial y Ubigeo (COMPLETADA)
- [x] Migración `V13__seed_ubigeo.sql` con carga oficial de Ubigeo INEI para Lima Metropolitana (43 distritos), Callao (7 distritos) y principales departamentos del Perú.
- [x] Entidad `Ubigeo` y servicio REST (`/api/v1/publico/ubigeo/departamentos`, `/provincias`, `/distritos`).
- [x] Entidad `ZonaCobertura` mapeada con JTS `Polygon` y SRID 4326 (WGS 84).
- [x] Índices espaciales GiST (`idx_zonas_geometria`) aprovechados con queries nativas de alto rendimiento.
- [x] Endpoint de consulta geoespacial `POST /api/v1/publico/cobertura/verificar` implementando `ST_Covers(geometria, ST_SetSRID(ST_MakePoint(lng, lat), 4326))`.
- [x] CRUD completo de polígonos de reparto para distribuidoras (`GET /api/v1/cobertura/zonas`, `POST`, `PUT`, `DELETE`) con aislamiento `TenantContext`.
- [x] Suite de pruebas automatizadas (`ZonaCoberturaServicioTest`) ejecutadas y aprobadas (21/21 tests pasando en backend).
- [x] Script de prueba end-to-end (`test_fase4.ps1`) validando ubigeo, persistencia de polígonos, punto dentro (`ST_Covers = true`) y punto fuera (`ST_Covers = false`).
- [x] Clientes frontend TypeScript `cobertura.api.ts` y `ubigeo.api.ts`.
- [x] Interfaz de gestión de polígonos y comprobador geoespacial en vivo en `pidegas-frontend` (`/empresa/cobertura`) con presets de Lima y soporte GPS.
- [x] Integración de "Zonas de Cobertura" en el menú lateral de Syndron.
- [x] Compilación de producción de Next.js (`npm run build`) validada con 78/78 rutas estáticas generadas sin errores.

### FASE 5 — Catálogo de Balones de Gas de Cocina y Precios (COMPLETADA)
- [x] Modelo de dominio especializado en **Balones de Gas de Cocina**: `GLP_10KG` (Doméstico), `GLP_15KG` (Familiar), `GLP_45KG` (Comercial/Restaurantes) y `VALVULA_ACCESORIO` (Reguladores con manómetro).
- [x] Soporte para tipos de válvula normadas: `PREMIUM` (Click-On con autobloqueo de seguridad) y `ROSCA` (Tradicional).
- [x] Entidad `Producto` con aislamiento multi-tenant estricto (`tenant_id`, restricción única `UNIQUE(tenant_id, sku)`).
- [x] Inicializador con precarga de 5 Balones de Gas de Cocina base en moneda nacional (Soles S/) para empresas autorizadas.
- [x] Endpoints autenticados de distribuidora (`/api/v1/productos/**`) para CRUD, actualización de precios y disponibilidad (`ACTIVO`, `AGOTADO`, `INACTIVO`).
- [x] Endpoint público `/api/v1/publico/empresas/{empresaPublicId}/productos` para consulta de balones y tarifas disponibles para clientes.
- [x] Suite de pruebas automatizadas (`ProductoServicioTest`) ejecutadas y aprobadas (27/27 tests pasando en backend).
- [x] Script de prueba end-to-end (`test_fase5.ps1`) validando listado de balones, creación de SKU, ajuste de precio y catálogo público.
- [x] Cliente frontend TypeScript `catalogo.api.ts`.
- [x] Interfaz de gestión en Syndron (`/empresa/catalogo`) con tarjetas de balones de gas, selector de válvulas, edición rápida de precios y stock.
- [x] Integración de "Catálogo de Balones" en el menú lateral de Syndron bajo Distribuidora (Tenant).
- [x] Compilación de producción de Next.js (`npm run build`) validada con 79/79 rutas generadas sin errores.

### FASE 6 — Flujo Transaccional de Pedidos y WebSockets (COMPLETADA)
- [x] Checkout rápido para clientes recurrentes (< 3 pasos) en `/cliente/tienda`.
- [x] Máquina de estados unificada del pedido: `PENDIENTE` -> `ASIGNADO` -> `EN_CAMINO` -> `ENTREGADO` / `CANCELADO` con confirmación por código PIN.
- [x] Notificaciones en tiempo real vía WebSocket (STOMP) para recepcionar pedidos en el panel Empresa (`/topic/empresa/{tenantId}/pedidos`).
- [x] Vista de órdenes activas y notificaciones sonoras en Syndron (`/empresa/pedidos` con sintetizador nativo `AudioContext`).
- [x] Script de prueba end-to-end (`test_fase6.ps1`) y suite de pruebas unitarias (`PedidoServicioTest`).

### FASE 7 — Kanban Operativo, Logística y Repartidor (COMPLETADA)
- [x] Tablero Kanban interactivo de pedidos en el Backoffice Empresa (`/empresa/pedidos` con cambio entre Cuadrícula y Kanban).
- [x] Gestión de flota, vehículos de reparto (moto furgón, camioneta, camión GLP) y repartidores (`/empresa/flota`).
- [x] Vista móvil para Repartidores (`/repartidor/pedidos` con ruta de entrega, confirmación por PIN y telemetría GPS).
- [x] Script de prueba end-to-end (`test_fase7.ps1`) y suite de pruebas unitarias (`FlotaServicioTest`).

### FASE 8 — Inventario y Kardex de Balones (COMPLETADA)
- [x] Registro y control de stock de balones llenos vs vacíos prestados (`/empresa/inventario`).
- [x] Kardex automatizado con movimientos de stock (`ENTRADA`, `SALIDA`, `AJUSTE`) ante entregas y reposición desde planta GLP.
- [x] Alertas de stock mínimo y desabastecimiento en almacén central.
- [x] Script de prueba end-to-end (`test_fase8.ps1`) y suite de pruebas unitarias (`InventarioServicioTest`).

### FASE 9 — Sistema de Fidelización y Puntos (COMPLETADA)
- [x] Billetera de puntos por cliente y reglas de acumulación por compra de balones (`/cliente/puntos`).
- [x] Creación y administración de promociones y cupones de descuento (`/empresa/promociones`).
- [x] Aplicación y canje de cupones y puntos de descuento en el checkout del cliente (`/cliente/tienda`).
- [x] Script de prueba end-to-end (`test_fase9.ps1`) y suite de pruebas unitarias (`FidelizacionServicioTest`).

### FASE 10 — Finanzas, Reportes y Liquidaciones (COMPLETADA)
- [x] Dashboard analítico financiero con total de ventas cobradas, retención de comisiones PideGas (5%) y saldos netos (`/empresa/finanzas`).
- [x] Registro y conciliación de pagos multicanal: Yape, Plin, Tarjeta y Contra Entrega.
- [x] Solicitud y generación periódica de liquidaciones y transferencias bancarias.
- [x] Reportes y exportación en CSV/Excel compatible con UTF-8 BOM (`GET /api/v1/empresa/finanzas/exportar/csv`) con botón directo de descarga.
- [x] Vista imprimible optimizada para exportación a PDF (`@media print`) con membrete oficial PideGas y estado de cuenta.
- [x] Script de prueba end-to-end (`test_fase10.ps1`) y suite de pruebas unitarias (`FinanzasServicioTest`).

### FASE 11 — Soporte, Disputas y Archivos (COMPLETADA)
- [x] Módulo tripartito de tickets y chat de soporte para Clientes, Distribuidoras y Super Admin (`/cliente/soporte`, `/empresa/soporte`, `/admin/soporte`).
- [x] Ciclo de vida de incidentes con progresión de estados (`ABIERTO` -> `EN_PROCESO` -> `RESUELTO` -> `CERRADO`) y prioridades normadas.
- [x] Carga segura de comprobantes y fotos de evidencia de balones con fugas o válvulas dañadas (`/api/v1/archivos/subir` y `/api/v1/archivos/ver/**`).
- [x] Script de prueba end-to-end (`test_fase11.ps1`) y suite de pruebas unitarias (`SoporteServicioTest`).

### FASE 12 — Hardening, Auditoría y Producción (COMPLETADA)
- [x] Dashboard de Inteligencia Global para Super Admin (`/admin/dashboard`) con GMV total, comisiones de red y tasa de entrega exitosa.
- [x] Dashboard operativo y de ventas consolidadas para Distribuidoras (`/empresa/dashboard`) con evolución semanal y ranking de balones de cocina.
- [x] Hardening de cabeceras HTTP de seguridad en Spring Security (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
- [x] Soporte para Progressive Web App (PWA) móvil con `manifest.json` y metadatos de instalación en Android/iOS.
- [x] Optimización de bundles frontend en Next.js 16 (`npm run build` compilando 94/94 rutas sin errores).
- [x] Suite de pruebas automatizadas (`AnalyticsServicioTest`, `AuditoriaServicioTest` con 60/60 tests pasando en backend) y scripts E2E (`test_fase12.ps1`, `test_fase12_hardening.ps1`).
- [x] Rate limiting HTTP en endpoints sensibles (`/api/v1/auth/login`) con bloqueo en HTTP 429 Too Many Requests (umbral 15 r/m) protegiendo contra ataques de fuerza bruta.
- [x] Tabla y módulo de auditoría de eventos sensibles (`auditoria_eventos`, Flyway `V15__auditoria.sql`, captura forense de inicios de sesión, cambios de estado, IP y User-Agent).
- [x] Interfaz de visualización de bitácora forense para Super Admin (`/admin/auditoria`) con métricas en tiempo real y filtrado de eventos.
- [x] Ajuste final de directivas de caché estática y rate-limiting en `nginx/nginx.conf` (`limit_req_zone`, `burst=20 nodelay`, `Cache-Control` inmutable para `/_next/static/`).

### FASE 13 — Portal Web Informativo y Comercial Público (COMPLETADA)
- [x] Portal web corporativo en `/` con Hero interactivo, selector rápido de balones de cocina (10kg, 15kg, 45kg, Click-On vs Rosca) y cotizador en vivo.
- [x] Buscador de cobertura distrital y distribuidoras aliadas OSINERGMIN con tiempos de entrega en tiempo real y unidades activas.
- [x] Páginas públicas institucionales y comerciales:
  - `/nosotros`: Misión, visión, comparativa de mercado informal vs estándar PideGas, y pilares de seguridad.
  - `/productos`: Catálogo público con especificaciones técnicas (peso neto, tara, válvulas compatibles, precios sugeridos).
  - `/contacto`: Formulario interactivo, central telefónica, WhatsApp y protocolo de emergencias por fugas (116 Bomberos).
- [x] Páginas de cumplimiento normativo y marco legal:
  - `/terminos-servicio`: Régimen de intercambio de cilindros y verificación de tara en balanza digital.
  - `/terminos-condiciones`: Medios de pago (Yape/Plin/POS/Efectivo), tiempos de despacho, cancelaciones y puntos de recompensa.
  - `/politica-privacidad`: Protección de datos personales conforme a la Ley N° 29733 y Decreto Supremo 003-2013-JUS.
  - `/libro-reclamaciones`: Libro de reclamaciones virtual conforme a las exigencias de INDECOPI (Ley N° 29571).
- [x] Componentes de interfaz pública (`PublicNavbar` y `PublicFooter`) con redirección inteligente segmentada por rol:
  - **Cliente (`CLIENTE`):** Botón "Mi Cuenta" accede a `/cliente/pedidos` (ve **únicamente sus propios datos**, pedidos y puntos).
  - **Distribuidora (`EMPRESA`):** Botón "Panel Distribuidora" accede a `/empresa/dashboard` (ve **sus datos comerciales**, stock, flota y los clientes que le compran).
  - **Repartidor (`REPARTIDOR`):** Botón "Mis Entregas" accede a `/repartidor/pedidos` (ve rutas y pedidos asignados para entrega con PIN).
  - **Super Admin (`ADMIN`):** Botón "Panel Global Admin" accede a `/admin/dashboard` (puede **ver todo**: red de empresas, finanzas y auditoría).
- [x] Compilación de producción en Next.js 16 (`npm run build`) validada con 101/101 rutas generadas con código 0.


