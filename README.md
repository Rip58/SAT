# SAT Management Application

Sistema de gestión de servicio técnico para reparaciones de ordenadores y portátiles.

## Guía de Despliegue en Vercel

### 1. Preparar el Repositorio Git

```bash
cd "/Volumes/Sandisk/4 - Gravity APP/SAT"
git init
git add .
git commit -m "Initial commit: SAT management application"
```

### 2. Subir a GitHub

1. Crea un nuevo repositorio en GitHub (sin README, .gitignore ni licencia)
2. Ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/sat-management.git
git branch -M main
git push -u origin main
```

### 3. Configurar Base de Datos en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Crea un nuevo proyecto desde tu repositorio de GitHub
3. **Antes de desplegar**, ve a Storage → Create Database → Postgres
4. Copia la variable `DATABASE_URL` que se genera automáticamente

### 4. Configurar Vercel Blob

1. En el mismo proyecto, ve a Storage → Create Store → Blob
2. Copia el token `BLOB_READ_WRITE_TOKEN`

### 5. Variables de Entorno

En Vercel → Settings → Environment Variables, añade:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | (copiado del paso 3) |
| `BLOB_READ_WRITE_TOKEN` | (copiado del paso 4) |

### 6. Desplegar

1. Ve a Deployments → Redeploy
2. Espera a que termine el despliegue
3. Una vez desplegado, ejecuta las migraciones:

```bash
# Desde tu terminal local
npx vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

O desde Vercel CLI:

```bash
vercel env pull
npx prisma db push
npx prisma db seed
```

### 7. Verificar

Visita tu aplicación en la URL proporcionada por Vercel (ej: `https://sat-management.vercel.app`)

## Desarrollo Local

### Requisitos

- Node.js 18+
- PostgreSQL (local o remoto)

### Setup

1. Instalar dependencias:
```bash
npm install
```

2. Configurar `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sat_db?schema=public"
BLOB_READ_WRITE_TOKEN="your_token_here"
```

3. Configurar base de datos:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

## Características Principales

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Formulario de reparación con validación (teléfono y email obligatorios)
- ✅ Listado con filtros por estado y búsqueda por cliente
- ✅ Generación automática de PDF para impresión
- ✅ Subida de imágenes a Vercel Blob
- ✅ Diseño oscuro y minimalista
- ✅ Responsive (móvil, tablet, desktop)

## Soporte

Para problemas o preguntas, consulta la documentación de:
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Vercel](https://vercel.com/docs)
