# 🧪 MedPharma API Testing Guide

Complete guide to test all API endpoints using multiple methods.

## 🚀 Quick Start

### 1. Start the Server
```bash
cd Backend
npm run dev
```
Server will run on `http://localhost:3001`

### 2. Choose Your Testing Method

## 📋 Method 1: Automated Testing Script

### Run All Tests
```bash
npm test
```

This runs the `test-endpoints.js` script that automatically tests:
- ✅ Health check
- ✅ Get doctors list
- ✅ Patient login/registration
- ✅ Doctor login
- ✅ Protected endpoints
- ✅ Queue operations
- ✅ Doctor dashboard

### Manual Script Execution
```bash
node test-endpoints.js
```

## 📋 Method 2: cURL Commands

See detailed cURL examples in `test-with-curl.md`

### Quick Test Examples

#### Health Check
```bash
curl http://localhost:3001/api/health
```

#### Patient Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"password123","userType":"patient"}'
```

#### Doctor Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.sarah@medpharma.com","doctorId":"DOC001","password":"doctor123","userType":"doctor"}'
```

## 📋 Method 3: Postman

### Import Collection
1. Open Postman
2. Import `postman-collection.json`
3. Collection includes:
   - Environment variables
   - Automatic token handling
   - Pre-configured requests
   - Test scripts

### Variables Set Automatically
- `base_url`: http://localhost:3001
- `auth_token`: Current user token
- `patient_token`: Patient-specific token
- `doctor_token`: Doctor-specific token

## 📋 Method 4: Frontend Integration Testing

Start both frontend and backend to test integration:

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend/medpharma-app
npm run dev
```

## 🔑 Test Credentials

### Predefined Doctor Accounts
```json
{
  "DOC001": {
    "email": "dr.sarah@medpharma.com",
    "password": "doctor123",
    "name": "Dr. Sarah Johnson",
    "specialty": "General Medicine"
  },
  "DOC002": {
    "email": "dr.michael@medpharma.com", 
    "password": "doctor123",
    "name": "Dr. Michael Chen",
    "specialty": "Cardiology"
  },
  "DOC003": {
    "email": "dr.emily@medpharma.com",
    "password": "doctor123", 
    "name": "Dr. Emily Rodriguez",
    "specialty": "Pediatrics"
  }
}
```

### Patient Account
- Any email will auto-register a new patient
- Use any password (minimum validation)

## 🧪 Testing Workflows

### Workflow 1: Complete Patient Journey
1. **Register/Login** as patient
2. **View doctors** list
3. **Join queue** for a doctor
4. **Check queue status** and position
5. **Receive notifications** about queue updates
6. **Leave queue** when needed

### Workflow 2: Complete Doctor Journey
1. **Login** as doctor with 3-field auth
2. **View dashboard** with queue and stats
3. **Update status** (available, running late, etc.)
4. **Manage queue** (move patients, view details)
5. **Start consultation** with next patient
6. **End consultation** with notes
7. **View consultation history**

### Workflow 3: Real-time Features Testing
1. Open **multiple browser tabs** or **Postman windows**
2. Login as **patient in one**, **doctor in another**
3. Patient joins queue, verify doctor sees update
4. Doctor updates status, verify patient sees change
5. Test **WebSocket** real-time updates

## 🔍 Expected API Responses

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Response Format
```json
{
  "error": "Descriptive error message"
}
```

### Queue Entry Response
```json
{
  "success": true,
  "queueEntry": {
    "id": "uuid-here",
    "position": 2,
    "estimatedWaitTime": 30,
    "doctorName": "Dr. Sarah Johnson",
    "joinedAt": "2024-01-01T10:00:00.000Z",
    "status": "waiting"
  }
}
```

## 📊 API Endpoints Summary

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/auth/doctors` - List all doctors

### Authentication
- `POST /api/auth/login` - Login (patients & doctors)
- `POST /api/auth/register` - Patient registration
- `GET /api/auth/me` - Current user info
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Queue Management
- `POST /api/queue/join` - Join doctor's queue
- `GET /api/queue/status/:doctorId` - Queue status
- `GET /api/queue/my-status` - Patient's position
- `DELETE /api/queue/leave/:doctorId` - Leave queue
- `POST /api/queue/move` - Move patient (doctors)
- `GET /api/queue/stats` - Queue statistics

### Consultations
- `GET /api/appointments/doctor/dashboard` - Doctor dashboard
- `POST /api/appointments/doctor/status` - Update doctor status
- `POST /api/appointments/consultation/start` - Start consultation
- `POST /api/appointments/consultation/end` - End consultation
- `GET /api/appointments/consultation/active` - Active consultation
- `GET /api/appointments/consultation/history` - History

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications/test` - Send test notification
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/settings` - Get settings

## 🐛 Common Issues & Solutions

### Issue: "Access token required"
**Solution**: Include `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Doctor not found" / "Invalid Doctor ID"
**Solution**: Use exact doctor IDs: DOC001, DOC002, DOC003

### Issue: "Email does not match"
**Solution**: Use correct email-ID pairs from test credentials

### Issue: WebSocket not connecting
**Solution**: Ensure CORS is properly configured and frontend connects to correct port

### Issue: "Patient already in queue"
**Solution**: Leave current queue before joining another

## 🎯 Testing Checklist

### Authentication ✅
- [ ] Patient can register/login
- [ ] Doctor can login with 3 fields
- [ ] Protected endpoints require token
- [ ] Invalid credentials rejected
- [ ] Logout works properly

### Queue Management ✅
- [ ] Patient can join queue
- [ ] Queue position calculated correctly
- [ ] Estimated wait time updated
- [ ] Patient can leave queue
- [ ] Doctor can view queue
- [ ] Doctor can move patients

### Consultations ✅
- [ ] Doctor can start consultation
- [ ] Consultation status tracked
- [ ] Doctor can end with notes
- [ ] History saved correctly
- [ ] Only one active consultation per doctor

### Real-time Features ✅
- [ ] WebSocket connections work
- [ ] Queue updates broadcast
- [ ] Doctor status changes sent
- [ ] Notifications delivered
- [ ] Multiple clients sync properly

### Error Handling ✅
- [ ] Validation errors return 400
- [ ] Unauthorized returns 401
- [ ] Forbidden returns 403
- [ ] Not found returns 404
- [ ] Server errors return 500

## 🔧 Debugging Tips

1. **Check Console**: Server logs show all requests
2. **Use Browser DevTools**: Network tab shows API calls
3. **Postman Console**: View raw request/response
4. **cURL Verbose**: Add `-v` flag for detailed output
5. **WebSocket Testing**: Use browser's WebSocket inspector

Run comprehensive tests with:
```bash
npm test
```

Happy testing! 🚀
