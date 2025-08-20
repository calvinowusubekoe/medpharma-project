import { v4 as uuidv4 } from 'uuid';

// In-memory storage for appointments (replace with database in production)
const appointments = new Map();
const consultations = new Map();

// Appointment Model
export const Appointment = {
  // Create new appointment
  create(appointmentData) {
    const appointment = {
      id: uuidv4(),
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      type: appointmentData.type || 'consultation',
      scheduledDate: appointmentData.scheduledDate,
      scheduledTime: appointmentData.scheduledTime,
      duration: appointmentData.duration || 30,
      status: 'scheduled',
      notes: appointmentData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments.set(appointment.id, appointment);
    return appointment;
  },

  // Find appointment by ID
  findById(id) {
    return appointments.get(id);
  },

  // Get appointments for doctor
  getByDoctorId(doctorId, options = {}) {
    const doctorAppointments = Array.from(appointments.values())
      .filter(apt => apt.doctorId === doctorId);

    if (options.date) {
      return doctorAppointments.filter(apt => 
        apt.scheduledDate === options.date
      );
    }

    if (options.status) {
      return doctorAppointments.filter(apt => 
        apt.status === options.status
      );
    }

    return doctorAppointments;
  },

  // Get appointments for patient
  getByPatientId(patientId, options = {}) {
    const patientAppointments = Array.from(appointments.values())
      .filter(apt => apt.patientId === patientId);

    if (options.status) {
      return patientAppointments.filter(apt => 
        apt.status === options.status
      );
    }

    return patientAppointments.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  // Update appointment
  update(id, updateData) {
    const appointment = appointments.get(id);
    if (!appointment) return null;

    const updatedAppointment = {
      ...appointment,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    appointments.set(id, updatedAppointment);
    return updatedAppointment;
  },

  // Cancel appointment
  cancel(id, reason = '') {
    const appointment = appointments.get(id);
    if (!appointment) return null;

    appointment.status = 'cancelled';
    appointment.cancelReason = reason;
    appointment.cancelledAt = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    appointments.set(id, appointment);
    return appointment;
  },

  // Complete appointment
  complete(id, notes = '') {
    const appointment = appointments.get(id);
    if (!appointment) return null;

    appointment.status = 'completed';
    appointment.completionNotes = notes;
    appointment.completedAt = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    appointments.set(id, appointment);
    return appointment;
  },

  // Get upcoming appointments
  getUpcoming(doctorId, limit = 10) {
    const now = new Date();
    return Array.from(appointments.values())
      .filter(apt => 
        apt.doctorId === doctorId && 
        apt.status === 'scheduled' &&
        new Date(apt.scheduledDate + 'T' + apt.scheduledTime) > now
      )
      .sort((a, b) => 
        new Date(a.scheduledDate + 'T' + a.scheduledTime) - 
        new Date(b.scheduledDate + 'T' + b.scheduledTime)
      )
      .slice(0, limit);
  },

  // Delete appointment
  delete(id) {
    return appointments.delete(id);
  }
};

// Consultation Model
export const Consultation = {
  // Start consultation
  start(consultationData) {
    const consultation = {
      id: uuidv4(),
      appointmentId: consultationData.appointmentId || null,
      doctorId: consultationData.doctorId,
      patientId: consultationData.patientId,
      queueEntryId: consultationData.queueEntryId || null,
      type: consultationData.type || 'video',
      startedAt: new Date().toISOString(),
      status: 'active',
      notes: '',
      diagnosis: '',
      prescription: '',
      followUpRequired: false,
      followUpDate: null
    };

    consultations.set(consultation.id, consultation);
    return consultation;
  },

  // Find consultation by ID
  findById(id) {
    return consultations.get(id);
  },

  // Find active consultation for doctor
  findActiveByDoctor(doctorId) {
    return Array.from(consultations.values())
      .find(cons => cons.doctorId === doctorId && cons.status === 'active');
  },

  // Find active consultation for patient
  findActiveByPatient(patientId) {
    return Array.from(consultations.values())
      .find(cons => cons.patientId === patientId && cons.status === 'active');
  },

  // End consultation
  end(id, endData) {
    const consultation = consultations.get(id);
    if (!consultation) return null;

    consultation.status = 'completed';
    consultation.endedAt = new Date().toISOString();
    consultation.duration = Math.floor(
      (new Date(consultation.endedAt) - new Date(consultation.startedAt)) / 1000 / 60
    );
    
    if (endData.notes) consultation.notes = endData.notes;
    if (endData.diagnosis) consultation.diagnosis = endData.diagnosis;
    if (endData.prescription) consultation.prescription = endData.prescription;
    if (endData.followUpRequired) consultation.followUpRequired = endData.followUpRequired;
    if (endData.followUpDate) consultation.followUpDate = endData.followUpDate;

    consultations.set(id, consultation);
    return consultation;
  },

  // Update consultation notes
  updateNotes(id, notes) {
    const consultation = consultations.get(id);
    if (!consultation) return null;

    consultation.notes = notes;
    consultation.updatedAt = new Date().toISOString();

    consultations.set(id, consultation);
    return consultation;
  },

  // Get consultations for doctor
  getByDoctorId(doctorId, options = {}) {
    const doctorConsultations = Array.from(consultations.values())
      .filter(cons => cons.doctorId === doctorId);

    if (options.status) {
      return doctorConsultations.filter(cons => cons.status === options.status);
    }

    if (options.date) {
      const targetDate = new Date(options.date).toDateString();
      return doctorConsultations.filter(cons => 
        new Date(cons.startedAt).toDateString() === targetDate
      );
    }

    return doctorConsultations.sort((a, b) => 
      new Date(b.startedAt) - new Date(a.startedAt)
    );
  },

  // Get consultations for patient
  getByPatientId(patientId, options = {}) {
    const patientConsultations = Array.from(consultations.values())
      .filter(cons => cons.patientId === patientId);

    if (options.status) {
      return patientConsultations.filter(cons => cons.status === options.status);
    }

    return patientConsultations.sort((a, b) => 
      new Date(b.startedAt) - new Date(a.startedAt)
    );
  },

  // Get consultation statistics
  getStats(doctorId, period = 'today') {
    const doctorConsultations = this.getByDoctorId(doctorId);
    const now = new Date();
    let filteredConsultations = doctorConsultations;

    if (period === 'today') {
      const today = now.toDateString();
      filteredConsultations = doctorConsultations.filter(cons => 
        new Date(cons.startedAt).toDateString() === today
      );
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredConsultations = doctorConsultations.filter(cons => 
        new Date(cons.startedAt) >= weekAgo
      );
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredConsultations = doctorConsultations.filter(cons => 
        new Date(cons.startedAt) >= monthAgo
      );
    }

    const completedConsultations = filteredConsultations.filter(c => c.status === 'completed');
    const totalDuration = completedConsultations.reduce((sum, c) => sum + (c.duration || 0), 0);

    return {
      total: filteredConsultations.length,
      completed: completedConsultations.length,
      active: filteredConsultations.filter(c => c.status === 'active').length,
      cancelled: filteredConsultations.filter(c => c.status === 'cancelled').length,
      averageDuration: completedConsultations.length > 0 
        ? Math.round(totalDuration / completedConsultations.length) 
        : 0,
      totalDuration
    };
  }
};

export default { Appointment, Consultation };
