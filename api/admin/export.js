// Serverless function for exporting confirmations to Excel
const db = require('../database');
const confirmService = require('../confirmService');
const excelService = require('../excelService');

module.exports = async (req, res) => {
  // Initialize database
  await db.initializeDatabase();
  
  try {
    const confirmations = await confirmService.getAllConfirmations();
    
    const excelBuffer = excelService.exportConfirmations(confirmations);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=confirmaciones.xlsx');
    
    res.status(200).send(excelBuffer);
    
  } catch (error) {
    console.error('Error exporting confirmations:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al exportar confirmaciones'
    });
  }
};
