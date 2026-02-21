# Comandos Útiles de Vercel

Referencia rápida de comandos para gestionar tu deployment en Vercel.

## Instalación de Vercel CLI

```bash
# Instalar globalmente
npm install -g vercel

# Verificar instalación
vercel --version
```

---

## Autenticación

```bash
# Login a Vercel
vercel login

# Logout
vercel logout

# Ver usuario actual
vercel whoami
```

---

## Deployment

### Deploy desde línea de comandos

```bash
# Deploy a preview (staging)
vercel

# Deploy a production
vercel --prod

# Deploy con confirmación automática
vercel --yes --prod
```

### Deploy desde Git

```bash
# Hacer cambios
git add .
git commit -m "Update feature"
git push

# Vercel despliega automáticamente
# Preview: cualquier branch
# Production: branch main/master
```

---

## Variables de Entorno

### Listar variables

```bash
# Ver todas las variables
vercel env ls

# Ver variables de production
vercel env ls production

# Ver variables de preview
vercel env ls preview
```

### Agregar variables

```bash
# Agregar variable interactivamente
vercel env add

# Agregar variable específica
vercel env add NODE_ENV production

# Agregar desde archivo
vercel env pull .env.local
```

### Remover variables

```bash
# Remover variable
vercel env rm VARIABLE_NAME production
```

### Actualizar variables

```bash
# No hay comando directo para actualizar
# Debes remover y agregar de nuevo
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

---

## Gestión de Proyectos

### Listar proyectos

```bash
# Ver todos tus proyectos
vercel list

# Ver deployments de un proyecto
vercel list graduacion-eduardo-web
```

### Información del proyecto

```bash
# Ver info del proyecto actual
vercel inspect

# Ver info de un deployment específico
vercel inspect [deployment-url]
```

### Remover proyecto

```bash
# Remover proyecto (cuidado!)
vercel remove graduacion-eduardo-web
```

---

## Logs y Debugging

### Ver logs

```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de un deployment específico
vercel logs [deployment-url]

# Ver logs de production
vercel logs --prod

# Seguir logs en tiempo real
vercel logs --follow
```

### Debugging

```bash
# Ver detalles de build
vercel build

# Ejecutar localmente (simula Vercel)
vercel dev
```

---

## Dominios

### Listar dominios

```bash
# Ver todos los dominios
vercel domains ls

# Ver dominios de un proyecto
vercel domains ls graduacion-eduardo-web
```

### Agregar dominio

```bash
# Agregar dominio personalizado
vercel domains add example.com

# Agregar dominio a proyecto específico
vercel domains add example.com graduacion-eduardo-web
```

### Remover dominio

```bash
# Remover dominio
vercel domains rm example.com
```

---

## Alias y URLs

### Crear alias

```bash
# Crear alias para deployment
vercel alias [deployment-url] [alias]

# Ejemplo
vercel alias graduacion-eduardo-abc123.vercel.app graduacion.vercel.app
```

### Promover deployment

```bash
# Promover preview a production
vercel promote [deployment-url]
```

---

## Rollback

### Volver a deployment anterior

```bash
# Listar deployments
vercel list

# Promover deployment anterior a production
vercel promote [deployment-url-anterior]
```

---

## Secrets (para valores sensibles)

### Crear secret

```bash
# Crear secret
vercel secrets add admin-password "mi-password-seguro"

# Usar secret en variable de entorno
vercel env add ADMIN_PASSWORD @admin-password production
```

### Listar secrets

```bash
# Ver todos los secrets
vercel secrets ls
```

### Remover secret

```bash
# Remover secret
vercel secrets rm admin-password
```

---

## Configuración Local

### Inicializar proyecto

```bash
# Link proyecto local con Vercel
vercel link

# Descargar variables de entorno
vercel env pull .env.local
```

### Desarrollo local

```bash
# Ejecutar en modo desarrollo (simula Vercel)
vercel dev

# Especificar puerto
vercel dev --listen 3000
```

---

## Información y Ayuda

### Ver ayuda

```bash
# Ayuda general
vercel help

# Ayuda de comando específico
vercel help deploy
vercel help env
vercel help domains
```

### Ver versión

```bash
# Ver versión de CLI
vercel --version

# Actualizar CLI
npm update -g vercel
```

---

## Workflows Comunes

### Workflow 1: Actualizar código

```bash
# 1. Hacer cambios en el código
# 2. Commit y push
git add .
git commit -m "Update feature"
git push

# 3. Vercel despliega automáticamente
# 4. Verificar en dashboard o CLI
vercel list
```

### Workflow 2: Actualizar variable de entorno

```bash
# 1. Remover variable antigua
vercel env rm VARIABLE_NAME production

# 2. Agregar variable nueva
vercel env add VARIABLE_NAME production

# 3. Redeploy
vercel --prod
```

### Workflow 3: Rollback a versión anterior

```bash
# 1. Listar deployments
vercel list

# 2. Copiar URL del deployment anterior que funcionaba
# 3. Promover a production
vercel promote [deployment-url-anterior]
```

### Workflow 4: Debug de errores

```bash
# 1. Ver logs
vercel logs --prod

# 2. Inspeccionar deployment
vercel inspect

# 3. Probar localmente
vercel dev

# 4. Ver variables de entorno
vercel env ls production
```

### Workflow 5: Setup inicial

```bash
# 1. Login
vercel login

# 2. Link proyecto
vercel link

# 3. Configurar variables
vercel env add NODE_ENV production
vercel env add DATABASE_PATH production
vercel env add ADMIN_PASSWORD production
vercel env add BASE_URL production

# 4. Deploy
vercel --prod
```

---

## Tips y Mejores Prácticas

### 1. Usar secrets para valores sensibles

```bash
# ❌ No hacer esto
vercel env add ADMIN_PASSWORD "mi-password" production

# ✅ Hacer esto
vercel secrets add admin-password "mi-password"
vercel env add ADMIN_PASSWORD @admin-password production
```

### 2. Probar en preview antes de production

```bash
# Deploy a preview primero
vercel

# Probar en la URL de preview
# Si todo funciona, promover a production
vercel promote [preview-url]
```

### 3. Usar vercel dev para desarrollo local

```bash
# En lugar de npm start
vercel dev

# Simula el entorno de Vercel localmente
# Incluye serverless functions
```

### 4. Mantener variables sincronizadas

```bash
# Descargar variables de Vercel a local
vercel env pull .env.local

# Ahora .env.local tiene las mismas variables que production
```

### 5. Monitorear deployments

```bash
# Ver logs en tiempo real
vercel logs --follow

# Útil para debugging durante deployment
```

---

## Atajos de Teclado en Dashboard

Cuando estés en el dashboard de Vercel:

- `?` - Ver todos los atajos
- `g d` - Ir a deployments
- `g s` - Ir a settings
- `g p` - Ir a projects
- `/` - Buscar

---

## URLs Útiles

- **Dashboard:** https://vercel.com/dashboard
- **Docs:** https://vercel.com/docs
- **CLI Docs:** https://vercel.com/docs/cli
- **Status:** https://vercel-status.com
- **Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions

---

## Troubleshooting Rápido

### "Command not found: vercel"

```bash
# Reinstalar CLI
npm install -g vercel

# O usar npx
npx vercel
```

### "Not authorized"

```bash
# Re-login
vercel logout
vercel login
```

### "Project not found"

```bash
# Re-link proyecto
vercel link
```

### "Build failed"

```bash
# Ver logs detallados
vercel logs [deployment-url]

# Probar build localmente
npm install
npm run build
```

---

## Cheat Sheet Rápido

```bash
# Deploy
vercel --prod                    # Deploy a production
vercel                           # Deploy a preview

# Variables
vercel env ls                    # Listar variables
vercel env add VAR_NAME          # Agregar variable
vercel env pull .env.local       # Descargar variables

# Logs
vercel logs --prod               # Ver logs de production
vercel logs --follow             # Seguir logs en tiempo real

# Proyectos
vercel list                      # Listar deployments
vercel inspect                   # Info del proyecto

# Rollback
vercel promote [url]             # Promover deployment a production

# Desarrollo
vercel dev                       # Ejecutar localmente
vercel link                      # Link proyecto local

# Ayuda
vercel help                      # Ver ayuda
vercel help [command]            # Ayuda de comando específico
```

---

¡Guarda este archivo como referencia rápida para trabajar con Vercel! 🚀
