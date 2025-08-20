import { v4 as uuidv4 } from 'uuid';

// In-memory storage for queues (replace with database in production)
const queues = new Map();

// Initialize queues for all doctors
const initializeQueues = () => {
  const doctorIds = ['DOC001', 'DOC002', 'DOC003'];
  doctorIds.forEach(doctorId => {
    queues.set(doctorId, []);
  });
};

// Queue Model
export const Queue = {
  // Initialize queues
  initialize() {
    initializeQueues();
  },

  // Add patient to queue
  addPatient(queueData) {
    const { doctorId } = queueData;
    const queue = queues.get(doctorId) || [];
    
    const queueEntry = {
      id: uuidv4(),
      patientId: queueData.patientId,
      patientName: queueData.patientName,
      patientEmail: queueData.patientEmail,
      doctorId,
      doctorName: queueData.doctorName,
      consultationType: queueData.consultationType || 'General Consultation',
      symptoms: queueData.symptoms || '',
      urgencyLevel: queueData.urgencyLevel || 'Normal',
      preferredTime: queueData.preferredTime || '',
      joinedAt: new Date().toISOString(),
      position: queue.length + 1,
      estimatedWaitTime: this.calculateWaitTime(doctorId, queue.length + 1),
      status: 'waiting'
    };

    queue.push(queueEntry);
    queues.set(doctorId, queue);
    
    // Update all positions
    this.updatePositions(doctorId);
    
    return queueEntry;
  },

  // Get queue for doctor
  getByDoctorId(doctorId) {
    return queues.get(doctorId) || [];
  },

  // Find patient in queue
  findPatient(doctorId, patientId) {
    const queue = queues.get(doctorId) || [];
    return queue.find(entry => entry.patientId === patientId);
  },

  // Find queue entry by ID
  findEntryById(doctorId, entryId) {
    const queue = queues.get(doctorId) || [];
    return queue.find(entry => entry.id === entryId);
  },

  // Remove patient from queue
  removePatient(doctorId, entryId) {
    const queue = queues.get(doctorId) || [];
    const index = queue.findIndex(entry => entry.id === entryId);
    
    if (index === -1) return null;
    
    const removedEntry = queue.splice(index, 1)[0];
    queues.set(doctorId, queue);
    
    // Update positions for remaining patients
    this.updatePositions(doctorId);
    
    return removedEntry;
  },

  // Update patient status
  updatePatientStatus(doctorId, entryId, status) {
    const queue = queues.get(doctorId) || [];
    const entry = queue.find(e => e.id === entryId);
    
    if (!entry) return null;
    
    entry.status = status;
    queues.set(doctorId, queue);
    
    return entry;
  },

  // Move patient up in queue
  movePatientUp(doctorId, entryId) {
    const queue = queues.get(doctorId) || [];
    const index = queue.findIndex(entry => entry.id === entryId);
    
    if (index <= 0) return false; // Already at top or not found
    
    // Swap with previous patient
    [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
    queues.set(doctorId, queue);
    
    this.updatePositions(doctorId);
    return true;
  },

  // Move patient down in queue
  movePatientDown(doctorId, entryId) {
    const queue = queues.get(doctorId) || [];
    const index = queue.findIndex(entry => entry.id === entryId);
    
    if (index === -1 || index >= queue.length - 1) return false; // Not found or already at bottom
    
    // Swap with next patient
    [queue[index], queue[index + 1]] = [queue[index + 1], queue[index]];
    queues.set(doctorId, queue);
    
    this.updatePositions(doctorId);
    return true;
  },

  // Calculate estimated wait time
  calculateWaitTime(doctorId, position) {
    // Default consultation time if doctor info not available
    const avgConsultationTime = 15; // minutes
    return (position - 1) * avgConsultationTime;
  },

  // Update all positions in queue
  updatePositions(doctorId) {
    const queue = queues.get(doctorId) || [];
    queue.forEach((patient, index) => {
      patient.position = index + 1;
      patient.estimatedWaitTime = this.calculateWaitTime(doctorId, patient.position);
    });
    queues.set(doctorId, queue);
    
    return queue;
  },

  // Get queue statistics
  getStats(doctorId) {
    const queue = queues.get(doctorId) || [];
    return {
      totalPatients: queue.length,
      waitingPatients: queue.filter(p => p.status === 'waiting').length,
      readyPatients: queue.filter(p => p.status === 'ready').length,
      inConsultation: queue.filter(p => p.status === 'in-consultation').length,
      averageWaitTime: queue.length > 0 
        ? queue.reduce((sum, p) => sum + p.estimatedWaitTime, 0) / queue.length 
        : 0
    };
  },

  // Get next patient in queue
  getNextPatient(doctorId) {
    const queue = queues.get(doctorId) || [];
    return queue.find(p => p.status === 'waiting') || null;
  },

  // Get current patient (in consultation)
  getCurrentPatient(doctorId) {
    const queue = queues.get(doctorId) || [];
    return queue.find(p => p.status === 'in-consultation') || null;
  },

  // Clear queue (emergency use)
  clearQueue(doctorId) {
    queues.set(doctorId, []);
    return true;
  },

  // Get all queues (admin only)
  getAllQueues() {
    const allQueues = {};
    for (const [doctorId, queue] of queues.entries()) {
      allQueues[doctorId] = queue.map(entry => ({
        ...entry,
        patientEmail: undefined // Don't expose email in bulk data
      }));
    }
    return allQueues;
  },

  // Check if patient is already in any queue
  isPatientInAnyQueue(patientId) {
    for (const [doctorId, queue] of queues.entries()) {
      const found = queue.find(entry => entry.patientId === patientId);
      if (found) {
        return { doctorId, entry: found };
      }
    }
    return null;
  }
};

// Initialize queues when module loads
Queue.initialize();

export default Queue;
