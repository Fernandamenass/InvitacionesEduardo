// Clear all guests endpoint
const { getConnection } = require('../database');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const db = await getConnection();
    
    // Delete all guests and confirmations
    await db.run('DELETE FROM confirmations');
    await db.run('DELETE FROM guests');
    
    // Reset auto-increment counters (SQLite specific)
    await db.run('DELETE FROM sqlite_sequence WHERE name="guests"');
    await db.run('DELETE FROM sqlite_sequence WHERE name="confirmations"');
    
    res.json({ 
      success: true, 
      message: 'Todos los invitados han sido eliminados' 
    });
  } catch (error) {
    console.error('Clear guests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al limpiar la base de datos',
      error: error.message 
    });
  }
};
