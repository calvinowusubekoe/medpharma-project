import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
const users = new Map();
const doctors = new Map();

// Initialize predefined doctors
const initializeDoctors = () => {
  const predefinedDoctors = [
    {
      id: 'DOC001',
      email: 'dr.sarah@medpharma.com',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Medicine',
      licenseNumber: 'LIC001234',
      verified: true,
      rating: 4.9,
      consultationTime: 15,
      availability: 'Available',
      password: '$2b$10$vQQM7GnYudLvU1M4CGrguObeVBIU6mGa/iHyRt2Sl2AcHOUOz.RGK', // doctor123
      isOnline: false,
      currentPatient: null,
      todayConsultations: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'DOC002',
      email: 'dr.michael@medpharma.com',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      licenseNumber: 'LIC002345',
      verified: true,
      rating: 4.8,
      consultationTime: 20,
      availability: 'Available',
      password: '$2b$10$vQQM7GnYudLvU1M4CGrguObeVBIU6mGa/iHyRt2Sl2AcHOUOz.RGK', // doctor123
      isOnline: false,
      currentPatient: null,
      todayConsultations: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'DOC003',
      email: 'dr.emily@medpharma.com',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      licenseNumber: 'LIC003456',
      verified: true,
      rating: 4.9,
      consultationTime: 18,
      availability: 'Available',
      password: '$2b$10$vQQM7GnYudLvU1M4CGrguObeVBIU6mGa/iHyRt2Sl2AcHOUOz.RGK', // doctor123
      isOnline: false,
      currentPatient: null,
      todayConsultations: 0,
      createdAt: new Date().toISOString()
    }
  ];

  predefinedDoctors.forEach(doctor => {
    doctors.set(doctor.id, doctor);
  });
};

// User Model
export const User = {
  // Create new patient
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      id: uuidv4(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      userType: 'patient',
      phone: userData.phone || '',
      dateOfBirth: userData.dateOfBirth || '',
      emergencyContact: userData.emergencyContact || '',
      createdAt: new Date().toISOString(),
      consultations: []
    };

    users.set(newUser.id, newUser);
    return newUser;
  },

  // Find user by email
  findByEmail(email) {
    return Array.from(users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Find user by ID
  findById(id) {
    return users.get(id);
  },

  // Update user
  update(id, updateData) {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updateData };
    users.set(id, updatedUser);
    return updatedUser;
  },

  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Get all users (admin only)
  getAll() {
    return Array.from(users.values()).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt
    }));
  }
};

// Doctor Model
export const Doctor = {
  // Initialize doctors
  initialize() {
    initializeDoctors();
  },

  // Find doctor by ID
  findById(id) {
    return doctors.get(id);
  },

  // Find doctor by email
  findByEmail(email) {
    return Array.from(doctors.values()).find(d => d.email.toLowerCase() === email.toLowerCase());
  },

  // Get all doctors
  getAll() {
    return Array.from(doctors.values()).map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating,
      consultationTime: doctor.consultationTime,
      availability: doctor.availability,
      isOnline: doctor.isOnline,
      verified: doctor.verified
    }));
  },

  // Update doctor status
  updateStatus(id, statusData) {
    const doctor = doctors.get(id);
    if (!doctor) return null;

    if (statusData.availability) {
      doctor.availability = statusData.availability;
    }
    if (statusData.isOnline !== undefined) {
      doctor.isOnline = statusData.isOnline;
    }
    if (statusData.currentPatient !== undefined) {
      doctor.currentPatient = statusData.currentPatient;
    }
    if (statusData.todayConsultations !== undefined) {
      doctor.todayConsultations = statusData.todayConsultations;
    }

    doctors.set(id, doctor);
    return doctor;
  },

  // Verify doctor password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Get doctor with queue count
  getWithQueueCount(id, queueLength) {
    const doctor = doctors.get(id);
    if (!doctor) return null;

    return {
      ...doctor,
      currentQueueLength: queueLength || 0,
      password: undefined // Don't expose password
    };
  }
};

// Initialize doctors when module loads
Doctor.initialize();

export default { User, Doctor };
