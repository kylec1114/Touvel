// Simple authentication middleware
// For development/demo purposes

const auth = (req, res, next) => {
  try {
    // Check for Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    // For development, allow requests with or without token
    // In production, you would validate the token here
    if (token) {
      // Token exists, continue
      req.user = { token }; // Attach token info to request
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = auth;
