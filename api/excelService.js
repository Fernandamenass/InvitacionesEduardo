const XLSX = require('xlsx');

/**
 * Parse Excel file and extract guest data
 * @param {Buffer|string} filePathOrBuffer - Path to Excel file or buffer
 * @returns {Object} Parsed data with guests array and errors array
 */
function parseExcelFile(filePathOrBuffer) {
  try {
    // Read the workbook
    const workbook = XLSX.read(filePathOrBuffer, { type: Buffer.isBuffer(filePathOrBuffer) ? 'buffer' : 'file' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        guests: [],
        errors: ['El archivo Excel está vacío o no contiene hojas']
      };
    }
    
    const sheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    // If truly no data (empty sheet), return error
    if (data.length === 0) {
      return {
        guests: [],
        errors: ['El archivo Excel no contiene datos']
      };
    }
    
    const guests = [];
    const errors = [];
    
    // Validate required columns exist (check first row that has any data)
    const firstRow = data[0];
    const hasNombre = 'nombre' in firstRow;
    const hasTelefono = 'telefono' in firstRow;
    
    if (!hasNombre || !hasTelefono) {
      const missingColumns = [];
      if (!hasNombre) missingColumns.push('nombre');
      if (!hasTelefono) missingColumns.push('telefono');
      
      return {
        guests: [],
        errors: [`Columnas requeridas faltantes: ${missingColumns.join(', ')}`]
      };
    }
    
    // Process each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row
      
      const nombre = row.nombre;
      const telefono = row.telefono;
      const pases = row.pases;
      
      // Validate required fields
      if (!nombre || nombre.toString().trim() === '') {
        errors.push(`Fila ${rowNumber}: campo 'nombre' está vacío o faltante`);
        return;
      }
      
      if (!telefono || telefono.toString().trim() === '') {
        errors.push(`Fila ${rowNumber}: campo 'telefono' está vacío o faltante`);
        return;
      }
      
      // Parse pases (default to 1 if not provided or invalid)
      let maxCompanions = 1;
      if (pases !== null && pases !== undefined) {
        const parsedPases = parseInt(pases, 10);
        if (!isNaN(parsedPases) && parsedPases > 0) {
          maxCompanions = parsedPases;
        }
      }
      
      guests.push({
        name: nombre.toString().trim(),
        phone: telefono.toString().trim(),
        maxCompanions: maxCompanions
      });
    });
    
    return {
      guests,
      errors
    };
    
  } catch (error) {
    return {
      guests: [],
      errors: [`Error al procesar el archivo: ${error.message}`]
    };
  }
}

/**
 * Export confirmations to Excel file
 * @param {Array} confirmations - Array of confirmation objects with guest and companion data
 * @returns {Buffer} Excel file buffer
 */
function exportConfirmations(confirmations) {
  // Prepare data for Excel export
  const excelData = [];
  
  // Handle empty confirmations case - return headers only
  if (!confirmations || confirmations.length === 0) {
    excelData.push({
      nombre: '',
      telefono: '',
      confirmado: '',
      acompañantes: '',
      fecha: ''
    });
  } else {
    // Process each confirmation
    confirmations.forEach(confirmation => {
      const row = {
        nombre: confirmation.guestName || '',
        telefono: confirmation.guestPhone || '',
        confirmado: confirmation.confirmed ? 'Sí' : 'No',
        acompañantes: confirmation.companions && confirmation.companions.length > 0 
          ? confirmation.companions.join(', ') 
          : '',
        fecha: confirmation.confirmedAt || ''
      };
      
      excelData.push(row);
    });
  }
  
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Confirmaciones');
  
  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
}

module.exports = {
  parseExcelFile,
  exportConfirmations
};
