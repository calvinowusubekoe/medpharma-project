import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    default: 'doctor',
    enum: ['doctor']
  },
  verified: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  consultationTime: {
    type: Number,
    default: 15,
    min: 5,
    max: 60
  },
  availability: {
    type: String,
    default: 'Available',
    enum: ['Available', 'Busy', 'Running Late', 'Offline']
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentPatient: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  todayConsultations: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
doctorSchema.methods.toJSON = function() {
  const doctor = this.toObject();
  delete doctor.password;
  return doctor;
};

export default mongoose.model('Doctor', doctorSchema);
