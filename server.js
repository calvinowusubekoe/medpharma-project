import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/authRoute.js';
import queueRoutes from './routes/queueRoute.js';
import appointmentRoutes from './routes/appointmentRoute.js';
import notificationRoutes from './routes/notificationRoute.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://medpharma-project.onrender.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});


// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://medpharma-project.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
app.use(express.json());
app.use(morgan('combined'));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeConnections: io.engine.clientsCount
  });
});

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', (data) => {
    if (data.doctorId) {
      socket.join(`doctor-${data.doctorId}`);
    }
    if (data.patientId) {
      socket.join(`patient-${data.patientId}`);
    }
  });

  socket.on('doctorOnline', (data) => {
    socket.broadcast.emit('doctorStatusUpdate', {
      doctorId: data.doctorId,
      isOnline: true
    });
  });

  socket.on('doctorOffline', (data) => {
    socket.broadcast.emit('doctorStatusUpdate', {
      doctorId: data.doctorId,
      isOnline: false
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// MongoDB connection (required)

const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Database Connected'))
  .catch((err) => console.error('❌ Database Connection Error:', err));

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});