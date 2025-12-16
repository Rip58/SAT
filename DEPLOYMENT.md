# Guía de Despliegue en Hostinger

## Requisitos Previos
- Node.js 18+ instalado en el servidor
- Base de datos MySQL creada y accesible
- Credenciales de conexión a mano

## Pasos de Configuración Inicial

### 1. Variables de Entorno
Crear archivo `.env` en el servidor con:
```
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_bd"
```

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Sincronización de Base de Datos (SOLO UNA VEZ)
```bash
npm run deploy:setup
```
Este comando crea las tablas en la base de datos.

### 4. Build de Producción
```bash
npm run build
```

### 5. Iniciar Aplicación
```bash
npm start
```

## Solución de Problemas

### Error 500 en Chunks Estáticos
- **Causa**: El servidor Next.js no está ejecutándose
- **Solución**: Verificar que `npm start` se ejecute sin errores
- **Verificar logs**: Revisar la consola del servidor para errores de conexión a BD

### Base de Datos No Conecta
- Verificar que `DATABASE_URL` esté configurada correctamente
- Comprobar que la base de datos MySQL esté activa
- Verificar permisos del usuario de base de datos

### Aplicación No Inicia
1. Verificar que el puerto 3000 esté libre
2. Comprobar logs de errores
3. Asegurar que todas las dependencias estén instaladas
