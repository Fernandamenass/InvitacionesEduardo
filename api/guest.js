// Serverless function for getting guest by ID
const db = require('./database');
const guestService = require('./guestService');
const confirmService = require('./confirmService');

module.exports = async (req, res) => {
  // Initialize database
  await db.initializeDatabase();
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Guest ID es requerido'
      });
    }
    
    const guest = await guestService.getGuestById(id);
    
    if (!guest) {
      return res.status(404).json({ 
        error: 'Guest not found',
        message: 'El enlace de invitación es inválido o no existe'
      });
    }
    
    // Check if guest has confirmed
    const confirmation = await confirmService.getConfirmation(id);
    
    res.status(200).json({
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
};
