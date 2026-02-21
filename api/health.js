// Serverless function for health check
module.exports = async (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running' 
  });
};
