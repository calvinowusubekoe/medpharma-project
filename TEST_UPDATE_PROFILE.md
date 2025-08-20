# 🔧 Test Update Profile Endpoint

Step-by-step guide to test the profile update functionality.

## 🎯 **Quick Test Commands**

### **Step 1: Login and Get Token**

#### **Option A: Login as Patient**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "profile.test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "phone": "+1 (555) 123-4567"
  }'
```

#### **Option B: Login as Doctor**
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

**💡 Copy the `token` from the response for the next step!**

### **Step 2: Update Profile**

#### **Update Patient Profile**
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Updated Patient Name",
    "phone": "+1 (555) 999-8888",
    "dateOfBirth": "1995-06-15",
    "emergencyContact": "+1 (555) 111-2222"
  }'
```

#### **Update Doctor Profile**
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "availability": "Running Late"
  }'
```

## 📋 **What You Can Update**

### **Patient Profile Fields**
```json
{
  "name": "New Name",
  "phone": "+1 (555) 999-8888",
  "dateOfBirth": "1995-06-15",
  "emergencyContact": "+1 (555) 111-2222"
}
```

### **Doctor Profile Fields**
```json
{
  "availability": "Running Late"
}
```

### **⚠️ Fields You CANNOT Update**
- `email` (security)
- `password` (use separate endpoint)
- `userType` (security)
- `id` (security)

## ✅ **Expected Success Response**

### **Patient Profile Update**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "profile.test@example.com",
    "name": "Updated Patient Name",
    "userType": "patient",
    "phone": "+1 (555) 999-8888",
    "dateOfBirth": "1995-06-15",
    "emergencyContact": "+1 (555) 111-2222",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### **Doctor Profile Update**
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
    "rating": 4.9,
    "consultationTime": 15,
    "availability": "Running Late"
  }
}
```

## 🔧 **Complete Example with Real Token**

Let me show you an example with a real workflow:

### **1. Register Patient**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "phone": "+1 (555) 123-4567"
  }'
```

**Response will include a token like:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQtaGVyZSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJ1c2VyVHlwZSI6InBhdGllbnQiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTA4MTYwMH0.signature"
}
```

### **2. Update Profile with Real Token**
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV1aWQtaGVyZSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJ1c2VyVHlwZSI6InBhdGllbnQiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTY0MTA4MTYwMH0.signature" \
  -d '{
    "name": "John Smith Updated",
    "phone": "+1 (555) 999-0000",
    "emergencyContact": "+1 (555) 888-0000"
  }'
```

## 🧪 **Automated Test Script**

Run the automated test:
```bash
cd Backend
node test-update-profile.js
```

This script will:
1. ✅ Register a new patient
2. ✅ Update the patient profile
3. ✅ Login as a doctor
4. ✅ Update the doctor profile
5. ✅ Show all responses

## ❌ **Common Errors**

### **Missing Token (401)**
```json
{
  "error": "Access token required"
}
```
**Solution**: Include `Authorization: Bearer TOKEN` header

### **Invalid Token (403)**
```json
{
  "error": "Invalid or expired token"
}
```
**Solution**: Login again to get a fresh token

### **User Not Found (404)**
```json
{
  "error": "User not found"
}
```
**Solution**: Make sure the token belongs to an existing user

## 🔍 **Verify Profile Update**

After updating, you can verify the changes with:

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

This will show your current profile with the updated information.

## 🎯 **Testing Checklist**

- [ ] Patient can update name
- [ ] Patient can update phone
- [ ] Patient can update date of birth
- [ ] Patient can update emergency contact
- [ ] Doctor can update availability
- [ ] Cannot update email/password/userType
- [ ] Requires valid authentication token
- [ ] Returns updated user data

Ready to test! 🚀
