// Serverless function for importing guests from Excel
const db = require('../database');
const guestService = require('../guestService');
const excelService = require('../excelService');

// Helper to parse multipart form data
const parseMultipartForm = async (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        
        if (!boundary) {
          return reject(new Error('No boundary found'));
        }
        
        // Parse multipart data
        const parts = buffer.toString('binary').split(`--${boundary}`);
        
        for (const part of parts) {
          if (part.includes('filename=')) {
            // Extract file data
            const dataStart = part.indexOf('\r\n\r\n') + 4;
            const dataEnd = part.lastIndexOf('\r\n');
            const fileData = part.substring(dataStart, dataEnd);
            const fileBuffer = Buffer.from(fileData, 'binary');
            
            resolve(fileBuffer);
            return;
          }
        }
        
        reject(new Error('No file found in request'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

module.exports = async (req, res) => {
  // Initialize database
  await db.initializeDatabase();
  
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Solo se permite POST'
      });
    }
    
    // Parse file from multipart form data
    const fileBuffer = await parseMultipartForm(req);
    
    if (!fileBuffer) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Archivo Excel es requerido'
      });
    }
    
    // Parse Excel file
    const parseResult = excelService.parseExcelFile(fileBuffer);
    
    // If there are parsing errors and no guests, return error
    if (parseResult.errors.length > 0 && parseResult.guests.length === 0) {
      return res.status(400).json({ 
        success: false,
        imported: 0,
        errors: parseResult.errors
      });
    }
    
    // Import valid guests
    let importedCount = 0;
    const importErrors = [...parseResult.errors];
    
    for (const guestData of parseResult.guests) {
      try {
        await guestService.createGuest(guestData);
        importedCount++;
      } catch (error) {
        importErrors.push(`Error al importar ${guestData.name}: ${error.message}`);
      }
    }
    
    res.status(200).json({
      success: true,
      imported: importedCount,
      errors: importErrors
    });
    
  } catch (error) {
    console.error('Error importing guests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al importar invitados',
      details: error.message
    });
  }
};
