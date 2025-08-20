import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Doctor from '../models/Doctor.js';
import dotenv from 'dotenv';

dotenv.config();

// Predefined doctors data
const doctorsData = [
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
    password: 'doctor123'
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
    password: 'doctor123'
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
    password: 'doctor123'
  }
];

// Hash passwords
const hashPasswords = async (doctors) => {
  const hashedDoctors = [];
  
  for (const doctor of doctors) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(doctor.password, salt);
    
    hashedDoctors.push({
      ...doctor,
      password: hashedPassword
    });
  }
  
  return hashedDoctors;
};

// Seed doctors
const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if doctors already exist
    const existingDoctors = await Doctor.find({});
    
    if (existingDoctors.length > 0) {
      console.log('👨‍⚕️ Doctors already exist in database');
      console.log(`Found ${existingDoctors.length} doctors:`);
      existingDoctors.forEach(doc => {
        console.log(`  - ${doc.id}: ${doc.name} (${doc.specialty})`);
      });
      return;
    }

    // Hash passwords
    console.log('🔒 Hashing passwords...');
    const hashedDoctors = await hashPasswords(doctorsData);

    // Insert doctors
    console.log('👨‍⚕️ Seeding doctors...');
    const insertedDoctors = await Doctor.insertMany(hashedDoctors);

    console.log('✅ Doctors seeded successfully!');
    console.log(`Inserted ${insertedDoctors.length} doctors:`);
    insertedDoctors.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.name} (${doc.specialty})`);
    });

  } catch (error) {
    console.error('❌ Error seeding doctors:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDoctors();
}

export default seedDoctors;
