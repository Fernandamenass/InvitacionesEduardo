# Plan de Implementación

- [x] 1. Configurar estructura del proyecto y dependencias





  - Crear estructura de carpetas (api/, public/, data/)
  - Inicializar package.json con dependencias: express, sqlite3, xlsx, uuid, cors
  - Configurar vercel.json para despliegue
  - Crear archivo .env.example con variables requeridas
  - _Requisitos: Todos_

- [x] 2. Implementar base de datos SQLite




  - [x] 2.1 Crear esquema de base de datos


    - Escribir script de inicialización con tablas: guests, confirmations, companions
    - Implementar función de conexión a BD
    - _Requisitos: 1.3, 5.1, 5.2_
  
  - [x] 2.2 Escribir test de propiedad para IDs únicos


    - **Propiedad 2: IDs de invitados son únicos**
    - **Valida: Requisitos 1.3**
  
  - [x] 2.3 Escribir tests unitarios para inicialización de BD


    - Test de creación de tablas
    - Test de conexión exitosa
    - _Requisitos: 1.3_

- [x] 3. Implementar servicio de importación Excel





  - [x] 3.1 Crear ExcelService con función de lectura


    - Implementar parseExcelFile() que lee columnas nombre, telefono, pases
    - Validar formato de archivo
    - _Requisitos: 1.1, 1.2_
  
  - [x] 3.2 Implementar validación de datos

    - Validar campos requeridos (nombre, telefono)
    - Detectar filas con datos faltantes
    - Generar reportes de errores con números de fila
    - _Requisitos: 1.2, 1.4_
  
  - [x] 3.3 Escribir test de propiedad para importación


    - **Propiedad 1: Importación Excel preserva datos**
    - **Valida: Requisitos 1.1, 1.2, 1.3**
  
  - [x] 3.4 Escribir test de propiedad para validación


    - **Propiedad 3: Validación rechaza datos inválidos**
    - **Valida: Requisitos 1.2, 1.4**
  
  - [x] 3.5 Escribir test de propiedad para conteo


    - **Propiedad 4: Conteo de importación es correcto**
    - **Valida: Requisitos 1.5**

- [x] 4. Implementar servicio de gestión de invitados




  - [x] 4.1 Crear GuestService con operaciones CRUD


    - Implementar createGuest() con generación de UUID
    - Implementar getGuestById()
    - Implementar getAllGuests()
    - _Requisitos: 1.3, 2.1, 3.1, 3.2_
  
  - [x] 4.2 Implementar generación de enlaces


    - Crear generateInviteLink() que construye URL con ID
    - Implementar codificación URL para caracteres especiales
    - _Requisitos: 2.1, 2.2, 2.5_
  
  - [x] 4.3 Escribir test de propiedad para enlaces únicos


    - **Propiedad 5: Enlaces son únicos por invitado**
    - **Valida: Requisitos 2.1**
  
  - [x] 4.4 Escribir test de propiedad para codificación URL


    - **Propiedad 7: Codificación URL maneja caracteres especiales**
    - **Valida: Requisitos 2.5**
  
  - [x] 4.5 Escribir test de propiedad para round trip


    - **Propiedad 8: Round trip de invitado preserva datos**
    - **Valida: Requisitos 3.1, 3.2**
  
  - [x] 4.6 Escribir test de propiedad para IDs inexistentes


    - **Propiedad 9: IDs inexistentes retornan error**
    - **Valida: Requisitos 3.4**

- [x] 5. Implementar servicio de confirmaciones





  - [x] 5.1 Crear ConfirmService con lógica de confirmación


    - Implementar saveConfirmation() que guarda invitado + acompañantes
    - Validar límite de acompañantes según max_companions
    - Implementar lógica de actualización para confirmaciones duplicadas
    - _Requisitos: 4.5, 5.1, 5.2, 5.5_
  
  - [x] 5.2 Escribir test de propiedad para límite de acompañantes


    - **Propiedad 10b: Límite de acompañantes respetado**
    - **Valida: Requisitos 4.3**
  
  - [x] 5.3 Escribir test de propiedad para timestamp


    - **Propiedad 12: Confirmación incluye timestamp**
    - **Valida: Requisitos 5.1**
  


  - [x] 5.4 Escribir test de propiedad para round trip de confirmación

    - **Propiedad 13: Round trip de confirmación preserva datos**
    - **Valida: Requisitos 5.2**
  
  - [x] 5.5 Escribir test de propiedad para idempotencia


    - **Propiedad 14: Confirmaciones duplicadas actualizan registro existente**
    - **Valida: Requisitos 5.5**

- [x] 6. Implementar servicio de exportación Excel




  - [x] 6.1 Crear función de exportación en ExcelService


    - Implementar exportConfirmations() que genera archivo Excel
    - Incluir columnas: nombre, telefono, confirmado, acompañantes, fecha
    - Manejar caso de BD vacía (solo headers)
    - _Requisitos: 6.1, 6.2, 6.3, 6.5_
  
  - [x] 6.2 Escribir test de propiedad para exportación completa


    - **Propiedad 15: Exportación incluye todas las confirmaciones**
    - **Valida: Requisitos 6.1**
  
  - [x] 6.3 Escribir test de propiedad para columnas requeridas


    - **Propiedad 16: Exportación incluye columnas requeridas**
    - **Valida: Requisitos 6.2**
  
  - [x] 6.4 Escribir test de propiedad para acompañantes en export


    - **Propiedad 17: Exportación incluye acompañantes**
    - **Valida: Requisitos 6.3**

- [x] 7. Implementar API endpoints





  - [x] 7.1 Crear endpoint GET /api/guest/:id


    - Extraer ID de parámetros
    - Llamar a GuestService.getGuestById()
    - Retornar datos del invitado o error 404
    - _Requisitos: 3.1, 3.2, 3.4_
  
  - [x] 7.2 Crear endpoint POST /api/confirm


    - Validar body de request
    - Llamar a ConfirmService.saveConfirmation()
    - Retornar éxito o error
    - _Requisitos: 4.5, 5.1, 5.2_
  
  - [x] 7.3 Crear endpoint POST /api/admin/import


    - Recibir archivo Excel multipart
    - Llamar a ExcelService.parseExcelFile()
    - Llamar a GuestService.createGuest() para cada fila válida
    - Retornar resumen de importación
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 7.4 Crear endpoint GET /api/admin/guests


    - Llamar a GuestService.getAllGuests()
    - Para cada invitado, generar enlace
    - Retornar lista completa
    - _Requisitos: 2.1, 2.2_
  
  - [x] 7.5 Crear endpoint GET /api/admin/export


    - Llamar a ExcelService.exportConfirmations()
    - Configurar headers para descarga de archivo
    - Retornar archivo Excel
    - _Requisitos: 6.1, 6.2, 6.3_
  
  - [x] 7.6 Escribir tests de integración para endpoints


    - Test de flujo completo: importar → generar enlaces → confirmar → exportar
    - Test de manejo de errores
    - _Requisitos: Todos_

- [x] 8. Checkpoint - Verificar que backend funciona





  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas

- [-] 9. Implementar página de invitado (frontend público)


  - [x] 9.1 Crear HTML estructura de página de invitado


    - Crear public/index.html con estructura semántica
    - Incluir secciones: header, bienvenida, info evento, formulario
    - _Requisitos: 3.3, 3.5, 4.1_
  
  - [x] 9.2 Implementar estilos CSS con tema tecnológico


    - Aplicar paleta de colores (azul marino, plata, dark mode)
    - Configurar tipografías monospace para elementos tech
    - Implementar diseño responsive
    - _Requisitos: 7.1, 7.2, 7.5_
  
  - [x] 9.3 Implementar lógica JavaScript de invitado


    - Extraer ID de URL
    - Fetch datos del invitado desde API
    - Mostrar nombre personalizado
    - Implementar formulario de confirmación
    - Implementar agregar acompañantes con validación de límite
    - Mostrar contador "X/Y acompañantes"
    - Deshabilitar input al alcanzar límite
    - Enviar confirmación a API
    - _Requisitos: 3.1, 3.2, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 9.4 Escribir tests unitarios para funciones de utilidad







    - Test de extracción de ID de URL
    - Test de validación de formulario
    - _Requisitos: 3.1_

- [x] 10. Implementar panel administrativo (frontend protegido)






  - [x] 10.1 Crear HTML estructura de panel admin

    - Crear public/admin.html con secciones: importar, lista, exportar
    - Incluir área de drag-and-drop para Excel
    - Incluir tabla para lista de invitados
    - _Requisitos: 1.1, 2.3, 6.4_
  


  - [x] 10.2 Implementar autenticación básica
    - Crear prompt de password
    - Validar contra variable de entorno
    - Guardar sesión en localStorage
    - _Requisitos: Seguridad_

  
  - [x] 10.3 Implementar lógica JavaScript de admin

    - Implementar upload de Excel y llamada a /api/admin/import
    - Mostrar vista previa de datos importados
    - Fetch lista de invitados desde /api/admin/guests
    - Renderizar tabla con enlaces copiables
    - Implementar botón de exportar que descarga Excel
    - _Requisitos: 1.1, 1.5, 2.1, 2.3, 6.1, 6.4_
  

  - [x] 10.4 Implementar funcionalidad de copiar enlaces

    - Botón "Copiar" individual usando Clipboard API
    - Botón "Copiar Todos" que genera lista formateada
    - _Requisitos: 2.4_

- [x] 11. Implementar elementos visuales tecnológicos




  - [x] 11.1 Estilizar botones con texto estilo código


    - Botón "confirmar_asistencia();"
    - Botón "execute(RSVP);"
    - _Requisitos: 7.3_
  
  - [x] 11.2 Estilizar recuadros de acompañantes


    - Diseño tipo terminal con prefijo ">"
    - Animaciones sutiles de entrada
    - _Requisitos: 4.3, 4.4_
  

  - [x] 11.3 Agregar detalles visuales tech

    - Bordes estilo terminal
    - Cursor parpadeante en inputs
    - Iconos de código
    - _Requisitos: 7.4_

- [x] 12. Configurar despliegue en Vercel




  - [x] 12.1 Crear configuración de Vercel


    - Crear vercel.json con rutas y rewrites
    - Configurar serverless functions
    - _Requisitos: 6.1_
  
  - [x] 12.2 Configurar variables de entorno


    - Agregar ADMIN_PASSWORD en Vercel dashboard
    - Configurar BASE_URL
    - _Requisitos: Seguridad_
  
  - [x] 12.3 Realizar despliegue inicial


    - Conectar repositorio Git con Vercel
    - Verificar que el despliegue sea exitoso
    - Probar funcionalidad en producción
    - _Requisitos: 6.1, 6.2, 6.3_

- [x] 13. Crear documentación de usuario
















  - [x] 13.1 Escribir README.md

    - Instrucciones de formato de Excel
    - Guía de importación de invitados
    - Guía de generación y envío de enlaces
    - Guía de exportación de confirmaciones
    - Plantilla de mensaje para WhatsApp
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_
  

  - [x] 13.2 Crear archivo Excel de ejemplo

    - Crear ejemplo con 3-5 invitados ficticios
    - Incluir diferentes valores de pases
    - _Requisitos: 5.2_

- [x] 14. Checkpoint final - Verificar sistema completo





  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas
