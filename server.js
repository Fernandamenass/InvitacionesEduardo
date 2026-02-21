const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./api/database');
const guestService = require('./api/guestService');
const confirmService = require('./api/confirmService');
const excelService = require('./api/excelService');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
db.initializeDatabase()
  .then(() => {
    console.log('✓ Database initialized');
  })
  .catch(err => {
    console.error('✗ Database initialization failed:', err);
  });

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// GET /api/guest/:id - Get guest by ID
app.get('/api/guest/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const guest = await guestService.getGuestById(id);
    
    if (!guest) {
      return res.status(404).json({ 
        error: 'Guest not found',
        message: 'El enlace de invitación es inválido o no existe'
      });
    }
    
    // Check if guest has confirmed
    const confirmation = await confirmService.getConfirmation(id);
    
    res.json({
      id: guest.id,
      name: guest.name,
      phone: guest.phone,
      maxCompanions: guest.maxCompanions,
      hasConfirmed: confirmation !== null
    });
    
  } catch (error) {
    console.error('Error fetching guest:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener datos del invitado'
    });
  }
});

// POST /api/confirm - Save confirmation
app.post('/api/confirm', async (req, res) => {
  try {
    const { guestId, confirmed, companions } = req.body;
    
    // Validate request body
    if (!guestId) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Guest ID es requerido'
      });
    }
    
    if (typeof confirmed !== 'boolean') {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Estado de confirmación debe ser un booleano'
      });
    }
    
    if (companions && !Array.isArray(companions)) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Acompañantes debe ser un array'
      });
    }
    
    // Save confirmation
    const savedConfirmation = await confirmService.saveConfirmation({
      guestId,
      confirmed,
      companions: companions || []
    });
    
    res.json({
      success: true,
      message: 'Confirmación guardada exitosamente',
      data: savedConfirmation
    });
    
  } catch (error) {
    console.error('Error saving confirmation:', error);
    
    // Handle specific errors
    if (error.message === 'Guest not found') {
      return res.status(404).json({ 
        error: 'Guest not found',
        message: 'Invitado no encontrado'
      });
    }
    
    if (error.message.includes('Cannot add') || error.message.includes('Maximum allowed')) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al guardar confirmación'
    });
  }
});

// POST /api/admin/import - Import guests from Excel
app.post('/api/admin/import', upload.single('file'), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Archivo Excel es requerido'
      });
    }
    
    // Parse Excel file
    const parseResult = excelService.parseExcelFile(req.file.buffer);
    
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
    let skippedCount = 0;
    const importErrors = [...parseResult.errors];
    
    for (const guestData of parseResult.guests) {
      try {
        await guestService.createGuest(guestData);
        importedCount++;
      } catch (error) {
        // Check if it's a duplicate error
        if (error.message.includes('Ya existe un invitado')) {
          skippedCount++;
          importErrors.push(`${guestData.name} (${guestData.phone}): Ya existe en la base de datos`);
        } else {
          importErrors.push(`${guestData.name}: ${error.message}`);
        }
      }
    }
    
    // Build success message
    let message = `${importedCount} invitado(s) importado(s)`;
    if (skippedCount > 0) {
      message += `, ${skippedCount} duplicado(s) omitido(s)`;
    }
    
    res.json({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      message: message,
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
});

// GET /api/admin/guests - Get all guests with invite links
app.get('/api/admin/guests', async (req, res) => {
  try {
    const guests = await guestService.getAllGuests();
    
    // Generate invite link for each guest and check confirmation status
    const guestsWithLinks = await Promise.all(
      guests.map(async (guest) => {
        const link = guestService.generateInviteLink(guest.id);
        const confirmation = await confirmService.getConfirmation(guest.id);
        
        return {
          id: guest.id,
          name: guest.name,
          phone: guest.phone,
          maxCompanions: guest.maxCompanions,
          link: link,
          confirmed: confirmation !== null && confirmation.confirmed === true,
          companionCount: confirmation ? confirmation.companions.length : 0
        };
      })
    );
    
    res.json({
      guests: guestsWithLinks
    });
    
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener lista de invitados'
    });
  }
});

// GET /api/admin/export - Export confirmations to Excel
app.get('/api/admin/export', async (req, res) => {
  try {
    const confirmations = await confirmService.getAllConfirmations();
    
    const excelBuffer = excelService.exportConfirmations(confirmations);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=confirmaciones.xlsx');
    
    res.send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting confirmations:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al exportar confirmaciones'
    });
  }
});

// POST /api/admin/clear - Clear all guests
app.post('/api/admin/clear', async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Delete all confirmations first (foreign key constraint)
    await connection.run('DELETE FROM confirmations');
    
    // Delete all guests
    await connection.run('DELETE FROM guests');
    
    // Reset auto-increment counters
    await connection.run('DELETE FROM sqlite_sequence WHERE name="guests"');
    await connection.run('DELETE FROM sqlite_sequence WHERE name="confirmations"');
    
    res.json({ 
      success: true, 
      message: 'Todos los invitados han sido eliminados' 
    });
    
  } catch (error) {
    console.error('Error clearing guests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al limpiar la base de datos'
    });
  }
});

// Serve index.html for root and invite routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/invite/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin.html
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Export for Vercel
module.exports = app;

// Start server (only for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🎓 Graduación Eduardo - Sistema de Invitaciones`);
    console.log(`\n✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ API health check: http://localhost:${PORT}/api/health\n`);
  });
}
