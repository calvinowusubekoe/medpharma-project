import Appointment from '../models/Appointment.js';

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      consultationType,
      date,
      time,
      symptoms,
      reasonForVisit,
      medicalHistory,
      currentMedications,
      urgencyLevel,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (!patientId || !patientName || !doctorId || !doctorName || !consultationType || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      patientId,
      patientName,
      doctorId,
      doctorName,
      consultationType,
      date: new Date(date),
      time,
      symptoms,
      reasonForVisit,
      medicalHistory,
      currentMedications,
      urgencyLevel: urgencyLevel || 'normal',
      phoneNumber,
      status: 'Scheduled'
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: savedAppointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
};

// Get all appointments for a patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Find appointments for the patient
    const appointments = await Appointment.find({ patientId }).sort({ createdAt: -1 });

    // Categorize appointments
    const categorized = {
      upcoming: appointments.filter(apt => ['Scheduled', 'In Queue'].includes(apt.status)),
      past: appointments.filter(apt => apt.status === 'Completed'),
      cancelled: appointments.filter(apt => apt.status === 'Cancelled')
    };

    res.json({
      success: true,
      appointments: categorized
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes, outcome, cancellationReason } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (outcome) appointment.outcome = outcome;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    appointment.updatedAt = new Date();

    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    if (['Completed', 'Cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        error: 'Appointment cannot be cancelled'
      });
    }

    // Update appointment status
    appointment.status = 'Cancelled';
    appointment.cancellationReason = reason || 'Patient requested cancellation';
    appointment.updatedAt = new Date();

    const updatedAppointment = await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
};

// Delete appointment (admin only)
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment'
    });
  }
};
