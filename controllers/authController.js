import jwt from 'jsonwebtoken';
import { User, Doctor } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medpharma-super-secret-jwt-key-2024-development-only';

// Utility function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.userType,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, doctorId, password, userType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (userType === 'doctor') {
      // Doctor login with three-field authentication
      if (!doctorId) {
        return res.status(400).json({ error: 'Doctor ID is required' });
      }

      const doctor = Doctor.findById(doctorId.toUpperCase());
      if (!doctor) {
        return res.status(404).json({ error: 'Invalid Doctor ID. Please contact administration.' });
      }

      if (doctor.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ error: 'Email does not match the registered email for this Doctor ID' });
      }

      const isValidPassword = await Doctor.verifyPassword(password, doctor.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Update doctor online status
      Doctor.updateStatus(doctor.id, { 
        isOnline: true, 
        lastLogin: new Date().toISOString() 
      });

      const token = generateToken({
        id: doctor.id,
        email: doctor.email,
        userType: 'doctor',
        name: doctor.name
      });

      res.json({
        success: true,
        user: {
          id: doctor.id,
          email: doctor.email,
          name: doctor.name,
          specialty: doctor.specialty,
          userType: 'doctor',
          verified: doctor.verified,
          rating: doctor.rating,
          consultationTime: doctor.consultationTime,
          availability: doctor.availability
        },
        token,
        userType: 'doctor'
      });

    } else {
      // Patient login only (no auto-registration in login endpoint)
      const existingUser = User.findByEmail(email);
      
      if (!existingUser) {
        return res.status(404).json({ 
          error: 'No account found with this email. Please register first.' 
        });
      }

      // Existing patient login
      const isValidPassword = await User.verifyPassword(password, existingUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = generateToken(existingUser);
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          userType: 'patient',
          phone: existingUser.phone,
          dateOfBirth: existingUser.dateOfBirth,
          emergencyContact: existingUser.emergencyContact,
          createdAt: existingUser.createdAt
        },
        token,
        userType: 'patient'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register controller (for patients only)
export const register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      confirmPassword,
      phone, 
      dateOfBirth, 
      emergencyContact 
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        error: 'Full Name, Email, Password, and Phone Number are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Password and Confirm Password do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address' 
      });
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Please enter a valid phone number' 
      });
    }

    // Check if patient already exists
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new patient
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      dateOfBirth: dateOfBirth || '',
      emergencyContact: emergencyContact || ''
    });

    const token = generateToken(newUser);

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        userType: 'patient',
        phone: newUser.phone,
        dateOfBirth: newUser.dateOfBirth,
        emergencyContact: newUser.emergencyContact,
        createdAt: newUser.createdAt
      },
      token,
      userType: 'patient'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user info
export const getCurrentUser = (req, res) => {
  try {
    if (req.user.userType === 'doctor') {
      const doctor = Doctor.findById(req.user.id);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      res.json({
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
        userType: 'doctor',
        verified: doctor.verified,
        rating: doctor.rating,
        consultationTime: doctor.consultationTime,
        availability: doctor.availability
      });
    } else {
      const user = User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: 'patient',
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData.userType;
    delete updateData.id;

    if (req.user.userType === 'doctor') {
      const updatedDoctor = Doctor.updateStatus(userId, updateData);
      if (!updatedDoctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      res.json({
        success: true,
        user: {
          id: updatedDoctor.id,
          email: updatedDoctor.email,
          name: updatedDoctor.name,
          specialty: updatedDoctor.specialty,
          userType: 'doctor',
          verified: updatedDoctor.verified,
          rating: updatedDoctor.rating,
          consultationTime: updatedDoctor.consultationTime,
          availability: updatedDoctor.availability
        }
      });
    } else {
      const updatedUser = User.update(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          userType: 'patient',
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.dateOfBirth,
          emergencyContact: updatedUser.emergencyContact,
          createdAt: updatedUser.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout controller (optional - mainly handled on frontend)
export const logout = (req, res) => {
  try {
    // If doctor, update online status
    if (req.user.userType === 'doctor') {
      Doctor.updateStatus(req.user.id, { isOnline: false });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all doctors (public endpoint)
export const getDoctors = (req, res) => {
  try {
    const doctors = Doctor.getAll();
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  login,
  register,
  getCurrentUser,
  updateProfile,
  logout,
  getDoctors
};
