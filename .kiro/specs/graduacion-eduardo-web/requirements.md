# Documento de Requisitos

## Introducción

Sistema web de invitación interactiva para la graduación de Eduardo en Ingeniería en Sistemas. El sistema importa invitados desde Excel, genera invitaciones personalizadas con enlaces únicos, permite confirmación de asistencia con acompañantes (+1), almacena respuestas en base de datos, y exporta resultados a Excel.

## Glosario

- **Sistema de Invitación**: La aplicación web completa que gestiona el ciclo de invitaciones
- **Excel de Invitados**: Archivo Excel con columnas de nombre y teléfono de invitados
- **Invitado Principal**: Persona que recibe el enlace de invitación original
- **Acompañante (+1)**: Persona adicional que el invitado principal puede agregar a su confirmación
- **Base de Datos**: Sistema de almacenamiento persistente para confirmaciones
- **Dump Excel**: Exportación de datos de la base de datos a formato Excel
- **Enlace Personalizado**: URL única que contiene identificador del invitado
- **Confirmación**: Registro de asistencia del invitado con sus acompañantes

## Requisitos

### Requisito 1

**Historia de Usuario:** Como organizador del evento, quiero importar la lista de invitados desde un archivo Excel, para que el sistema conozca a quién debo enviar invitaciones.

#### Criterios de Aceptación

1. WHEN el organizador carga un archivo Excel, THEN el Sistema de Invitación SHALL leer las columnas "nombre" y "teléfono" de cada fila
2. WHEN el archivo Excel es procesado, THEN el Sistema de Invitación SHALL validar que ambas columnas contengan datos válidos
3. WHEN los datos son válidos, THEN el Sistema de Invitación SHALL almacenar cada invitado en la base de datos con un identificador único
4. WHEN el archivo contiene filas con datos faltantes, THEN el Sistema de Invitación SHALL reportar errores específicos indicando qué filas tienen problemas
5. WHEN la importación es exitosa, THEN el Sistema de Invitación SHALL mostrar el número total de invitados importados

### Requisito 2

**Historia de Usuario:** Como organizador del evento, quiero generar enlaces personalizados para cada invitado, para que pueda enviarles invitaciones únicas por WhatsApp.

#### Criterios de Aceptación

1. WHEN el organizador solicita generar enlaces, THEN el Sistema de Invitación SHALL crear una URL única para cada invitado usando su identificador
2. WHEN un enlace es generado, THEN el Sistema de Invitación SHALL incluir el nombre del invitado en el parámetro de URL
3. WHEN los enlaces son generados, THEN el Sistema de Invitación SHALL mostrar una lista con nombre, teléfono y enlace de cada invitado
4. WHEN el organizador visualiza los enlaces, THEN el Sistema de Invitación SHALL permitir copiar cada enlace individualmente
5. WHEN el nombre contiene caracteres especiales, THEN el Sistema de Invitación SHALL codificar correctamente la URL

### Requisito 3

**Historia de Usuario:** Como invitado, quiero ver una invitación personalizada con mi nombre, para que la experiencia sea personal y especial.

#### Criterios de Aceptación

1. WHEN el invitado abre su enlace único, THEN el Sistema de Invitación SHALL extraer el identificador de la URL
2. WHEN el identificador es válido, THEN el Sistema de Invitación SHALL recuperar el nombre del invitado desde la base de datos
3. WHEN el nombre es recuperado, THEN el Sistema de Invitación SHALL mostrar el nombre del invitado de manera prominente en la interfaz
4. WHEN el identificador no existe, THEN el Sistema de Invitación SHALL mostrar un mensaje de error indicando que el enlace es inválido
5. WHEN la página carga, THEN el Sistema de Invitación SHALL mostrar información del evento de graduación de Eduardo

### Requisito 4

**Historia de Usuario:** Como invitado, quiero confirmar mi asistencia y agregar acompañantes (+1), para que el organizador sepa cuántas personas de mi parte asistirán.

#### Criterios de Aceptación

1. WHEN el invitado visualiza el formulario, THEN el Sistema de Invitación SHALL mostrar un botón para confirmar asistencia
2. WHEN el invitado confirma asistencia, THEN el Sistema de Invitación SHALL mostrar un campo para agregar nombres de acompañantes
3. WHEN el invitado agrega un acompañante, THEN el Sistema de Invitación SHALL mostrar el nombre en un recuadro visible debajo del campo de entrada
4. WHEN el invitado agrega múltiples acompañantes, THEN el Sistema de Invitación SHALL mostrar cada nombre en recuadros separados
5. WHEN el invitado envía la confirmación, THEN el Sistema de Invitación SHALL validar que al menos el invitado principal esté confirmado

### Requisito 5

**Historia de Usuario:** Como organizador del evento, quiero que las confirmaciones se guarden en una base de datos, para que pueda consultar y exportar los datos cuando lo necesite.

#### Criterios de Aceptación

1. WHEN el invitado envía su confirmación, THEN el Sistema de Invitación SHALL guardar el registro en la base de datos con timestamp
2. WHEN se guarda una confirmación, THEN el Sistema de Invitación SHALL almacenar el nombre del invitado principal, estado de confirmación, y lista de acompañantes
3. WHEN la escritura en base de datos es exitosa, THEN el Sistema de Invitación SHALL mostrar mensaje de confirmación al invitado
4. WHEN la escritura falla, THEN el Sistema de Invitación SHALL mostrar error y permitir reintentar
5. WHEN un invitado ya confirmó previamente, THEN el Sistema de Invitación SHALL actualizar su registro existente en lugar de crear uno duplicado

### Requisito 6

**Historia de Usuario:** Como organizador del evento, quiero exportar las confirmaciones a Excel, para que pueda revisar la lista de asistentes en formato familiar.

#### Criterios de Aceptación

1. WHEN el organizador solicita exportar datos, THEN el Sistema de Invitación SHALL generar un archivo Excel con todas las confirmaciones
2. WHEN el archivo es generado, THEN el Sistema de Invitación SHALL incluir columnas para: nombre invitado, teléfono, confirmación, acompañantes, y fecha de confirmación
3. WHEN hay acompañantes, THEN el Sistema de Invitación SHALL listar sus nombres en una columna separada o en filas adicionales
4. WHEN el archivo está listo, THEN el Sistema de Invitación SHALL permitir descargar el archivo Excel
5. WHEN no hay confirmaciones, THEN el Sistema de Invitación SHALL generar un archivo Excel vacío con los encabezados

### Requisito 7

**Historia de Usuario:** Como invitado ingeniero o entusiasta de tecnología, quiero ver una interfaz con temática tecnológica elegante, para que la invitación refleje la naturaleza de la graduación en Ingeniería en Sistemas.

#### Criterios de Aceptación

1. WHEN la página carga, THEN el Sistema de Invitación SHALL aplicar una paleta de colores que incluya azul marino y plata
2. WHEN se muestran elementos de texto, THEN el Sistema de Invitación SHALL utilizar tipografías monospace para elementos con guiños tecnológicos
3. WHEN el invitado interactúa con el botón de confirmación, THEN el Sistema de Invitación SHALL mostrar texto estilo código como "confirmar_asistencia();" o "execute(RSVP);"
4. WHEN la interfaz se renderiza, THEN el Sistema de Invitación SHALL incluir elementos visuales que sugieran tecnología de manera elegante
5. WHEN la página se visualiza en diferentes dispositivos, THEN el Sistema de Invitación SHALL mantener la estética responsive y legible
