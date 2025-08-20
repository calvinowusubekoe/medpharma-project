import express from 'express';
import jwt from 'jsonwebtoken';
import {
  login,
  register,
  getCurrentUser,
  updateProfile,
  logout,
  getDoctors
} from '../controllers/authController.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medpharma-super-secret-jwt-key-2024-development-only';

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
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

// Public routes
router.post('/login', login);
router.post('/register', register);
router.get('/doctors', getDoctors);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

export { authenticateToken };
export default router;
