# API Testing with cURL

This guide shows how to test all the MedPharma API endpoints using cURL commands.

## Prerequisites

1. Start the backend server:
```bash
cd Backend
npm run dev
```

2. Server should be running on `http://localhost:3001`

## 1. Health Check (Public)

```bash
curl -X GET http://localhost:3001/api/health \
  -H "Content-Type: application/json"
```

## 2. Get All Doctors (Public)

```bash
curl -X GET http://localhost:3001/api/auth/doctors \
  -H "Content-Type: application/json"
```

## 3. Patient Registration & Login

### Register New Patient (Full Form)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "phone": "+1 (555) 123-4567",
    "dateOfBirth": "1990-01-15",
    "emergencyContact": "+1 (555) 987-6543"
  }'
```

### Login Existing Patient
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "userType": "patient"
  }'
```

**Save the token from response for authenticated requests!**

## 4. Doctor Login

### Login as Doctor (3-field authentication)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.sarah@medpharma.com",
    "doctorId": "DOC001",
    "password": "doctor123",
    "userType": "doctor"
  }'
```

**Available Doctor Accounts:**
- DOC001: dr.sarah@medpharma.com (General Medicine)
- DOC002: dr.michael@medpharma.com (Cardiology)
- DOC003: dr.emily@medpharma.com (Pediatrics)

## 5. Protected Endpoints (Replace YOUR_TOKEN)

### Get Current User Info
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Name",
    "phone": "+1234567890"
  }'
```

## 6. Queue Management (Patient Token Required)

### Join Queue
```bash
curl -X POST http://localhost:3001/api/queue/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -d '{
    "doctorId": "DOC001",
    "consultationType": "General Consultation",
    "symptoms": "Fever and headache",
    "urgencyLevel": "Normal",
    "preferredTime": "Morning"
  }'
```

### Get Queue Status
```bash
curl -X GET http://localhost:3001/api/queue/status/DOC001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

### Get Patient's Current Queue Status
```bash
curl -X GET http://localhost:3001/api/queue/my-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

### Leave Queue
```bash
curl -X DELETE http://localhost:3001/api/queue/leave/DOC001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

## 7. Doctor Dashboard (Doctor Token Required)

### Get Doctor Dashboard
```bash
curl -X GET http://localhost:3001/api/appointments/doctor/dashboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

### Update Doctor Status
```bash
curl -X POST http://localhost:3001/api/appointments/doctor/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "availability": "Running Late",
    "delayMinutes": 15
  }'
```

### Move Patient in Queue
```bash
curl -X POST http://localhost:3001/api/queue/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "doctorId": "DOC001",
    "entryId": "QUEUE_ENTRY_ID",
    "direction": "up"
  }'
```

## 8. Consultation Management (Doctor Token Required)

### Start Consultation
```bash
curl -X POST http://localhost:3001/api/appointments/consultation/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "patientId": "QUEUE_ENTRY_ID"
  }'
```

### End Consultation
```bash
curl -X POST http://localhost:3001/api/appointments/consultation/end \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "patientId": "QUEUE_ENTRY_ID",
    "notes": "Patient consultation completed successfully",
    "diagnosis": "Common cold",
    "prescription": "Rest and fluids",
    "followUpRequired": false
  }'
```

### Get Active Consultation
```bash
curl -X GET http://localhost:3001/api/appointments/consultation/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

### Get Consultation History
```bash
curl -X GET http://localhost:3001/api/appointments/consultation/history?period=today \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

## 9. Notification Management

### Get Notifications
```bash
curl -X GET http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Test Notification
```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:3001/api/notifications/NOTIFICATION_ID/read \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Notification Settings
```bash
curl -X GET http://localhost:3001/api/notifications/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 10. Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Workflow

1. **Start Server**: `npm run dev`
2. **Test Public Endpoints**: Health check, get doctors
3. **Authenticate**: Login as patient and doctor, save tokens
4. **Test Patient Flow**: Join queue, check status, leave queue
5. **Test Doctor Flow**: Get dashboard, manage queue, start/end consultations
6. **Test Real-time**: Use multiple terminals to simulate real-time updates

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
