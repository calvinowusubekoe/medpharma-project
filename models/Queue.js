import mongoose from 'mongoose';

// Queue Entry Schema
const queueEntrySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  doctorId: {
    type: String,
    required: true,
    uppercase: true
  },
  doctorName: {
    type: String,
    required: true
  },
  consultationType: {
    type: String,
    default: 'General Consultation',
    enum: ['General Consultation', 'Follow-up', 'Emergency', 'Specialist Consultation']
  },
  symptoms: {
    type: String,
    default: ''
  },
  urgencyLevel: {
    type: String,
    default: 'Normal',
    enum: ['Low', 'Normal', 'High', 'Emergency']
  },
  preferredTime: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    required: true
  },
  estimatedWaitTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'waiting',
    enum: ['waiting', 'ready', 'in-consultation', 'completed', 'cancelled']
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
queueEntrySchema.index({ doctorId: 1, position: 1 });
queueEntrySchema.index({ patientId: 1, doctorId: 1 });

export default mongoose.model('QueueEntry', queueEntrySchema);
