# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.1.12] - 2025-12-16

### Corregido
- **Web Crash**: Solucionado error crítico "Application error" por hidratación en Sidebar y datos indefinidos en Dashboard.
- **Estabilidad**: Mejorada la comprobación de estado de la base de datos.

## [0.1.11] - 2025-12-16

### Añadido
- **Base de Datos**: Migración completa de almacenamiento local (JSON) a MySQL (Hostinger compatible).
- **Despliegue**: Optimización de `imageUrls` usando tipo JSON para compatibilidad con MySQL.

### Cambiado
- **PDF**: Diseño compactado para imprimir en una sola hoja A4.
- **Build**: Sincronización de base de datos (`prisma db push`) movida al script de inicio (`start`) para evitar errores de compilación por falta de conexión a BD.

## [0.0.3] - 2025-12-05

### Corregido
- 🎨 Reparado el modo oscuro/claro (CSS variables incorrectas)
- 🐛 Solucionado error en listado de reparaciones (`repairs.filter`)

### Añadido
- 🏷️ Visualización de versión en el Dashboard

## [0.0.2] - 2025-12-05

### Corregido
- 🐛 Corrección de error crítico en nueva reparación (`technicians.map`) cuando falla la carga de técnicos
- 🛡️ Interfaces de usuario más robustas ante fallos de API

### Añadido
- 🌓 Selector de tema (Día/Noche) en Ajustes
- 🔧 Configuración persistente de tema

## [0.0.1] - 2025-12-04

### Añadido
- ✨ Sistema de gestión de reparaciones completo
- 📊 Dashboard con estadísticas en tiempo real
  - Total de reparaciones
  - Reparaciones pendientes
  - Reparaciones en progreso
  - Reparaciones completadas
- 📝 Formulario de nueva reparación
  - Generación automática de número de operativa (REP-YYYY-XXX)
  - Validación de campos obligatorios (teléfono y email)
  - Información del cliente (nombre, apellido, teléfono*, email*, WhatsApp)
  - Información del equipo (marca, modelo, número de serie, técnico asignado)
  - Detalles de reparación (factura, motivo, diagnóstico, resultado)
  - Subida múltiple de imágenes a Vercel Blob
- 📋 Listado de reparaciones
  - Tabla con todas las reparaciones
  - Filtro por estado (Pendiente, En Progreso, Completada, Cancelada)
  - Búsqueda por nombre de cliente
  - Badges de estado con colores
  - Acciones: Ver PDF, Eliminar
- 🖨️ Generación automática de PDF
  - PDF profesional con toda la información de la reparación
  - Diálogo de impresión automático
  - Diseño responsive para impresión
- ⚙️ Página de configuración
  - Cambio de contraseña (placeholder)
  - Gestión de roles de usuario (placeholder)
  - Gestión de técnicos (placeholder)
- 🎨 Diseño minimalista oscuro
  - Tema oscuro con paleta slate/zinc
  - Componentes reutilizables (sidebar, badges, cards)
  - Responsive para móviles y tablets
- 🗄️ Base de datos con Prisma
  - Modelo Repair con todos los campos
  - Modelo Technician para técnicos asignados
  - Modelo Settings para configuración
- 🚀 Configuración para despliegue en Vercel
  - Vercel Postgres para base de datos
  - Vercel Blob para almacenamiento de imágenes
  - Scripts de seed con datos iniciales

### Tecnologías
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Vercel Blob
- TailwindCSS
- Lucide React Icons
- Zod (validación)

---

## Formato de Versiones

- **MAJOR.MINOR.PATCH** (ej: 1.2.3)
  - **MAJOR**: Cambios incompatibles en la API
  - **MINOR**: Nueva funcionalidad compatible con versiones anteriores
  - **PATCH**: Correcciones de errores compatibles con versiones anteriores

### Categorías de Cambios
- **Añadido**: Nuevas funcionalidades
- **Cambiado**: Cambios en funcionalidades existentes
- **Obsoleto**: Funcionalidades que serán eliminadas
- **Eliminado**: Funcionalidades eliminadas
- **Corregido**: Corrección de errores
- **Seguridad**: Vulnerabilidades corregidas
