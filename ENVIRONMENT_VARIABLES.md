# Configuración de Variables de Entorno

Este documento describe todas las variables de entorno necesarias para la aplicación.

## Variables Requeridas

### 1. NODE_ENV

**Descripción:** Define el entorno de ejecución de la aplicación.

**Valores:**
- `development` - Para desarrollo local
- `production` - Para producción en Vercel

**Configuración en Vercel:**
1. Ve a tu proyecto en Vercel Dashboard
2. Settings > Environment Variables
3. Agrega:
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - **Environments:** Production, Preview, Development

---

### 2. DATABASE_PATH

**Descripción:** Ruta al archivo de base de datos SQLite.

**Valores:**
- Local: `./data/invitations.db`
- Vercel: `/tmp/invitations.db`

**Configuración en Vercel:**
1. Settings > Environment Variables
2. Agrega:
   - **Key:** `DATABASE_PATH`
   - **Value:** `/tmp/invitations.db`
   - **Environments:** Production, Preview, Development

**⚠️ Importante:** 
- En Vercel, solo el directorio `/tmp` es escribible
- Los datos en `/tmp` son temporales y se borran con cada deployment
- Para producción, considera usar una base de datos persistente

---

### 3. ADMIN_PASSWORD

**Descripción:** Password para acceder al panel administrativo.

**Seguridad:**
- Usa un password fuerte (mínimo 12 caracteres)
- Incluye mayúsculas, minúsculas, números y símbolos
- No compartas este password públicamente
- Cámbialo regularmente

**Configuración en Vercel:**
1. Settings > Environment Variables
2. Agrega:
   - **Key:** `ADMIN_PASSWORD`
   - **Value:** `<tu-password-seguro>`
   - **Environments:** Production, Preview, Development
3. ✅ Marca como "Sensitive" para ocultar el valor

**Ejemplo de password seguro:**
```
Gr4du4c10n2026!Edu@rd0
```

**Generador de passwords:**
```bash
# En Linux/Mac, genera un password aleatorio:
openssl rand -base64 16
```

---

### 4. BASE_URL

**Descripción:** URL base de la aplicación, usada para generar enlaces de invitación.

**Valores:**
- Local: `http://localhost:3000`
- Vercel: `https://tu-app.vercel.app`

**Configuración en Vercel:**
1. Primero despliega la aplicación para obtener tu URL de Vercel
2. Copia la URL (ej: `https://graduacion-eduardo.vercel.app`)
3. Settings > Environment Variables
4. Agrega:
   - **Key:** `BASE_URL`
   - **Value:** `https://tu-app.vercel.app`
   - **Environments:** Production

**Para Preview/Development:**
- Puedes usar `https://$VERCEL_URL` que se resuelve automáticamente
- O configurar URLs específicas para cada entorno

---

## Configuración Paso a Paso en Vercel

### Método 1: Desde el Dashboard

1. **Accede a tu proyecto:**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecciona tu proyecto

2. **Abre configuración:**
   - Click en "Settings" en la barra superior
   - Click en "Environment Variables" en el menú lateral

3. **Agrega cada variable:**
   - Click en "Add New"
   - Ingresa el nombre de la variable (Key)
   - Ingresa el valor (Value)
   - Selecciona los entornos (Production, Preview, Development)
   - Click en "Save"

4. **Redeploy:**
   - Las variables solo se aplican en nuevos deployments
   - Ve a "Deployments" > Click en "..." > "Redeploy"

### Método 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Agregar variables
vercel env add NODE_ENV production
vercel env add DATABASE_PATH /tmp/invitations.db
vercel env add ADMIN_PASSWORD <tu-password>
vercel env add BASE_URL https://tu-app.vercel.app

# Redeploy
vercel --prod
```

---

## Configuración Local (.env)

Para desarrollo local, crea un archivo `.env` en la raíz del proyecto:

```bash
# Copiar el ejemplo
cp .env.example .env
```

Edita `.env` con tus valores locales:

```env
NODE_ENV=development
DATABASE_PATH=./data/invitations.db
ADMIN_PASSWORD=admin123
BASE_URL=http://localhost:3000
```

**⚠️ Importante:** 
- Nunca subas el archivo `.env` a Git
- Ya está incluido en `.gitignore`
- Usa passwords diferentes para local y producción

---

## Verificación

### Verificar que las variables están configuradas:

**En Vercel:**
1. Settings > Environment Variables
2. Verifica que todas las variables estén listadas
3. Los valores sensibles aparecerán ocultos

**En la aplicación:**

Crea un endpoint temporal para verificar (solo en desarrollo):

```javascript
// En server.js (SOLO PARA TESTING, REMOVER EN PRODUCCIÓN)
app.get('/api/debug/env', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_PATH: process.env.DATABASE_PATH,
    BASE_URL: process.env.BASE_URL,
    HAS_ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD
  });
});
```

Visita: `https://tu-app.vercel.app/api/debug/env`

**⚠️ IMPORTANTE:** Elimina este endpoint antes de producción.

---

## Troubleshooting

### Las variables no se aplican

**Solución:** Redeploy la aplicación
```bash
vercel --prod
```

### Error: "ADMIN_PASSWORD is not defined"

**Causa:** La variable no está configurada o el deployment es anterior a su configuración.

**Solución:**
1. Verifica que la variable existe en Settings > Environment Variables
2. Redeploy la aplicación

### Los enlaces generados tienen URL incorrecta

**Causa:** `BASE_URL` no está configurada o tiene un valor incorrecto.

**Solución:**
1. Verifica el valor de `BASE_URL` en Vercel
2. Debe ser tu URL completa: `https://tu-app.vercel.app`
3. No debe terminar en `/`
4. Redeploy después de corregir

### Database errors en Vercel

**Causa:** `DATABASE_PATH` apunta a un directorio no escribible.

**Solución:**
1. Asegúrate de usar `/tmp/invitations.db` en Vercel
2. Recuerda que los datos en `/tmp` son temporales

---

## Mejores Prácticas

### Seguridad

1. **Nunca hardcodees valores sensibles en el código**
   ```javascript
   // ❌ MAL
   const password = 'admin123';
   
   // ✅ BIEN
   const password = process.env.ADMIN_PASSWORD;
   ```

2. **Usa valores diferentes por entorno**
   - Password de desarrollo ≠ Password de producción
   - URLs diferentes para cada entorno

3. **Marca variables sensibles como "Sensitive"**
   - Oculta passwords en el dashboard
   - Previene exposición accidental

### Organización

1. **Documenta todas las variables**
   - Mantén `.env.example` actualizado
   - Incluye descripciones y valores de ejemplo

2. **Usa nombres descriptivos**
   - `ADMIN_PASSWORD` es mejor que `PWD`
   - `DATABASE_PATH` es mejor que `DB`

3. **Agrupa por categoría**
   - Variables de base de datos juntas
   - Variables de autenticación juntas
   - Variables de configuración juntas

---

## Checklist de Configuración

Antes de desplegar a producción, verifica:

- [ ] `NODE_ENV` está configurado como `production`
- [ ] `DATABASE_PATH` apunta a `/tmp/invitations.db`
- [ ] `ADMIN_PASSWORD` es un password seguro y único
- [ ] `BASE_URL` es tu URL real de Vercel
- [ ] Todas las variables están marcadas para "Production"
- [ ] Variables sensibles están marcadas como "Sensitive"
- [ ] Has hecho redeploy después de configurar las variables
- [ ] Has verificado que la aplicación funciona correctamente
- [ ] El archivo `.env` local NO está en Git

---

## Recursos Adicionales

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Best Practices for Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables#best-practices)
- [Vercel CLI Reference](https://vercel.com/docs/cli/env)
