# Guía de Despliegue en Vercel

Este documento describe cómo desplegar la aplicación de invitaciones en Vercel.

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio Git (GitHub, GitLab, o Bitbucket)
- Node.js instalado localmente para pruebas

## Configuración del Proyecto

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio Git
4. Vercel detectará automáticamente la configuración

### 3. Configurar Variables de Entorno

En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `DATABASE_PATH` | `/tmp/invitations.db` | Ruta de la base de datos (usar /tmp en Vercel) |
| `ADMIN_PASSWORD` | `<tu-password-seguro>` | Password para el panel admin |
| `BASE_URL` | `https://tu-app.vercel.app` | URL base de tu aplicación |

**Importante:** 
- Usa un password seguro para `ADMIN_PASSWORD`
- Reemplaza `tu-app.vercel.app` con tu URL real de Vercel
- La base de datos en `/tmp` es temporal y se reinicia con cada deployment

### 4. Desplegar

Vercel desplegará automáticamente cuando hagas push a tu rama principal:

```bash
git add .
git commit -m "Deploy to Vercel"
git push
```

## Arquitectura Serverless

La aplicación usa funciones serverless de Vercel:

```
/api/health.js          → GET /api/health
/api/guest.js           → GET /api/guest/:id
/api/confirm.js         → POST /api/confirm
/api/admin/import.js    → POST /api/admin/import
/api/admin/guests.js    → GET /api/admin/guests
/api/admin/export.js    → GET /api/admin/export
```

Cada función se ejecuta independientemente y tiene:
- 1024 MB de memoria
- 10 segundos de timeout máximo

## Limitaciones de Vercel

### Base de Datos Temporal

⚠️ **Importante:** La base de datos SQLite en `/tmp` es temporal y se borra con cada nuevo deployment o después de inactividad.

**Soluciones:**

1. **Para producción real:** Migrar a una base de datos persistente:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [PlanetScale](https://planetscale.com/)
   - [Supabase](https://supabase.com/)

2. **Para uso temporal:** Exportar datos regularmente usando el endpoint `/api/admin/export`

### Límites de Serverless

- Cada función tiene un timeout de 10 segundos (Hobby plan)
- Archivos Excel grandes pueden exceder el límite de memoria
- Recomendado: máximo 500 invitados por importación

## Verificación del Despliegue

Después del despliegue, verifica:

1. **Health Check:**
   ```bash
   curl https://tu-app.vercel.app/api/health
   ```
   Debe retornar: `{"status":"ok","message":"Server is running"}`

2. **Página Principal:**
   Visita `https://tu-app.vercel.app` - debe cargar la página de invitación

3. **Panel Admin:**
   Visita `https://tu-app.vercel.app/admin` - debe solicitar password

## Troubleshooting

### Error: "Database is locked"

La base de datos SQLite puede tener problemas de concurrencia en serverless. Considera migrar a una base de datos cliente-servidor.

### Error: "Function timeout"

Si las funciones exceden 10 segundos:
- Reduce el tamaño de archivos Excel
- Considera actualizar a Vercel Pro para timeouts más largos

### Error: "Module not found"

Asegúrate de que todas las dependencias estén en `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

## Monitoreo

Vercel proporciona:
- Logs en tiempo real en el dashboard
- Métricas de uso y performance
- Alertas de errores

Accede a los logs en: `https://vercel.com/<tu-usuario>/<tu-proyecto>/logs`

## Rollback

Si algo sale mal, puedes hacer rollback a un deployment anterior:

1. Ve al dashboard de Vercel
2. Selecciona "Deployments"
3. Encuentra el deployment anterior que funcionaba
4. Haz clic en "..." > "Promote to Production"

## Desarrollo Local

Para probar localmente antes de desplegar:

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores locales

# Iniciar servidor
npm start

# Ejecutar tests
npm test
```

La aplicación estará disponible en `http://localhost:3000`

## Próximos Pasos

Para un sistema de producción robusto, considera:

1. Migrar a base de datos persistente (Postgres, MySQL)
2. Implementar autenticación más robusta (JWT, OAuth)
3. Agregar rate limiting para prevenir abuso
4. Configurar dominio personalizado
5. Implementar backups automáticos de datos
6. Agregar analytics y monitoreo

## Soporte

Para problemas con Vercel:
- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)
