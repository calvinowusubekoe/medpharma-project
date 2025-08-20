import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Queue', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  symptoms: String,
  reasonForVisit: String,
  medicalHistory: String,
  currentMedications: String,
  urgencyLevel: {
    type: String,
    enum: ['low', 'normal', 'high', 'emergency'],
    default: 'normal'
  },
  phoneNumber: String,
  notes: String,
  outcome: String,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
