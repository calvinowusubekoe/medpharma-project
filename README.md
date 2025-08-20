# MedPharma Backend API

A modern Node.js/Express backend API with ES6 modules and WebSocket support for real-time queue management in MedPharma's virtual consultation system.

## 🏗️ Project Structure

```
Backend/
├── controllers/           # Request handlers and business logic
│   ├── doctorController.js    # Doctor-related operations
│   └── queueController.js     # Queue management operations
├── models/               # Data models and schemas
│   ├── Doctor.js             # Doctor model
│   ├── Patient.js            # Patient model
│   └── Queue.js              # Queue model with business logic
├── routes/               # API route definitions
│   ├── doctorRoutes.js       # Doctor API endpoints
│   ├── queueRoutes.js        # Queue API endpoints
│   └── index.js              # Main router
├── services/             # Business logic and utilities
│   ├── queueSimulation.js    # Queue progression simulation
│   └── socketService.js      # WebSocket connection management
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚀 Quick Start

**Requirements:**
- Node.js 14+ (ES6 modules support)
- npm or yarn

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 📡 API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/available` - Get available doctors only
- `GET /api/doctors/:name` - Get doctor by name

### Queue Management
- `POST /api/queue/join` - Join a doctor's queue
- `GET /api/queue/status/:doctorName/:patientId` - Get patient's queue status
- `POST /api/queue/leave` - Leave a doctor's queue
- `GET /api/queue/:doctorName` - Get queue information for a specific doctor
- `GET /api/queue/stats/all` - Get statistics for all queues

### Health Check
- `GET /api/health` - Server health and status information

## 🔄 WebSocket Events

### Client → Server
- `joinQueue` - Join a specific doctor's queue room
- `leaveQueue` - Leave a specific doctor's queue room
- `requestStatusUpdate` - Request real-time status update

### Server → Client
- `queueUpdate` - Queue length or status changed
- `doctorStatusUpdate` - Doctor's late status changed
- `patientReady` - Patient's turn for consultation
- `queueJoined` - Confirmation of joining queue room
- `queueLeft` - Confirmation of leaving queue room

## 🏥 Available Doctors

1. **Dr. Sarah Johnson** - General Medicine
2. **Dr. Michael Chen** - Cardiology
3. **Dr. Emily Rodriguez** - Pediatrics (Currently Unavailable)
4. **Dr. David Thompson** - Dermatology

## 📊 Data Models

### Patient
```javascript
{
  patientId: "uuid",
  patientName: "string",
  doctorName: "string",
  consultationType: "string",
  phoneNumber: "string",
  symptoms: "string",
  joinedAt: "ISO string"
}
```

### Queue Status
```javascript
{
  position: "number",
  estimatedWaitTime: "number (minutes)",
  isLate: "boolean",
  isReady: "boolean",
  queueLength: "number",
  currentPatient: "string|null",
  doctorName: "string",
  consultationType: "string"
}
```

## 🔧 Features

- **ES6 Modules** - Modern JavaScript import/export syntax
- **Real-time Queue Updates** - WebSocket-based live updates
- **Queue Management** - Join, leave, and monitor queue status
- **Doctor Availability** - Real-time doctor status tracking
- **Consultation Simulation** - Automated queue progression
- **Error Handling** - Comprehensive error responses
- **Health Monitoring** - Server health checks
- **CORS Support** - Cross-origin resource sharing enabled
- **Graceful Shutdown** - Proper cleanup on server termination

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restarts on file changes.

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

## 📝 API Usage Examples

### Join Queue
```javascript
POST /api/queue/join
{
  "patientName": "John Doe",
  "doctorName": "Dr. Sarah Johnson",
  "consultationType": "General Consultation",
  "phoneNumber": "555-0123",
  "symptoms": "Headache and fever"
}
```

### Get Queue Status
```javascript
GET /api/queue/status/Dr. Sarah Johnson/patient-uuid-here
```

### WebSocket Connection
```javascript
const socket = io('http://localhost:3001');

socket.emit('joinQueue', { doctorName: 'Dr. Sarah Johnson' });

socket.on('queueUpdate', (data) => {
  console.log('Queue updated:', data);
});
```

## 🔮 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- Doctor dashboard for queue management
- Advanced queue algorithms
- SMS/Email notifications
- Video consultation integration
- Analytics and reporting
- Rate limiting and security enhancements