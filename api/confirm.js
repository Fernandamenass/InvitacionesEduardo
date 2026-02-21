// Serverless function for saving confirmation
const db = require('./database');
const confirmService = require('./confirmService');

module.exports = async (req, res) => {
  // Initialize database
  await db.initializeDatabase();
  
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
    
    res.status(200).json({
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
};
