# Checklist de Despliegue en Vercel

Esta guía paso a paso te ayudará a desplegar la aplicación en Vercel por primera vez.

## Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta en [Vercel](https://vercel.com) (gratis)
- [ ] Cuenta en GitHub, GitLab, o Bitbucket
- [ ] Git instalado en tu computadora
- [ ] Node.js instalado (para pruebas locales)

---

## Paso 1: Preparar el Repositorio Git

### 1.1 Inicializar Git (si no lo has hecho)

```bash
git init
```

### 1.2 Verificar que .gitignore está configurado

Asegúrate de que estos archivos/carpetas están en `.gitignore`:

```
node_modules/
.env
.env.local
data/*.db
.vercel
```

### 1.3 Hacer commit de todos los archivos

```bash
git add .
git commit -m "Initial commit - Graduation invitation system"
```

### 1.4 Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en "New repository"
3. Nombre: `graduacion-eduardo-web` (o el que prefieras)
4. Descripción: "Sistema de invitaciones para graduación"
5. Visibilidad: Privado (recomendado) o Público
6. NO inicialices con README, .gitignore, o licencia
7. Click en "Create repository"

### 1.5 Conectar y subir a GitHub

```bash
git remote add origin https://github.com/TU-USUARIO/graduacion-eduardo-web.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Tu código debe estar visible en GitHub

---

## Paso 2: Conectar Vercel con GitHub

### 2.1 Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel para acceder a tu cuenta de GitHub

### 2.2 Importar proyecto

1. En el dashboard de Vercel, click en "Add New..."
2. Selecciona "Project"
3. Click en "Import" junto a tu repositorio `graduacion-eduardo-web`
4. Si no aparece, click en "Adjust GitHub App Permissions" y autoriza el repositorio

### 2.3 Configurar proyecto

**Configure Project:**

- **Framework Preset:** Other (o None)
- **Root Directory:** `./` (dejar por defecto)
- **Build Command:** Dejar vacío o `npm install`
- **Output Directory:** Dejar vacío
- **Install Command:** `npm install`

**NO hagas click en "Deploy" todavía**

✅ **Checkpoint:** Estás en la pantalla de configuración del proyecto

---

## Paso 3: Configurar Variables de Entorno

### 3.1 Expandir "Environment Variables"

En la pantalla de configuración del proyecto, expande la sección "Environment Variables"

### 3.2 Agregar cada variable

Agrega las siguientes variables una por una:

#### Variable 1: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: DATABASE_PATH
- **Name:** `DATABASE_PATH`
- **Value:** `/tmp/invitations.db`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: ADMIN_PASSWORD
- **Name:** `ADMIN_PASSWORD`
- **Value:** `[TU-PASSWORD-SEGURO]` (ej: `Gr4du4c10n2026!Edu@rd0`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Importante:** Usa un password fuerte y único

#### Variable 4: BASE_URL
- **Name:** `BASE_URL`
- **Value:** `https://graduacion-eduardo.vercel.app` (ajusta según tu URL)
- **Environments:** ✅ Production

**Nota:** Para BASE_URL, puedes usar un placeholder por ahora y actualizarlo después del primer deploy.

✅ **Checkpoint:** Debes tener 4 variables configuradas

---

## Paso 4: Desplegar

### 4.1 Iniciar deployment

1. Verifica que todas las variables estén configuradas
2. Click en "Deploy"
3. Espera mientras Vercel construye y despliega tu aplicación (1-3 minutos)

### 4.2 Observar el proceso

Verás logs en tiempo real:
- Installing dependencies
- Building
- Deploying

### 4.3 Deployment exitoso

Cuando termine, verás:
- ✅ "Congratulations! Your project has been deployed"
- Tu URL de Vercel (ej: `https://graduacion-eduardo-web.vercel.app`)

✅ **Checkpoint:** El deployment debe mostrar estado "Ready"

---

## Paso 5: Actualizar BASE_URL

### 5.1 Copiar tu URL de Vercel

Copia la URL completa de tu deployment (ej: `https://graduacion-eduardo-web.vercel.app`)

### 5.2 Actualizar variable de entorno

1. En el dashboard de Vercel, ve a tu proyecto
2. Click en "Settings"
3. Click en "Environment Variables"
4. Encuentra `BASE_URL`
5. Click en "..." > "Edit"
6. Actualiza el valor con tu URL real
7. Click en "Save"

### 5.3 Redeploy

1. Ve a "Deployments"
2. Click en el deployment más reciente
3. Click en "..." (tres puntos)
4. Click en "Redeploy"
5. Confirma "Redeploy"

✅ **Checkpoint:** BASE_URL debe tener tu URL real de Vercel

---

## Paso 6: Verificar Funcionalidad

### 6.1 Health Check

Abre en tu navegador:
```
https://tu-app.vercel.app/api/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

❌ Si ves error, revisa los logs en Vercel Dashboard > Deployments > [tu deployment] > Logs

### 6.2 Página Principal

Abre:
```
https://tu-app.vercel.app
```

**Resultado esperado:**
- Página de invitación carga correctamente
- Estilos se aplican correctamente
- No hay errores en la consola del navegador (F12)

### 6.3 Panel Admin

Abre:
```
https://tu-app.vercel.app/admin
```

**Resultado esperado:**
- Modal de autenticación aparece
- Ingresa el password que configuraste en ADMIN_PASSWORD
- Debes poder acceder al panel admin

### 6.4 Importar Invitados (Prueba Completa)

1. En el panel admin, prepara un archivo Excel de prueba:
   - Columnas: `nombre`, `telefono`, `pases`
   - Agrega 2-3 invitados de prueba

2. Arrastra el archivo al área de importación
3. Click en "Importar"

**Resultado esperado:**
- Mensaje de éxito: "X invitados importados"
- Los invitados aparecen en la lista
- Cada invitado tiene un enlace único

### 6.5 Probar Enlace de Invitado

1. Copia uno de los enlaces generados
2. Ábrelo en una ventana de incógnito
3. Verifica que:
   - El nombre del invitado aparece correctamente
   - El formulario de confirmación funciona
   - Puedes agregar acompañantes
   - El botón de enviar funciona

### 6.6 Verificar Confirmación

1. Envía una confirmación desde la página de invitado
2. Regresa al panel admin
3. Verifica que el invitado aparece como "Confirmado"
4. Verifica que los acompañantes se muestran correctamente

### 6.7 Exportar Confirmaciones

1. En el panel admin, click en "Exportar Confirmaciones"
2. Descarga el archivo Excel
3. Abre el archivo y verifica que contiene:
   - Todas las columnas requeridas
   - Los datos de confirmación correctos

✅ **Checkpoint:** Todas las funcionalidades deben trabajar correctamente

---

## Paso 7: Configuración Adicional (Opcional)

### 7.1 Dominio Personalizado

Si tienes un dominio propio:

1. Settings > Domains
2. Click en "Add"
3. Ingresa tu dominio (ej: `graduacion-eduardo.com`)
4. Sigue las instrucciones para configurar DNS
5. Actualiza BASE_URL con tu nuevo dominio

### 7.2 Configurar Notificaciones

1. Settings > Notifications
2. Configura notificaciones por email para:
   - Deployment failures
   - Deployment success (opcional)

### 7.3 Configurar Git Integration

1. Settings > Git
2. Configura:
   - **Production Branch:** `main`
   - **Auto-deploy:** ✅ Enabled
   - **Preview Deployments:** ✅ Enabled

---

## Paso 8: Documentar URLs

Guarda estas URLs en un lugar seguro:

```
Aplicación Principal: https://tu-app.vercel.app
Panel Admin: https://tu-app.vercel.app/admin
Vercel Dashboard: https://vercel.com/tu-usuario/tu-proyecto
GitHub Repo: https://github.com/tu-usuario/graduacion-eduardo-web

Admin Password: [GUARDADO EN LUGAR SEGURO]
```

---

## Troubleshooting

### Error: "Build failed"

**Causa:** Problemas con dependencias o código

**Solución:**
1. Revisa los logs en Vercel Dashboard
2. Verifica que `package.json` tiene todas las dependencias
3. Prueba localmente: `npm install && npm start`
4. Corrige errores y haz push de nuevo

### Error: "Function timeout"

**Causa:** Una función serverless excedió 10 segundos

**Solución:**
1. Reduce el tamaño de archivos Excel
2. Optimiza queries de base de datos
3. Considera upgrade a Vercel Pro para timeouts más largos

### Error: "ADMIN_PASSWORD is not defined"

**Causa:** Variable de entorno no configurada

**Solución:**
1. Ve a Settings > Environment Variables
2. Verifica que ADMIN_PASSWORD existe
3. Redeploy la aplicación

### Los enlaces no funcionan

**Causa:** BASE_URL incorrecta

**Solución:**
1. Verifica BASE_URL en Settings > Environment Variables
2. Debe ser tu URL completa de Vercel
3. No debe terminar en `/`
4. Redeploy después de corregir

### La base de datos se borra

**Causa:** SQLite en `/tmp` es temporal en Vercel

**Solución:**
- Esto es esperado en Vercel
- Exporta datos regularmente
- Para producción real, migra a base de datos persistente (Postgres, MySQL)

---

## Próximos Pasos

Después del deployment exitoso:

1. **Prueba exhaustiva:**
   - Importa tu lista real de invitados
   - Genera todos los enlaces
   - Prueba varios enlaces en diferentes dispositivos

2. **Prepara mensajes de WhatsApp:**
   - Usa la plantilla del README
   - Personaliza el mensaje
   - Prueba enviando a ti mismo primero

3. **Monitorea:**
   - Revisa logs en Vercel Dashboard regularmente
   - Verifica confirmaciones diariamente
   - Exporta datos como backup

4. **Backup:**
   - Exporta la lista de invitados (Excel)
   - Exporta confirmaciones regularmente
   - Guarda copias locales

---

## Checklist Final

Antes de enviar invitaciones:

- [ ] Deployment exitoso en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Health check responde correctamente
- [ ] Página principal carga sin errores
- [ ] Panel admin funciona con password
- [ ] Importación de Excel funciona
- [ ] Enlaces de invitación funcionan
- [ ] Formulario de confirmación funciona
- [ ] Exportación de confirmaciones funciona
- [ ] Probado en móvil y desktop
- [ ] BASE_URL correcta en enlaces generados
- [ ] Password de admin guardado en lugar seguro
- [ ] Backup de datos configurado

---

## Soporte

Si encuentras problemas:

1. **Revisa los logs:** Vercel Dashboard > Deployments > [deployment] > Logs
2. **Consulta la documentación:** Ver `DEPLOYMENT.md` y `ENVIRONMENT_VARIABLES.md`
3. **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
4. **Vercel Support:** [vercel.com/support](https://vercel.com/support)

---

¡Felicidades! Tu sistema de invitaciones está desplegado y listo para usar. 🎓
