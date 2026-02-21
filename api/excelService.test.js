const fc = require('fast-check');
const XLSX = require('xlsx');
const { parseExcelFile, exportConfirmations } = require('./excelService');

describe('ExcelService', () => {
  describe('Property-Based Tests', () => {
    
    // Feature: graduacion-eduardo-web, Property 1: Importación Excel preserva datos
    // Validates: Requirements 1.1, 1.2, 1.3
    it('Property 1: Para cualquier archivo Excel válido con columnas nombre y telefono, importar el archivo debe resultar en que cada fila se convierta en un registro de invitado donde el nombre y teléfono coincidan exactamente', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              nombre: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              telefono: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              pases: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (guestData) => {
            // Create Excel workbook from data
            const worksheet = XLSX.utils.json_to_sheet(guestData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
            
            // Convert to buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            // Parse the Excel file
            const result = parseExcelFile(buffer);
            
            // Should have no errors
            expect(result.errors).toHaveLength(0);
            
            // Should have same number of guests as input data
            expect(result.guests).toHaveLength(guestData.length);
            
            // Each guest should match the input data
            result.guests.forEach((guest, index) => {
              const originalData = guestData[index];
              
              // Name and phone should match exactly (trimmed)
              expect(guest.name).toBe(originalData.nombre.trim());
              expect(guest.phone).toBe(originalData.telefono.trim());
              
              // maxCompanions should match pases or default to 1
              const expectedMaxCompanions = originalData.pases !== undefined && originalData.pases !== null 
                ? originalData.pases 
                : 1;
              expect(guest.maxCompanions).toBe(expectedMaxCompanions);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: graduacion-eduardo-web, Property 3: Validación rechaza datos inválidos
    // Validates: Requirements 1.2, 1.4
    it('Property 3: Para cualquier archivo Excel con filas que contengan campos vacíos o nulos en nombre o telefono, el sistema debe reportar errores específicos indicando las filas problemáticas', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              nombre: fc.option(fc.oneof(
                fc.constant(null),
                fc.constant(''),
                fc.constant('   '), // whitespace only
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
              )),
              telefono: fc.option(fc.oneof(
                fc.constant(null),
                fc.constant(''),
                fc.constant('   '), // whitespace only
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
              )),
              pases: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (guestData) => {
            // Create Excel workbook from data
            const worksheet = XLSX.utils.json_to_sheet(guestData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
            
            // Convert to buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            // Parse the Excel file
            const result = parseExcelFile(buffer);
            
            // Read back the data to see what XLSX actually stored
            // (XLSX may drop rows with all null values)
            const readWorkbook = XLSX.read(buffer, { type: 'buffer' });
            const readSheet = readWorkbook.Sheets[readWorkbook.SheetNames[0]];
            const actualData = XLSX.utils.sheet_to_json(readSheet, { defval: null });
            
            // Count rows with invalid data in the ACTUAL Excel file (after round-trip)
            let invalidRowCount = 0;
            actualData.forEach((row) => {
              const nombreInvalid = !row.nombre || row.nombre.toString().trim() === '';
              const telefonoInvalid = !row.telefono || row.telefono.toString().trim() === '';
              
              if (nombreInvalid || telefonoInvalid) {
                invalidRowCount++;
              }
            });
            
            // Number of valid guests should equal total rows minus invalid rows
            const expectedValidGuests = actualData.length - invalidRowCount;
            expect(result.guests).toHaveLength(expectedValidGuests);
            
            // If all rows are invalid, we get a single "no data" error
            // Otherwise, we should have errors for each invalid row
            if (actualData.length === 0 || invalidRowCount === actualData.length) {
              // All rows invalid or no data - expect at least one error
              expect(result.errors.length).toBeGreaterThanOrEqual(1);
            } else if (invalidRowCount > 0) {
              // Some valid rows - expect errors for each invalid row
              expect(result.errors.length).toBeGreaterThanOrEqual(invalidRowCount);
            } else {
              // All rows valid - expect no errors
              expect(result.errors.length).toBe(0);
            }
            
            // Each error should mention a row number OR be the "no data" message
            result.errors.forEach(error => {
              // Accept either row-specific errors or the "no data" message
              const isRowError = /Fila \d+/.test(error);
              const isNoDataError = error.includes('El archivo Excel no contiene datos');
              expect(isRowError || isNoDataError).toBe(true);
            });
            
            // All valid guests should be in the result
            const validGuests = result.guests;
            validGuests.forEach(guest => {
              expect(guest.name).toBeTruthy();
              expect(guest.name.trim()).not.toBe('');
              expect(guest.phone).toBeTruthy();
              expect(guest.phone.trim()).not.toBe('');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: graduacion-eduardo-web, Property 4: Conteo de importación es correcto
    // Validates: Requirements 1.5
    it('Property 4: Para cualquier archivo Excel procesado, el número de invitados reportados como importados debe ser igual al número de filas válidas', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              nombre: fc.option(fc.oneof(
                fc.constant(null),
                fc.constant(''),
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
              )),
              telefono: fc.option(fc.oneof(
                fc.constant(null),
                fc.constant(''),
                fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)
              )),
              pases: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined })
            }),
            { minLength: 0, maxLength: 30 }
          ),
          (guestData) => {
            // Create Excel workbook from data
            const worksheet = XLSX.utils.json_to_sheet(guestData.length > 0 ? guestData : [{ nombre: '', telefono: '', pases: 1 }]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Invitados');
            
            // Convert to buffer
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            
            // Parse the Excel file
            const result = parseExcelFile(buffer);
            
            // Count valid rows in input
            let validRowCount = 0;
            guestData.forEach((row) => {
              const nombreValid = row.nombre && row.nombre.toString().trim() !== '';
              const telefonoValid = row.telefono && row.telefono.toString().trim() !== '';
              
              if (nombreValid && telefonoValid) {
                validRowCount++;
              }
            });
            
            // The number of guests imported should equal the number of valid rows
            expect(result.guests.length).toBe(validRowCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Export Property-Based Tests', () => {
    
    // Feature: graduacion-eduardo-web, Property 15: Exportación incluye todas las confirmaciones
    // Validates: Requirements 6.1
    it('Property 15: Para cualquier conjunto de confirmaciones en la base de datos, el archivo Excel exportado debe contener exactamente el mismo número de registros que confirmaciones existen', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              guestName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              guestPhone: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              confirmed: fc.boolean(),
              companions: fc.array(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { maxLength: 5 }
              ),
              confirmedAt: fc.date().map(d => d.toISOString())
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (confirmations) => {
            // Export confirmations to Excel
            const buffer = exportConfirmations(confirmations);
            
            // Read the exported Excel file
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            
            // If there are no confirmations, we should have an empty row with headers
            if (confirmations.length === 0) {
              expect(data.length).toBeLessThanOrEqual(1);
              // If there's a row, it should be empty
              if (data.length === 1) {
                const row = data[0];
                expect(row.nombre || '').toBe('');
                expect(row.telefono || '').toBe('');
              }
            } else {
              // The number of rows should equal the number of confirmations
              expect(data.length).toBe(confirmations.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: graduacion-eduardo-web, Property 16: Exportación incluye columnas requeridas
    // Validates: Requirements 6.2
    it('Property 16: Para cualquier archivo Excel exportado, debe contener las columnas: nombre invitado, teléfono, confirmación, acompañantes, y fecha de confirmación', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              guestName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              guestPhone: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              confirmed: fc.boolean(),
              companions: fc.array(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { maxLength: 5 }
              ),
              confirmedAt: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (confirmations) => {
            // Export confirmations to Excel
            const buffer = exportConfirmations(confirmations);
            
            // Read the exported Excel file
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            
            // Check that all rows have the required columns
            data.forEach(row => {
              // Required columns: nombre, telefono, confirmado, acompañantes, fecha
              expect(row).toHaveProperty('nombre');
              expect(row).toHaveProperty('telefono');
              expect(row).toHaveProperty('confirmado');
              expect(row).toHaveProperty('acompañantes');
              expect(row).toHaveProperty('fecha');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: graduacion-eduardo-web, Property 17: Exportación incluye acompañantes
    // Validates: Requirements 6.3
    it('Property 17: Para cualquier confirmación que tenga acompañantes, el archivo Excel exportado debe incluir los nombres de todos los acompañantes asociados a esa confirmación', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              guestName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              guestPhone: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
              confirmed: fc.boolean(),
              companions: fc.array(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                { minLength: 1, maxLength: 5 } // At least 1 companion
              ),
              confirmedAt: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (confirmations) => {
            // Export confirmations to Excel
            const buffer = exportConfirmations(confirmations);
            
            // Read the exported Excel file
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            
            // Check that each confirmation with companions has them in the export
            data.forEach((row, index) => {
              const originalConfirmation = confirmations[index];
              
              if (originalConfirmation.companions && originalConfirmation.companions.length > 0) {
                // The acompañantes column should contain all companion names
                const companionsInExport = row.acompañantes || '';
                
                // Each companion name should be present in the export
                originalConfirmation.companions.forEach(companionName => {
                  expect(companionsInExport).toContain(companionName);
                });
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
