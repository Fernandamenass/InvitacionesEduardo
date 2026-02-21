# Sistema de Invitaciones - Graduación de Eduardo

Sistema web para gestionar invitaciones de graduación con confirmación de asistencia y gestión de acompañantes.

## 🎓 Características

- Importación de invitados desde Excel
- Generación de enlaces personalizados únicos
- Confirmación de asistencia con acompañantes (+1)
- Panel administrativo para gestión
- Exportación de confirmaciones a Excel
- Interfaz con temática tecnológica elegante

## 📋 Requisitos Previos

- Node.js 14 o superior
- npm o yarn

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar el servidor
npm start
```

## 📊 Formato del Archivo Excel de Invitados

El archivo Excel debe contener las siguientes columnas:

| Columna   | Tipo   | Requerido | Descripción                                    |
|-----------|--------|-----------|------------------------------------------------|
| nombre    | Texto  | Sí        | Nombre completo del invitado                   |
| telefono  | Texto  | Sí        | Número de teléfono (ej: +52123456789)         |
| pases     | Número | No        | Número máximo de pases (default: 1)           |

### Ejemplo de Formato

```
| nombre        | telefono      | pases |
|---------------|---------------|-------|
| Juan Pérez    | +52123456789  | 2     |
| María García  | +52987654321  | 1     |
| Familia López | +52555123456  | 4     |
```

**📁 Archivo de Ejemplo**: Puedes encontrar un archivo Excel de ejemplo en `data/ejemplo-invitados.xlsx` con 5 invitados ficticios y diferentes valores de pases.

### Notas Importantes sobre Pases

- **pases = 1**: El invitado puede asistir solo (sin acompañantes)
- **pases = 2**: El invitado puede traer 1 acompañante
- **pases = 3**: El invitado puede traer 2 acompañantes
- Y así sucesivamente...

**Importante**: El invitado principal siempre cuenta como 1 pase. Los acompañantes adicionales son: `pases - 1`

## 📥 Guía de Importación de Invitados

### Paso 1: Preparar el Archivo Excel

1. Crea un archivo Excel (.xlsx o .xls)
2. Asegúrate de que tenga las columnas: `nombre`, `telefono`, y opcionalmente `pases`
3. Llena los datos de tus invitados
4. Guarda el archivo

### Paso 2: Acceder al Panel Administrativo

1. Abre tu navegador y ve a: `https://tu-dominio.com/admin.html`
2. Ingresa la contraseña administrativa cuando se solicite

### Paso 3: Importar el Archivo

1. En la sección "Importar Invitados", haz clic en "Seleccionar archivo Excel"
2. Selecciona tu archivo Excel preparado
3. Haz clic en "Importar Invitados"
4. El sistema mostrará:
   - ✅ Número de invitados importados exitosamente
   - ❌ Lista de errores si hay filas con datos inválidos

### Solución de Problemas en la Importación

**Error: "Falta columna requerida"**
- Verifica que tu Excel tenga las columnas `nombre` y `telefono`

**Error: "Fila X tiene datos faltantes"**
- Revisa la fila indicada y asegúrate de que tenga nombre y teléfono

**Error: "Formato de archivo inválido"**
- Asegúrate de usar un archivo .xlsx o .xls

## 🔗 Guía de Generación y Envío de Enlaces

### Paso 1: Generar Enlaces

Después de importar invitados:

1. Ve a la sección "Lista de Invitados" en el panel admin
2. Verás una tabla con todos los invitados y sus enlaces únicos
3. Cada enlace tiene el formato: `https://tu-dominio.com/invite/[ID-ÚNICO]`

### Paso 2: Copiar Enlaces

**Opción A: Copiar Individual**
1. Haz clic en el botón "Copiar" junto al enlace del invitado
2. El enlace se copiará al portapapeles
3. Pégalo en WhatsApp o tu aplicación de mensajería

**Opción B: Copiar Todos**
1. Haz clic en el botón "Copiar Todos los Enlaces"
2. Se copiará una lista formateada con todos los invitados y sus enlaces
3. Útil para tener un respaldo o enviar en lote

### Paso 3: Enviar por WhatsApp

Usa esta plantilla de mensaje:

```
¡Hola [Nombre]! 🎓

Te invito a mi graduación de Ingeniería en Sistemas.

📅 Fecha: [Fecha del evento]
🕐 Hora: [Hora del evento]
📍 Lugar: [Lugar del evento]

Por favor confirma tu asistencia aquí:
[ENLACE-PERSONALIZADO]

¡Nos vemos pronto!
Eduardo
```

### Ejemplo de Mensaje Completo

```
¡Hola Juan! 🎓

Te invito a mi graduación de Ingeniería en Sistemas.

📅 Fecha: 15 de Junio, 2024
🕐 Hora: 18:00 hrs
📍 Lugar: Auditorio Principal, Universidad XYZ

Por favor confirma tu asistencia aquí:
https://graduacion-eduardo.vercel.app/invite/a1b2c3d4-e5f6-7890-abcd-ef1234567890

¡Nos vemos pronto!
Eduardo
```

### Consejos para el Envío

- ✅ Personaliza cada mensaje con el nombre del invitado
- ✅ Envía los mensajes con anticipación (2-3 semanas antes)
- ✅ Haz seguimiento a quienes no confirmen
- ✅ Guarda los enlaces en un lugar seguro por si necesitas reenviarlos

## 📤 Guía de Exportación de Confirmaciones

### Exportar Datos

1. Accede al panel administrativo
2. Ve a la sección "Exportar Confirmaciones"
3. Haz clic en "Descargar Excel de Confirmaciones"
4. El archivo se descargará automáticamente

### Contenido del Archivo Exportado

El archivo Excel incluirá las siguientes columnas:

| Columna            | Descripción                                    |
|--------------------|------------------------------------------------|
| nombre             | Nombre del invitado principal                  |
| telefono           | Teléfono del invitado                          |
| confirmado         | "Sí" o "No"                                    |
| acompañantes       | Nombres de acompañantes (separados por coma)   |
| total_personas     | Número total (invitado + acompañantes)         |
| fecha_confirmacion | Fecha y hora de la confirmación                |

### Ejemplo de Datos Exportados

```
| nombre      | telefono     | confirmado | acompañantes           | total_personas | fecha_confirmacion      |
|-------------|--------------|------------|------------------------|----------------|-------------------------|
| Juan Pérez  | +5212345678  | Sí         | María García           | 2              | 2024-05-20 14:30:00    |
| Ana López   | +5298765432  | Sí         | Pedro López, Luis Ruiz | 3              | 2024-05-21 09:15:00    |
| Carlos Díaz | +5255512345  | No         |                        | 0              |                         |
```

### Usar los Datos Exportados

- **Planificación de asientos**: Usa la columna `total_personas` para saber cuántos asientos necesitas
- **Lista de asistentes**: Filtra por `confirmado = "Sí"` para tu lista final
- **Seguimiento**: Identifica quiénes no han confirmado para hacer seguimiento
- **Catering**: Suma `total_personas` para saber cuánta comida/bebida necesitas

## 🎨 Experiencia del Invitado

Cuando un invitado abre su enlace personalizado:

1. Ve una página con su nombre: "¡Hola, [Nombre]!"
2. Ve información del evento de graduación
3. Ve cuántos pases tiene disponibles
4. Puede confirmar su asistencia haciendo clic en `confirmar_asistencia();`
5. Si tiene pases adicionales, puede agregar acompañantes
6. El sistema muestra un contador: "X/Y acompañantes agregados"
7. Al enviar, recibe confirmación de que su respuesta fue guardada

## 🔒 Seguridad

- El panel administrativo está protegido con contraseña
- Los enlaces de invitados son únicos y no adivinables (UUID)
- La base de datos usa prepared statements para prevenir SQL injection
- Las variables sensibles se manejan mediante variables de entorno

## 🛠️ Variables de Entorno

Crea un archivo `.env` con:

```
NODE_ENV=production
DATABASE_PATH=./data/invitations.db
ADMIN_PASSWORD=tu-password-seguro
BASE_URL=https://tu-dominio.com
```

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (responsive design)
- ✅ Tablets y escritorio

## 🐛 Solución de Problemas Comunes

### "No puedo acceder al panel admin"
- Verifica que estés usando la contraseña correcta
- Limpia el caché del navegador
- Verifica que la variable `ADMIN_PASSWORD` esté configurada

### "El enlace del invitado no funciona"
- Verifica que el enlace esté completo (no cortado)
- Asegúrate de que el invitado fue importado correctamente
- Revisa que el servidor esté funcionando

### "No puedo importar el Excel"
- Verifica el formato del archivo (.xlsx o .xls)
- Asegúrate de que tenga las columnas requeridas
- Revisa que no haya filas completamente vacías

### "Las confirmaciones no se guardan"
- Verifica que la base de datos tenga permisos de escritura
- Revisa los logs del servidor para errores
- Asegúrate de que el invitado no exceda el límite de acompañantes

## 📞 Soporte

Para problemas técnicos o preguntas, contacta al administrador del sistema.

## 📄 Licencia

Este proyecto fue creado para la graduación de Eduardo en Ingeniería en Sistemas.

---

**¡Felicidades Eduardo por tu graduación! 🎓🎉**
