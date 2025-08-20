import express from 'express';
import {
  createAppointment,
  getPatientAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new appointment
router.post('/create', authenticateToken, createAppointment);

// Get all appointments for a patient
router.get('/patient/:patientId', authenticateToken, getPatientAppointments);

// Get appointment by ID
router.get('/:appointmentId', authenticateToken, getAppointmentById);

// Update appointment status
router.put('/:appointmentId/status', authenticateToken, updateAppointmentStatus);

// Cancel appointment
router.put('/:appointmentId/cancel', authenticateToken, cancelAppointment);

// Delete appointment (admin only)
router.delete('/:appointmentId', authenticateToken, deleteAppointment);

export default router;
