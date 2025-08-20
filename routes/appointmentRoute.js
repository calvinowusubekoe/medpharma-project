import express from 'express';
import { authenticateToken } from './authRoute.js';
import {
  getDoctorDashboard,
  updateDoctorStatus,
  startConsultation,
  endConsultation,
  getConsultationHistory,
  updateConsultationNotes,
  getActiveConsultation
} from '../controllers/appointmentController.js';

const router = express.Router();

// All appointment routes require authentication
router.use(authenticateToken);

// Doctor dashboard routes
router.get('/doctor/dashboard', getDoctorDashboard);
router.post('/doctor/status', updateDoctorStatus);

// Consultation management routes
router.post('/consultation/start', startConsultation);
router.post('/consultation/end', endConsultation);
router.get('/consultation/active', getActiveConsultation);
router.get('/consultation/history', getConsultationHistory);
router.put('/consultation/:consultationId/notes', updateConsultationNotes);

export default router;
