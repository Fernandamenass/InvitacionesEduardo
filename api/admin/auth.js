// Serverless function for admin authentication
module.exports = async (req, res) => {
  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Solo se permite POST'
      });
    }
    
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Password es requerido'
      });
    }
    
    // Validate against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Configuración del servidor incompleta'
      });
    }
    
    // Simple password comparison
    // In production, consider using bcrypt for hashed passwords
    if (password === adminPassword) {
      return res.status(200).json({ 
        success: true,
        message: 'Autenticación exitosa'
      });
    } else {
      return res.status(401).json({ 
        success: false,
        message: 'Password incorrecto'
      });
    }
    
  } catch (error) {
    console.error('Error in authentication:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Error al autenticar'
    });
  }
};
