# Documento de Diseño

## Visión General

Sistema web full-stack para gestión de invitaciones de graduación que permite importar invitados desde Excel, generar enlaces personalizados, capturar confirmaciones con acompañantes, y exportar resultados. La aplicación consta de una interfaz web pública para invitados y un panel administrativo para el organizador.

## Arquitectura

### Stack Tecnológico

**Frontend:**
- HTML5, CSS3, JavaScript vanilla (sin frameworks para simplicidad)
- Diseño responsive con CSS Grid/Flexbox
- Fetch API para comunicación con backend

**Backend:**
- Node.js con Express.js
- SQLite como base de datos (simple, sin servidor adicional)
- Librerías: xlsx (lectura/escritura Excel), uuid (IDs únicos)

**Despliegue:**
- Vercel o Netlify para hosting (gratuito, simple)
- Base de datos SQLite incluida en el proyecto

### Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente Web                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Página Invitado │      │  Panel Admin     │        │
│  │  (Pública)       │      │  (Protegida)     │        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
                        │
                        │ HTTP/REST
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Servidor Express                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              API Routes                           │  │
│  │  /api/guest/:id    - Obtener invitado           │  │
│  │  /api/confirm      - Guardar confirmación       │  │
│  │  /api/admin/import - Importar Excel             │  │
│  │  /api/admin/export - Exportar Excel             │  │
│  │  /api/admin/guests - Listar invitados           │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Capa de Servicios                      │  │
│  │  - GuestService    (lógica invitados)           │  │
│  │  - ConfirmService  (lógica confirmaciones)      │  │
│  │  - ExcelService    (import/export)              │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Base de Datos SQLite                │  │
│  │  Tablas: guests, confirmations, companions       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Componentes e Interfaces

### 1. Página de Invitado (Frontend Público)

**Ruta:** `/invite/:guestId`

**Elementos UI:**
- Header con título "Graduación de Eduardo - Ingeniería en Sistemas"
- Sección de bienvenida personalizada: "Hola, [Nombre]!"
- Información del evento (fecha, hora, lugar)
- Indicador de pases disponibles: "Pases disponibles: X"
- Botón de confirmación: `confirmar_asistencia();`
- Formulario de acompañantes (aparece al confirmar)
- Contador de acompañantes: "X/Y acompañantes agregados"
- Lista de acompañantes agregados (recuadros visuales)
- Botón de envío: `execute(RSVP);` (deshabilitado si excede límite)

**Flujo de Interacción:**
1. Usuario abre enlace con ID único
2. Sistema carga datos del invitado (incluyendo límite de acompañantes)
3. Muestra nombre personalizado y pases disponibles
4. Usuario hace clic en confirmar
5. Aparece campo para agregar acompañantes con contador (ej: "0/2 acompañantes")
6. Usuario escribe nombre y presiona Enter/botón
7. Nombre aparece en recuadro debajo, contador actualiza (ej: "1/2 acompañantes")
8. Si alcanza el límite, el campo se deshabilita
9. Usuario puede agregar más (si hay espacio) o enviar
10. Sistema valida que no exceda el límite antes de guardar
11. Sistema guarda en BD y muestra confirmación

### 2. Panel Administrativo (Frontend Protegido)

**Ruta:** `/admin`

**Secciones:**

**A. Importar Invitados**
- Área de drag-and-drop para archivo Excel
- Botón "Cargar Excel"
- Vista previa de datos importados
- Botón "Confirmar Importación"

**B. Lista de Invitados**
- Tabla con columnas: Nombre, Teléfono, Enlace, Estado
- Botón "Copiar" junto a cada enlace
- Botón "Copiar Todos" para generar lista completa
- Indicador visual de quién ha confirmado

**C. Exportar Confirmaciones**
- Botón "Descargar Excel de Confirmaciones"
- Resumen: X confirmados de Y invitados
- Contador de acompañantes totales

### 3. API Backend

#### Endpoints

**GET /api/guest/:id**
```javascript
// Respuesta
{
  "id": "uuid-string",
  "name": "Juan Pérez",
  "phone": "+52123456789",
  "maxCompanions": 1,
  "hasConfirmed": false
}
```

**POST /api/confirm**
```javascript
// Request
{
  "guestId": "uuid-string",
  "confirmed": true,
  "companions": ["María García", "Pedro López"]
}

// Respuesta
{
  "success": true,
  "message": "Confirmación guardada"
}
```

**POST /api/admin/import**
```javascript
// Request: multipart/form-data con archivo Excel

// Respuesta
{
  "success": true,
  "imported": 45,
  "errors": []
}
```

**GET /api/admin/guests**
```javascript
// Respuesta
{
  "guests": [
    {
      "id": "uuid",
      "name": "Juan Pérez",
      "phone": "+52123456789",
      "link": "https://domain.com/invite/uuid",
      "confirmed": true,
      "companionCount": 2
    }
  ]
}
```

**GET /api/admin/export**
```javascript
// Respuesta: archivo Excel descargable
// Headers: Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

## Modelos de Datos

### Esquema de Base de Datos SQLite

**Tabla: guests**
```sql
CREATE TABLE guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  max_companions INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Tabla: confirmations**
```sql
CREATE TABLE confirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id TEXT NOT NULL,
  confirmed BOOLEAN NOT NULL,
  confirmed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);
```

**Tabla: companions**
```sql
CREATE TABLE companions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  confirmation_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (confirmation_id) REFERENCES confirmations(id)
);
```

### Formato Excel de Importación

**Columnas requeridas:**
- `nombre` (texto)
- `telefono` (texto, formato: +52XXXXXXXXXX o similar)
- `pases` (número, opcional, default: 1) - Número máximo de acompañantes permitidos

**Ejemplo:**
```
| nombre        | telefono      | pases |
|---------------|---------------|-------|
| Juan Pérez    | +52123456789  | 2     |
| María García  | +52987654321  | 1     |
| Familia López | +52555123456  | 4     |
```

**Nota:** Si `pases` es 1, el invitado puede asistir solo. Si es 2, puede traer 1 acompañante, etc.

### Formato Excel de Exportación

**Columnas:**
- `nombre` - Nombre del invitado principal
- `telefono` - Teléfono del invitado
- `confirmado` - Sí/No
- `acompañantes` - Nombres separados por coma
- `total_personas` - Número total (invitado + acompañantes)
- `fecha_confirmacion` - Timestamp

## 
Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Propiedades Universales

**Propiedad 1: Importación Excel preserva datos**
*Para cualquier* archivo Excel válido con columnas "nombre" y "teléfono", importar el archivo debe resultar en que cada fila se convierta en un registro de invitado en la base de datos, donde el nombre y teléfono del registro coincidan exactamente con los valores de la fila correspondiente.
**Valida: Requisitos 1.1, 1.2, 1.3**

**Propiedad 2: IDs de invitados son únicos**
*Para cualquier* conjunto de invitados importados, todos los identificadores generados deben ser distintos entre sí.
**Valida: Requisitos 1.3**

**Propiedad 3: Validación rechaza datos inválidos**
*Para cualquier* archivo Excel con filas que contengan campos vacíos o nulos en las columnas "nombre" o "teléfono", el sistema debe reportar errores específicos indicando las filas problemáticas y no crear registros para esas filas.
**Valida: Requisitos 1.2, 1.4**

**Propiedad 4: Conteo de importación es correcto**
*Para cualquier* archivo Excel procesado, el número de invitados reportados como importados debe ser igual al número de filas válidas en el archivo.
**Valida: Requisitos 1.5**

**Propiedad 5: Enlaces son únicos por invitado**
*Para cualquier* conjunto de invitados en la base de datos, los enlaces generados para cada uno deben ser únicos y diferentes entre sí.
**Valida: Requisitos 2.1**

**Propiedad 6: Enlace contiene identificador del invitado**
*Para cualquier* invitado, el enlace generado debe contener su identificador único como parte de la URL.
**Valida: Requisitos 2.1, 2.2**

**Propiedad 7: Codificación URL maneja caracteres especiales**
*Para cualquier* nombre de invitado que contenga caracteres especiales (espacios, acentos, símbolos), el enlace generado debe tener esos caracteres correctamente codificados según el estándar URL encoding.
**Valida: Requisitos 2.5**

**Propiedad 8: Round trip de invitado preserva datos**
*Para cualquier* invitado guardado en la base de datos, extraer su ID del enlace generado y recuperar sus datos debe retornar el mismo nombre y teléfono originales.
**Valida: Requisitos 3.1, 3.2**

**Propiedad 9: IDs inexistentes retornan error**
*Para cualquier* identificador que no exista en la base de datos, intentar recuperar el invitado debe resultar en un error indicando que el enlace es inválido.
**Valida: Requisitos 3.4**

**Propiedad 10: Acompañantes agregados aparecen en lista**
*Para cualquier* lista de nombres de acompañantes agregados por un invitado, todos los nombres deben aparecer en la interfaz de confirmación.
**Valida: Requisitos 4.3, 4.4**

**Propiedad 10b: Límite de acompañantes respetado**
*Para cualquier* invitado con un número máximo de pases asignado, el sistema debe prevenir agregar más acompañantes que el límite permitido (pases - 1, ya que el invitado principal cuenta como 1).
**Valida: Requisitos 4.3**

**Propiedad 11: Validación requiere invitado principal**
*Para cualquier* intento de enviar confirmación, el sistema debe validar que el invitado principal esté incluido en la confirmación.
**Valida: Requisitos 4.5**

**Propiedad 12: Confirmación incluye timestamp**
*Para cualquier* confirmación guardada en la base de datos, el registro debe incluir un timestamp que indique cuándo se realizó la confirmación.
**Valida: Requisitos 5.1**

**Propiedad 13: Round trip de confirmación preserva datos**
*Para cualquier* confirmación enviada con invitado principal, estado de confirmación y lista de acompañantes, guardar en la base de datos y luego recuperar el registro debe retornar exactamente los mismos datos.
**Valida: Requisitos 5.2**

**Propiedad 14: Confirmaciones duplicadas actualizan registro existente**
*Para cualquier* invitado que confirme asistencia dos veces, el sistema debe tener exactamente un registro de confirmación para ese invitado (el más reciente), no dos registros separados.
**Valida: Requisitos 5.5**

**Propiedad 15: Exportación incluye todas las confirmaciones**
*Para cualquier* conjunto de confirmaciones en la base de datos, el archivo Excel exportado debe contener exactamente el mismo número de registros que confirmaciones existen.
**Valida: Requisitos 6.1**

**Propiedad 16: Exportación incluye columnas requeridas**
*Para cualquier* archivo Excel exportado, debe contener las columnas: nombre invitado, teléfono, confirmación, acompañantes, y fecha de confirmación.
**Valida: Requisitos 6.2**

**Propiedad 17: Exportación incluye acompañantes**
*Para cualquier* confirmación que tenga acompañantes, el archivo Excel exportado debe incluir los nombres de todos los acompañantes asociados a esa confirmación.
**Valida: Requisitos 6.3**

## Manejo de Errores

### Estrategias por Componente

**Importación de Excel:**
- Validar formato de archivo (debe ser .xlsx o .xls)
- Verificar existencia de columnas requeridas
- Validar datos fila por fila
- Retornar lista de errores con números de fila específicos
- Transacción atómica: si hay errores críticos, no importar nada

**Generación de Enlaces:**
- Validar que el invitado exista en BD
- Manejar caracteres especiales en nombres
- Generar IDs únicos con retry si hay colisión (improbable con UUID)

**Confirmación de Asistencia:**
- Validar que el ID del invitado sea válido
- Validar formato de datos de confirmación
- Validar que el número de acompañantes no exceda el límite permitido
- Manejar errores de escritura en BD con retry
- Mostrar mensajes de error claros al usuario

**Exportación:**
- Manejar caso de BD vacía (exportar solo headers)
- Validar permisos de escritura de archivo
- Manejar errores de generación de Excel

### Códigos de Error HTTP

- `200 OK` - Operación exitosa
- `400 Bad Request` - Datos inválidos del cliente
- `404 Not Found` - Invitado no encontrado
- `500 Internal Server Error` - Error del servidor
- `503 Service Unavailable` - BD no disponible

## Estrategia de Testing

### Testing Dual: Unit Tests + Property-Based Tests

El proyecto utilizará dos enfoques complementarios de testing:

**Unit Tests** - Verifican ejemplos específicos y casos de integración:
- Casos de ejemplo concretos (ej: importar archivo con 3 invitados específicos)
- Casos edge específicos (ej: archivo Excel vacío, nombre con emoji)
- Integración entre componentes

**Property-Based Tests** - Verifican propiedades universales:
- Utilizaremos **fast-check** (librería de PBT para JavaScript/Node.js)
- Cada propiedad universal listada arriba será implementada como un test PBT
- Configuración: mínimo 100 iteraciones por propiedad
- Cada test PBT debe incluir comentario con formato: `// Feature: graduacion-eduardo-web, Property X: [texto de propiedad]`

### Estrategia por Capa

**Servicios (Lógica de Negocio):**
- Property tests para todas las propiedades universales
- Unit tests para casos edge específicos
- Mocks de BD para aislar lógica

**API Endpoints:**
- Unit tests de integración para flujos completos
- Validación de formatos de request/response
- Manejo de errores

**Frontend:**
- Unit tests para funciones de utilidad (parsing URL, validación)
- Tests de integración para flujos de usuario críticos
- Property tests para funciones puras (ej: codificación URL)

### Cobertura Mínima

- Servicios: 80% cobertura de líneas
- API: 70% cobertura
- Frontend: 60% cobertura (UI es más difícil de testear)

## Diseño de Interfaz

### Paleta de Colores

**Colores Principales:**
- Azul Marino: `#1a237e` (primary)
- Plata: `#c0c0c0` (secondary)
- Gris Oscuro: `#212121` (background dark mode)
- Blanco: `#ffffff` (text on dark)
- Azul Claro: `#3f51b5` (accents)

**Modo Oscuro por Defecto:**
- Background: `#212121`
- Cards/Containers: `#2c2c2c`
- Text: `#e0e0e0`
- Accents: Azul claro y plata

### Tipografía

**Fuentes:**
- Títulos: `'Fira Code', 'Courier New', monospace` (tech feel)
- Texto normal: `'Roboto', 'Arial', sans-serif` (legibilidad)
- Código/Botones: `'Fira Code', monospace`

**Tamaños:**
- H1: 2.5rem
- H2: 2rem
- Body: 1rem
- Code: 0.95rem

### Elementos Tecnológicos

**Botones con Estilo Código:**
```
┌─────────────────────────────┐
│  confirmar_asistencia();    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  execute(RSVP);             │
└─────────────────────────────┘
```

**Recuadros de Acompañantes:**
```
┌──────────────────────┐
│  > María García      │
│  > Pedro López       │
│  > Ana Martínez      │
└──────────────────────┘
```

**Elementos Visuales:**
- Bordes con estilo terminal: líneas finas en plata
- Iconos: símbolos de código (>, //, {}, etc.)
- Animaciones sutiles: fade-in, slide-in
- Cursor parpadeante en inputs (estilo terminal)

### Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptaciones Mobile:**
- Stack vertical de elementos
- Botones full-width
- Texto más grande para legibilidad
- Espaciado aumentado para touch targets

## Consideraciones de Despliegue

### Hosting Recomendado: Vercel

**Ventajas:**
- Despliegue gratuito
- HTTPS automático
- CI/CD integrado con Git
- Soporte nativo para Node.js
- Fácil configuración

### Variables de Entorno

```
NODE_ENV=production
DATABASE_PATH=./data/invitations.db
ADMIN_PASSWORD=<password-seguro>
BASE_URL=https://graduacion-eduardo.vercel.app
```

### Estructura de Archivos para Despliegue

```
/
├── api/              # Serverless functions (Vercel)
│   ├── guest.js
│   ├── confirm.js
│   └── admin/
├── public/           # Static files
│   ├── index.html
│   ├── admin.html
│   ├── styles.css
│   └── script.js
├── data/             # SQLite database
│   └── invitations.db
├── package.json
└── vercel.json       # Vercel config
```

### Seguridad

**Panel Admin:**
- Autenticación básica con password
- Variable de entorno para password
- Rate limiting en endpoints admin

**Base de Datos:**
- Validación de inputs para prevenir SQL injection
- Uso de prepared statements
- Backup automático diario

**CORS:**
- Configurar origins permitidos
- Solo permitir métodos necesarios

## Documentación de Usuario

### README para Organizador

El proyecto incluirá un README.md con:

1. **Cómo importar invitados:**
   - Formato del Excel requerido
   - Ejemplo de archivo
   - Pasos para importar

2. **Cómo generar y enviar enlaces:**
   - Acceder al panel admin
   - Copiar enlaces individuales
   - Plantilla de mensaje para WhatsApp

3. **Cómo ver confirmaciones:**
   - Acceder a lista de confirmados
   - Exportar a Excel
   - Interpretar los datos

4. **Ejemplo de mensaje WhatsApp:**
```
¡Hola [Nombre]! 🎓

Te invito a mi graduación de Ingeniería en Sistemas.

Por favor confirma tu asistencia aquí:
[ENLACE]

¡Nos vemos pronto!
Eduardo
```

### Guía de Enlaces

**Formato de URL:**
```
https://graduacion-eduardo.vercel.app/invite/[ID-UNICO]
```

**Ejemplo:**
```
https://graduacion-eduardo.vercel.app/invite/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Notas:**
- Cada enlace es único y no reutilizable
- El sistema extrae automáticamente el nombre del invitado
- No es necesario agregar parámetros adicionales
