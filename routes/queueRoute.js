import express from 'express';
import { authenticateToken } from './authRoute.js';
import {
  joinQueue,
  getQueueStatus,
  leaveQueue,
  movePatient,
  getPatientQueueStatus,
  getQueueStats,
  checkPatientInQueue
} from '../controllers/queueController.js';

const router = express.Router();

// All queue routes require authentication
router.use(authenticateToken);

// Queue management routes
router.post('/join', joinQueue);
router.get('/status/:doctorId', getQueueStatus);
router.delete('/leave/:doctorId', leaveQueue);
router.post('/move', movePatient);

// Patient-specific routes
router.get('/my-status', getPatientQueueStatus);
router.get('/check-status', checkPatientInQueue);

// Doctor-specific routes
router.get('/stats', getQueueStats);

export default router;
