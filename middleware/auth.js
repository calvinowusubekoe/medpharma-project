import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medpharma-super-secret-jwt-key-2024-development-only';

// JWT Authentication Middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Doctor-only middleware
export const requireDoctor = (req, res, next) => {
  if (req.user.userType !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctors only.' });
  }
  next();
};

// Patient-only middleware
export const requirePatient = (req, res, next) => {
  if (req.user.userType !== 'patient') {
    return res.status(403).json({ error: 'Access denied. Patients only.' });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

export default {
  authenticateToken,
  requireDoctor,
  requirePatient,
  optionalAuth
};
