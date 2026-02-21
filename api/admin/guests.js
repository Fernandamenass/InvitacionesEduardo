// Serverless function for getting all guests with invite links
const db = require('../database');
const guestService = require('../guestService');
const confirmService = require('../confirmService');

module.exports = async (req, res) => {
  // Initialize database
  await db.initializeDatabase();
  
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
          confirmed: confirmation !== null,
          companionCount: confirmation ? confirmation.companions.length : 0
        };
      })
    );
    
    res.status(200).json({
      guests: guestsWithLinks
    });
    
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al obtener lista de invitados'
    });
  }
};
