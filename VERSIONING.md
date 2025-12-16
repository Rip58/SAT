# Guía de Versionado

## Sistema de Versiones

Este proyecto utiliza [Semantic Versioning](https://semver.org/lang/es/) (SemVer).

### Formato: MAJOR.MINOR.PATCH

- **MAJOR** (X.0.0): Cambios incompatibles en la API
- **MINOR** (0.X.0): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (0.0.X): Correcciones de errores compatibles con versiones anteriores

### Versión Actual

La versión actual se define en:
- `package.json` → campo `version`
- `lib/constants.ts` → constante `APP_VERSION`

## Cómo Actualizar la Versión

### 1. Decidir el tipo de cambio

- **Bug fix** → Incrementar PATCH (0.0.1 → 0.0.2)
- **Nueva funcionalidad** → Incrementar MINOR (0.0.1 → 0.1.0)
- **Cambio incompatible** → Incrementar MAJOR (0.0.1 → 1.0.0)

### 2. Actualizar archivos

Actualizar la versión en estos archivos:

#### a) package.json
```json
{
  "version": "0.0.2"
}
```

#### b) lib/constants.ts
```typescript
export const APP_VERSION = '0.0.2'
```

### 3. Documentar en CHANGELOG.md

Añadir una nueva sección al inicio del archivo:

```markdown
## [0.0.2] - 2025-12-05

### Corregido
- 🐛 Descripción del bug corregido

### Añadido
- ✨ Nueva funcionalidad implementada
```

### 4. Commit y Tag

```bash
# Commit de los cambios
git add .
git commit -m "chore: bump version to 0.0.2"

# Crear tag
git tag -a v0.0.2 -m "Version 0.0.2"

# Push con tags
git push origin main --tags
```

## Categorías de Cambios en CHANGELOG

Usar estas categorías para documentar cambios:

- **Añadido** (✨): Nuevas funcionalidades
- **Cambiado** (🔄): Cambios en funcionalidades existentes
- **Obsoleto** (⚠️): Funcionalidades que serán eliminadas
- **Eliminado** (🗑️): Funcionalidades eliminadas
- **Corregido** (🐛): Corrección de errores
- **Seguridad** (🔒): Vulnerabilidades corregidas

## Ejemplo Completo

### Escenario: Corregir un bug en el formulario

1. **Tipo**: PATCH (bug fix)
2. **Nueva versión**: 0.0.1 → 0.0.2

3. **Actualizar package.json**:
```json
{
  "version": "0.0.2"
}
```

4. **Actualizar lib/constants.ts**:
```typescript
export const APP_VERSION = '0.0.2'
```

5. **Actualizar CHANGELOG.md**:
```markdown
## [0.0.2] - 2025-12-05

### Corregido
- 🐛 Error de validación en el campo de teléfono
- 🐛 PDF no se generaba correctamente en Safari

## [0.0.1] - 2025-12-04
...
```

6. **Commit**:
```bash
git add .
git commit -m "fix: validation error in phone field"
git tag -a v0.0.2 -m "Version 0.0.2 - Bug fixes"
git push origin main --tags
```

## Notas

- La versión se muestra automáticamente en el sidebar de la aplicación
- Mantener siempre sincronizados `package.json` y `lib/constants.ts`
- Documentar TODOS los cambios en `CHANGELOG.md`
- Usar commits convencionales: `feat:`, `fix:`, `chore:`, etc.
