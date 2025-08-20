import { Appointment, Consultation } from '../models/appointmentModel.js';
import { Queue } from '../models/queueModel.js';
import { Doctor } from '../models/userModel.js';

// Get doctor dashboard data
export const getDoctorDashboard = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const doctor = Doctor.findById(req.user.id);
    const queue = Queue.getByDoctorId(req.user.id);
    const stats = Queue.getStats(req.user.id);
    const consultationStats = Consultation.getStats(req.user.id, 'today');

    res.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        availability: doctor.availability,
        isOnline: doctor.isOnline,
        todayConsultations: doctor.todayConsultations
      },
      queue: queue.map(entry => ({
        id: entry.id,
        patientName: entry.patientName,
        consultationType: entry.consultationType,
        symptoms: entry.symptoms,
        urgencyLevel: entry.urgencyLevel,
        joinedAt: entry.joinedAt,
        position: entry.position,
        status: entry.status
      })),
      stats: {
        totalPatients: queue.length,
        waitingPatients: stats.waitingPatients,
        currentPatient: doctor.currentPatient,
        todayStats: consultationStats
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update doctor status
export const updateDoctorStatus = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { availability, delayMinutes } = req.body;
    
    const updateData = {};
    if (availability) {
      updateData.availability = availability;
    }

    const doctor = Doctor.updateStatus(req.user.id, updateData);

    res.json({
      success: true,
      doctor: {
        id: doctor.id,
        availability: doctor.availability,
        delayMinutes: delayMinutes || 0
      }
    });

    // Notify patients in queue about status change
    const io = req.app.get('io');
    io.emit('doctorStatusUpdate', {
      doctorId: doctor.id,
      availability: doctor.availability,
      delayMinutes: delayMinutes || 0
    });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Start consultation
export const startConsultation = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { patientId } = req.body;
    const doctor = Doctor.findById(req.user.id);
    const queue = Queue.getByDoctorId(req.user.id);
    
    const patientEntry = Queue.findEntryById(req.user.id, patientId);
    if (!patientEntry) {
      return res.status(404).json({ error: 'Patient not found in queue' });
    }

    // Update patient status in queue
    Queue.updatePatientStatus(req.user.id, patientId, 'in-consultation');

    // Update doctor's current patient
    Doctor.updateStatus(req.user.id, { currentPatient: patientEntry });

    // Start consultation record
    const consultation = Consultation.start({
      doctorId: doctor.id,
      patientId: patientEntry.patientId,
      queueEntryId: patientEntry.id,
      type: 'video'
    });

    res.json({
      success: true,
      consultation: {
        id: consultation.id,
        doctorId: doctor.id,
        patientId: patientEntry.patientId,
        startedAt: consultation.startedAt,
        status: 'active'
      }
    });

    // Notify patient that consultation has started
    const io = req.app.get('io');
    io.emit('consultationStarted', {
      patientId: patientEntry.patientId,
      doctorName: doctor.name,
      consultationId: consultation.id
    });

  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// End consultation
export const endConsultation = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { patientId, notes, diagnosis, prescription, followUpRequired, followUpDate } = req.body;
    const doctor = Doctor.findById(req.user.id);
    
    const patientEntry = Queue.findEntryById(req.user.id, patientId);
    if (!patientEntry) {
      return res.status(404).json({ error: 'Patient not found in queue' });
    }

    // Find and end the consultation
    const activeConsultation = Consultation.findActiveByDoctor(req.user.id);
    if (activeConsultation && activeConsultation.queueEntryId === patientId) {
      Consultation.end(activeConsultation.id, {
        notes,
        diagnosis,
        prescription,
        followUpRequired,
        followUpDate
      });
    }

    // Remove patient from queue
    Queue.removePatient(req.user.id, patientId);

    // Update doctor status
    Doctor.updateStatus(req.user.id, { 
      currentPatient: null,
      todayConsultations: doctor.todayConsultations + 1
    });

    // Update queue positions
    Queue.updatePositions(req.user.id);

    res.json({
      success: true,
      consultation: {
        endedAt: new Date().toISOString(),
        notes: notes || '',
        status: 'completed'
      }
    });

    const io = req.app.get('io');
    
    // Notify patient that consultation ended
    io.emit('consultationEnded', {
      patientId: patientEntry.patientId,
      doctorName: doctor.name
    });

    // Check for next patient and notify them
    const nextPatient = Queue.getNextPatient(req.user.id);
    if (nextPatient) {
      Queue.updatePatientStatus(req.user.id, nextPatient.id, 'ready');
      io.emit('nextPatientReady', {
        patientId: nextPatient.patientId,
        doctorName: doctor.name
      });
    }

    // Update queue for all connected clients
    const updatedQueue = Queue.getByDoctorId(req.user.id);
    io.emit('queueUpdate', {
      doctorId: req.user.id,
      queue: updatedQueue.map(p => ({
        id: p.id,
        position: p.position,
        estimatedWaitTime: p.estimatedWaitTime,
        status: p.status
      }))
    });

  } catch (error) {
    console.error('End consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get consultation history
export const getConsultationHistory = (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    if (req.user.userType === 'doctor') {
      const consultations = Consultation.getByDoctorId(req.user.id);
      const stats = Consultation.getStats(req.user.id, period);
      
      res.json({
        consultations: consultations.map(c => ({
          id: c.id,
          patientId: c.patientId,
          startedAt: c.startedAt,
          endedAt: c.endedAt,
          duration: c.duration,
          status: c.status,
          type: c.type,
          notes: c.notes ? c.notes.substring(0, 100) + '...' : '' // Truncate for privacy
        })),
        stats
      });
    } else {
      const consultations = Consultation.getByPatientId(req.user.id);
      
      res.json({
        consultations: consultations.map(c => ({
          id: c.id,
          doctorId: c.doctorId,
          startedAt: c.startedAt,
          endedAt: c.endedAt,
          duration: c.duration,
          status: c.status,
          type: c.type,
          diagnosis: c.diagnosis,
          prescription: c.prescription,
          followUpRequired: c.followUpRequired,
          followUpDate: c.followUpDate
        }))
      });
    }
  } catch (error) {
    console.error('Get consultation history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update consultation notes (during consultation)
export const updateConsultationNotes = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { consultationId } = req.params;
    const { notes } = req.body;

    const consultation = Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own consultations' });
    }

    const updatedConsultation = Consultation.updateNotes(consultationId, notes);

    res.json({
      success: true,
      consultation: {
        id: updatedConsultation.id,
        notes: updatedConsultation.notes,
        updatedAt: updatedConsultation.updatedAt
      }
    });

  } catch (error) {
    console.error('Update consultation notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get active consultation
export const getActiveConsultation = (req, res) => {
  try {
    let activeConsultation = null;

    if (req.user.userType === 'doctor') {
      activeConsultation = Consultation.findActiveByDoctor(req.user.id);
    } else {
      activeConsultation = Consultation.findActiveByPatient(req.user.id);
    }

    if (!activeConsultation) {
      return res.json({
        hasActiveConsultation: false,
        consultation: null
      });
    }

    res.json({
      hasActiveConsultation: true,
      consultation: {
        id: activeConsultation.id,
        doctorId: activeConsultation.doctorId,
        patientId: activeConsultation.patientId,
        startedAt: activeConsultation.startedAt,
        status: activeConsultation.status,
        type: activeConsultation.type
      }
    });

  } catch (error) {
    console.error('Get active consultation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getDoctorDashboard,
  updateDoctorStatus,
  startConsultation,
  endConsultation,
  getConsultationHistory,
  updateConsultationNotes,
  getActiveConsultation
};
