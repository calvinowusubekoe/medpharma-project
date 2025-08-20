import { Queue } from '../models/queueModel.js';
import { Doctor } from '../models/userModel.js';

// Join queue
export const joinQueue = (req, res) => {
  try {
    const { doctorId, consultationType, symptoms, urgencyLevel, preferredTime } = req.body;
    
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ error: 'Only patients can join queues' });
    }

    const doctor = Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if patient is already in this queue
    const existingEntry = Queue.findPatient(doctorId, req.user.id);
    if (existingEntry) {
      return res.status(400).json({ error: 'You are already in this doctor\'s queue' });
    }

    // Check if patient is in any other queue
    const existingInAnyQueue = Queue.isPatientInAnyQueue(req.user.id);
    if (existingInAnyQueue) {
      return res.status(400).json({ 
        error: `You are already in queue for ${existingInAnyQueue.entry.doctorName}. Please leave that queue first.` 
      });
    }

    const queueEntry = Queue.addPatient({
      patientId: req.user.id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      doctorId,
      doctorName: doctor.name,
      consultationType,
      symptoms,
      urgencyLevel,
      preferredTime
    });

    res.json({
      success: true,
      queueEntry: {
        id: queueEntry.id,
        position: queueEntry.position,
        estimatedWaitTime: queueEntry.estimatedWaitTime,
        doctorName: doctor.name,
        joinedAt: queueEntry.joinedAt,
        status: queueEntry.status
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('newPatient', {
      doctorId,
      patient: queueEntry
    });

    // Update queue positions for all patients
    const updatedQueue = Queue.updatePositions(doctorId);
    io.emit('queueUpdate', {
      doctorId,
      queue: updatedQueue.map(p => ({
        id: p.id,
        position: p.position,
        estimatedWaitTime: p.estimatedWaitTime,
        status: p.status
      }))
    });

  } catch (error) {
    console.error('Queue join error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get queue status
export const getQueueStatus = (req, res) => {
  try {
    const { doctorId } = req.params;
    const queue = Queue.getByDoctorId(doctorId);
    
    if (req.user.userType === 'patient') {
      // Return patient's specific queue position
      const patientEntry = Queue.findPatient(doctorId, req.user.id);
      if (!patientEntry) {
        return res.status(404).json({ error: 'You are not in this queue' });
      }

      res.json({
        position: patientEntry.position,
        estimatedWaitTime: patientEntry.estimatedWaitTime,
        status: patientEntry.status,
        doctorName: patientEntry.doctorName,
        joinedAt: patientEntry.joinedAt,
        queueLength: queue.length,
        id: patientEntry.id
      });
    } else {
      // Return full queue for doctors
      res.json({
        queue: queue.map(entry => ({
          id: entry.id,
          patientName: entry.patientName,
          consultationType: entry.consultationType,
          symptoms: entry.symptoms,
          urgencyLevel: entry.urgencyLevel,
          joinedAt: entry.joinedAt,
          position: entry.position,
          estimatedWaitTime: entry.estimatedWaitTime,
          status: entry.status
        })),
        totalPatients: queue.length,
        stats: Queue.getStats(doctorId)
      });
    }
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Leave queue
export const leaveQueue = (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ error: 'Only patients can leave queues' });
    }

    const patientEntry = Queue.findPatient(doctorId, req.user.id);
    if (!patientEntry) {
      return res.status(404).json({ error: 'You are not in this queue' });
    }

    const removedEntry = Queue.removePatient(doctorId, patientEntry.id);
    if (!removedEntry) {
      return res.status(404).json({ error: 'Failed to remove from queue' });
    }

    res.json({
      success: true,
      message: 'Successfully left the queue'
    });

    // Emit real-time update
    const io = req.app.get('io');
    const updatedQueue = Queue.getByDoctorId(doctorId);
    io.emit('queueUpdate', {
      doctorId,
      queue: updatedQueue.map(p => ({
        id: p.id,
        position: p.position,
        estimatedWaitTime: p.estimatedWaitTime,
        status: p.status
      }))
    });

    io.emit('patientLeft', {
      doctorId,
      patientId: req.user.id,
      patientName: req.user.name
    });

  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Move patient in queue (doctors only)
export const movePatient = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { doctorId, entryId, direction } = req.body;

    if (doctorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage your own queue' });
    }

    let success = false;
    if (direction === 'up') {
      success = Queue.movePatientUp(doctorId, entryId);
    } else if (direction === 'down') {
      success = Queue.movePatientDown(doctorId, entryId);
    } else {
      return res.status(400).json({ error: 'Direction must be "up" or "down"' });
    }

    if (!success) {
      return res.status(400).json({ error: 'Cannot move patient in that direction' });
    }

    const updatedQueue = Queue.getByDoctorId(doctorId);
    res.json({
      success: true,
      queue: updatedQueue.map(entry => ({
        id: entry.id,
        patientName: entry.patientName,
        position: entry.position,
        estimatedWaitTime: entry.estimatedWaitTime,
        status: entry.status
      }))
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('queueUpdate', {
      doctorId,
      queue: updatedQueue.map(p => ({
        id: p.id,
        position: p.position,
        estimatedWaitTime: p.estimatedWaitTime,
        status: p.status
      }))
    });

  } catch (error) {
    console.error('Move patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get patient's current queue position across all doctors
export const getPatientQueueStatus = (req, res) => {
  try {
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ error: 'Access denied. Patients only.' });
    }

    const queueInfo = Queue.isPatientInAnyQueue(req.user.id);
    
    if (!queueInfo) {
      return res.json({
        inQueue: false,
        message: 'You are not currently in any queue'
      });
    }

    const { doctorId, entry } = queueInfo;
    const doctor = Doctor.findById(doctorId);

    res.json({
      inQueue: true,
      queueEntry: {
        id: entry.id,
        doctorId: entry.doctorId,
        doctorName: entry.doctorName,
        position: entry.position,
        estimatedWaitTime: entry.estimatedWaitTime,
        status: entry.status,
        joinedAt: entry.joinedAt,
        consultationType: entry.consultationType
      },
      doctor: doctor ? {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        availability: doctor.availability,
        isOnline: doctor.isOnline
      } : null
    });

  } catch (error) {
    console.error('Get patient queue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get queue statistics (doctors only)
export const getQueueStats = (req, res) => {
  try {
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    const { doctorId } = req.params;
    
    if (doctorId && doctorId !== req.user.id) {
      return res.status(403).json({ error: 'You can only view your own queue statistics' });
    }

    const targetDoctorId = doctorId || req.user.id;
    const stats = Queue.getStats(targetDoctorId);
    const queue = Queue.getByDoctorId(targetDoctorId);

    res.json({
      stats,
      queueDetails: {
        currentQueue: queue.length,
        nextPatient: Queue.getNextPatient(targetDoctorId),
        currentPatient: Queue.getCurrentPatient(targetDoctorId),
        longestWaitTime: queue.length > 0 ? Math.max(...queue.map(p => p.estimatedWaitTime)) : 0
      }
    });

  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  joinQueue,
  getQueueStatus,
  leaveQueue,
  movePatient,
  getPatientQueueStatus,
  getQueueStats
};
