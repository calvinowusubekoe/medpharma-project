# 👤 Patient Registration Guide

Complete guide for patient registration using all form fields.

## 📝 Registration JSON Format

### **Required Fields**

```json
{
  "name": "John Smith",
  "email": "john@example.com", 
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "+1 (555) 123-4567"
}
```

### **Complete Registration with Optional Fields**

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "password123", 
  "confirmPassword": "password123",
  "phone": "+1 (555) 123-4567",
  "dateOfBirth": "1990-01-15",
  "emergencyContact": "+1 (555) 987-6543"
}
```

## 🔧 **Field Validation**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ Yes | Not empty, trimmed |
| `email` | string | ✅ Yes | Valid email format, lowercase |
| `password` | string | ✅ Yes | Minimum 6 characters |
| `confirmPassword` | string | ✅ Yes | Must match password |
| `phone` | string | ✅ Yes | Valid phone format |
| `dateOfBirth` | string | ❌ Optional | YYYY-MM-DD format |
| `emergencyContact` | string | ❌ Optional | Valid phone format |

## 🌐 **API Endpoints**

### **Registration Endpoint**
```
POST /api/auth/register
Content-Type: application/json
```

### **Login Endpoint**
```
POST /api/auth/login
Content-Type: application/json
```

## 📋 **cURL Examples**

### **Register New Patient**
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

### **Login Existing Patient**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "userType": "patient"
  }'
```

## ✅ **Success Response**

### **Registration Success (200)**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Smith",
    "userType": "patient",
    "phone": "+1 (555) 123-4567",
    "dateOfBirth": "1990-01-15",
    "emergencyContact": "+1 (555) 987-6543",
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "patient"
}
```

### **Login Success (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Smith",
    "userType": "patient",
    "phone": "+1 (555) 123-4567",
    "dateOfBirth": "1990-01-15",
    "emergencyContact": "+1 (555) 987-6543",
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "patient"
}
```

## ❌ **Error Responses**

### **Validation Errors (400)**

#### **Missing Required Fields**
```json
{
  "error": "Full Name, Email, Password, and Phone Number are required"
}
```

#### **Password Mismatch**
```json
{
  "error": "Password and Confirm Password do not match"
}
```

#### **Password Too Short**
```json
{
  "error": "Password must be at least 6 characters long"
}
```

#### **Invalid Email**
```json
{
  "error": "Please enter a valid email address"
}
```

#### **Invalid Phone**
```json
{
  "error": "Please enter a valid phone number"
}
```

#### **Email Already Exists**
```json
{
  "error": "User already exists with this email"
}
```

### **Login Errors**

#### **Account Not Found (404)**
```json
{
  "error": "No account found with this email. Please register first."
}
```

#### **Invalid Password (401)**
```json
{
  "error": "Invalid password"
}
```

## 🔄 **Registration Flow**

### **Step 1: Registration**
1. Patient fills out complete form
2. Frontend validates all fields
3. Frontend sends POST to `/api/auth/register`
4. Backend validates and creates account
5. Backend returns user data + JWT token

### **Step 2: Login (Future Sessions)**
1. Patient enters email/password
2. Frontend sends POST to `/api/auth/login`
3. Backend validates credentials
4. Backend returns user data + JWT token

### **Step 3: Authenticated Requests**
1. Include token in Authorization header
2. `Authorization: Bearer YOUR_JWT_TOKEN`
3. Access protected endpoints

## 🎯 **Form Field Mapping**

### **Frontend Form → Backend JSON**

| Form Field | JSON Key | Example |
|------------|----------|---------|
| Full Name | `name` | "John Smith" |
| Email Address | `email` | "john@example.com" |
| Password | `password` | "password123" |
| Confirm Password | `confirmPassword` | "password123" |
| Phone Number | `phone` | "+1 (555) 123-4567" |
| Date of Birth | `dateOfBirth` | "1990-01-15" |
| Emergency Contact | `emergencyContact` | "+1 (555) 987-6543" |

## 📱 **Phone Number Formats Accepted**

- `+1 (555) 123-4567`
- `+1-555-123-4567`
- `+15551234567`
- `555-123-4567`
- `(555) 123-4567`
- `555 123 4567`

## 📅 **Date Format**

- **Required Format**: `YYYY-MM-DD`
- **Example**: `1990-01-15` (January 15, 1990)
- **HTML Input Type**: `date`

## 🔐 **Security Features**

- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **Email Validation**: Regex pattern matching
- ✅ **Phone Validation**: International format support
- ✅ **Input Sanitization**: Trim whitespace
- ✅ **Case Normalization**: Lowercase emails
- ✅ **JWT Tokens**: Secure authentication
- ✅ **Duplicate Prevention**: Email uniqueness check

## 🧪 **Testing the Registration**

### **Test with Automated Script**
```bash
cd Backend
npm test
```

### **Test with cURL**
```bash
# Register new patient
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "phone": "+1234567890"
  }'

# Login patient  
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "userType": "patient"
  }'
```

### **Test with Postman**
1. Import `postman-collection.json`
2. Use "Patient Registration" request
3. Use "Patient Login" request
4. Tokens automatically saved to variables

## 💡 **Integration Tips**

### **Frontend Integration**
```javascript
// Registration API call
const registerPatient = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      emergencyContact: formData.emergencyContact
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token and redirect
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  } else {
    // Show error message
    console.error(data.error);
  }
};
```

The patient registration now supports all the form fields from your frontend! 🎉
