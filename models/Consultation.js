import mongoose from 'mongoose';

// Consultation Schema
const consultationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  doctorId: {
    type: String,
    required: true,
    uppercase: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  queueEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QueueEntry',
    default: null
  },
  type: {
    type: String,
    default: 'video',
    enum: ['video', 'audio', 'chat', 'in-person']
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled']
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  diagnosis: {
    type: String,
    default: ''
  },
  prescription: {
    type: String,
    default: ''
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
consultationSchema.index({ doctorId: 1, status: 1 });
consultationSchema.index({ patientId: 1, status: 1 });
consultationSchema.index({ startedAt: -1 });

export default mongoose.model('Consultation', consultationSchema);
