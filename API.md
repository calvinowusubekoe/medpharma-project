# MedPharma Backend API Documentation

## Overview

The MedPharma Backend API provides comprehensive endpoints for managing virtual medical consultations, real-time queue management, and secure authentication for both patients and doctors.

## Base URL
```
http://localhost:3001/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication Endpoints

#### POST /auth/login
Login for both patients and doctors.

**Request Body:**
```json
{
  "email": "dr.sarah@medpharma.com",
  "doctorId": "DOC001",  // Required for doctors only
  "password": "doctor123",
  "userType": "doctor"   // "doctor" or "patient"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "DOC001",
    "email": "dr.sarah@medpharma.com",
    "name": "Dr. Sarah Johnson",
    "specialty": "General Medicine",
    "userType": "doctor",
    "verified": true,
    "rating": 4.9
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "doctor"
}
```

#### POST /auth/register
Register new patient accounts (doctors cannot register via API).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "emergencyContact": "+1234567891"
}
```

#### GET /auth/me
Get current user information (requires authentication).

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "userType": "patient",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "emergencyContact": "+1234567891",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### 👨‍⚕️ Doctor Management

#### GET /doctors
Get list of available doctors.

**Response:**
```json
[
  {
    "id": "DOC001",
    "name": "Dr. Sarah Johnson",
    "specialty": "General Medicine",
    "rating": 4.9,
    "consultationTime": 15,
    "availability": "Available",
    "isOnline": true,
    "currentQueueLength": 3
  }
]
```

#### GET /doctor/dashboard
Get doctor dashboard data (doctors only).

**Response:**
```json
{
  "doctor": {
    "id": "DOC001",
    "name": "Dr. Sarah Johnson",
    "specialty": "General Medicine",
    "availability": "Available",
    "isOnline": true,
    "todayConsultations": 5
  },
  "queue": [
    {
      "id": "queue-entry-id",
      "patientName": "John Doe",
      "consultationType": "General Consultation",
      "symptoms": "Headache and fever",
      "urgencyLevel": "Normal",
      "joinedAt": "2023-01-01T10:00:00.000Z",
      "position": 1,
      "status": "waiting"
    }
  ],
  "stats": {
    "totalPatients": 3,
    "waitingPatients": 2,
    "currentPatient": null
  }
}
```

#### POST /doctor/status
Update doctor availability status (doctors only).

**Request Body:**
```json
{
  "availability": "Running Late",
  "delayMinutes": 15
}
```

#### POST /doctor/consultation/start
Start consultation with a patient (doctors only).

**Request Body:**
```json
{
  "patientId": "queue-entry-id"
}
```

**Response:**
```json
{
  "success": true,
  "consultation": {
    "id": "consultation-id",
    "doctorId": "DOC001",
    "patientId": "patient-id",
    "startedAt": "2023-01-01T10:00:00.000Z",
    "status": "active"
  }
}
```

#### POST /doctor/consultation/end
End consultation with a patient (doctors only).

**Request Body:**
```json
{
  "patientId": "queue-entry-id",
  "notes": "Consultation notes and recommendations"
}
```

### 📋 Queue Management

#### POST /queue/join
Join a doctor's consultation queue (patients only).

**Request Body:**
```json
{
  "doctorId": "DOC001",
  "consultationType": "General Consultation",
  "symptoms": "Headache and fever for 2 days",
  "urgencyLevel": "Normal",
  "preferredTime": "Morning"
}
```

**Response:**
```json
{
  "success": true,
  "queueEntry": {
    "id": "queue-entry-id",
    "position": 3,
    "estimatedWaitTime": 30,
    "doctorName": "Dr. Sarah Johnson",
    "joinedAt": "2023-01-01T10:00:00.000Z",
    "status": "waiting"
  }
}
```

#### GET /queue/status/:doctorId
Get queue status for a specific doctor.

**For Patients:**
```json
{
  "position": 2,
  "estimatedWaitTime": 15,
  "status": "waiting",
  "doctorName": "Dr. Sarah Johnson",
  "joinedAt": "2023-01-01T10:00:00.000Z",
  "queueLength": 5
}
```

**For Doctors:**
```json
{
  "queue": [
    {
      "id": "queue-entry-id",
      "patientName": "John Doe",
      "consultationType": "General Consultation",
      "symptoms": "Headache and fever",
      "urgencyLevel": "Normal",
      "joinedAt": "2023-01-01T10:00:00.000Z",
      "position": 1,
      "estimatedWaitTime": 0,
      "status": "waiting"
    }
  ],
  "totalPatients": 3
}
```

### 🔔 Real-time WebSocket Events

The API supports real-time communication via WebSocket. Connect to the same port as the HTTP server.

#### Client Events (Send to Server)

**joinRoom** - Join specific room for updates
```json
{
  "doctorId": "DOC001",  // For doctor-specific updates
  "patientId": "patient-id"  // For patient-specific updates
}
```

**doctorOnline** - Notify when doctor comes online
```json
{
  "doctorId": "DOC001"
}
```

**doctorOffline** - Notify when doctor goes offline
```json
{
  "doctorId": "DOC001"
}
```

#### Server Events (Receive from Server)

**queueUpdate** - Queue position changes
```json
{
  "doctorId": "DOC001",
  "queue": [
    {
      "id": "queue-entry-id",
      "position": 1,
      "estimatedWaitTime": 0,
      "status": "ready"
    }
  ]
}
```

**newPatient** - New patient joined queue (for doctors)
```json
{
  "doctorId": "DOC001",
  "patient": {
    "id": "queue-entry-id",
    "patientName": "John Doe",
    "consultationType": "General Consultation",
    "symptoms": "Headache and fever"
  }
}
```

**doctorStatusUpdate** - Doctor availability changed
```json
{
  "doctorId": "DOC001",
  "availability": "Running Late",
  "delayMinutes": 15,
  "isOnline": true
}
```

**consultationStarted** - Consultation began (for patients)
```json
{
  "patientId": "patient-id",
  "doctorName": "Dr. Sarah Johnson"
}
```

**nextPatientReady** - Next patient can join consultation
```json
{
  "patientId": "patient-id",
  "doctorName": "Dr. Sarah Johnson"
}
```

### 🩺 System Health

#### GET /health
Get system health status and metrics.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-01-01T10:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1089024,
    "arrayBuffers": 26024
  },
  "activeConnections": 12
}
```

## Error Responses

All endpoints may return these standard error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Predefined Test Data

### Doctor Accounts
- **DOC001**: dr.sarah@medpharma.com / doctor123 (General Medicine)
- **DOC002**: dr.michael@medpharma.com / doctor123 (Cardiology)
- **DOC003**: dr.emily@medpharma.com / doctor123 (Pediatrics)

### Usage Examples

#### 1. Doctor Login and Dashboard Access
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.sarah@medpharma.com",
    "doctorId": "DOC001",
    "password": "doctor123",
    "userType": "doctor"
  }'

# Use returned token for subsequent requests
curl -X GET http://localhost:3001/api/doctor/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Patient Registration and Queue Joining
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Join queue
curl -X POST http://localhost:3001/api/queue/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC001",
    "consultationType": "General Consultation",
    "symptoms": "Headache and fever"
  }'
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Queue operations**: 10 requests per minute per user
- **Dashboard updates**: 30 requests per minute per user
- **General endpoints**: 100 requests per minute per IP

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 10 rounds
- **CORS Protection**: Configurable origin restrictions
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Secure error messages without data leaks

## Data Storage

Currently uses in-memory storage for development. For production deployment, integrate with:
- **MongoDB**: User data and consultation records
- **Redis**: Session management and real-time data
- **File Storage**: Medical documents and images

## Development Setup

1. Install dependencies: `npm install`
2. Copy configuration: `cp config.example.env .env`
3. Start development server: `npm run dev`
4. API will be available at: `http://localhost:3001`

## Production Considerations

- Set strong JWT secret in environment variables
- Configure proper CORS origins
- Set up database connections
- Implement proper logging and monitoring
- Add HTTPS/SSL certificates
- Configure reverse proxy (nginx)
- Set up proper error tracking and analytics
