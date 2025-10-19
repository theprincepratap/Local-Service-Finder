# Comprehensive Worker Registration System

## ✅ Implementation Complete

### Overview
Implemented a **complete worker registration system** with separate data storage for users and workers, comprehensive multi-step form with validation, and proper database constraints.

---

## 🎯 Key Features

### 1. **Separate User & Worker Tables**
- **User Table**: Stores basic user information for ALL users (both regular users and workers)
- **Worker Table**: Stores professional worker-specific data (linked to User via `userId`)
- Workers have entries in BOTH tables
- Regular users only have entries in User table

### 2. **Multi-Step Worker Registration Form**
#### **Step 1: Personal Information**
- Full Name (2-50 chars, required)
- Email (valid format, unique, required)
- Phone (10 digits, required)
- Password (min 6 chars, required)
- Confirm Password (must match, required)

#### **Step 2: Location Information**
- State (dropdown, required)
- City (dropdown based on state, required)
- Pincode (6 digits, required)
- Full Address (textarea, required)

#### **Step 3: Professional Information**
- Service Categories (checkboxes, min 1 required)
- Skills (dynamic add/remove, min 1 required, max 10)
- Experience in years (0-50, required)
- Price per hour ₹50-₹10,000, required)
- Service radius (1-50 km, default 10)
- Professional Bio (50-500 chars, required)

---

## 🗄️ Database Schema

### **User Model** (`User.model.js`)
```javascript
{
  name: String (required, max 50),
  email: String (required, unique, valid format),
  password: String (required, min 6, hashed),
  phone: String (required, 10 digits),
  role: Enum['user', 'worker', 'admin'] (default: 'user'),
  profileImage: String (default: 'default-avatar.jpg'),
  location: {
    type: 'Point',
    coordinates: [Number] (longitude, latitude),
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### **Worker Model** (`Worker.model.js`)
```javascript
{
  userId: ObjectId (ref: 'User', required, unique),
  skills: [String] (required, min 1),
  categories: [Enum] (required, min 1),
  experience: Number (required, min 0),
  pricePerHour: Number (required, min 0),
  serviceRadius: Number (default: 10 km),
  bio: String (max 500),
  location: GeoJSON Point,
  availability: Enum['available', 'busy', 'offline'],
  verified: Boolean (default: false),
  rating: Number (0-5, default: 0),
  totalReviews: Number (default: 0),
  totalJobs: Number (default: 0),
  completedJobs: Number (default: 0),
  totalEarnings: Number (default: 0),
  workingHours: Object (7 days with start/end/isAvailable),
  documents: {
    idProof: String,
    addressProof: String,
    certificate: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Backend Validation

### **Auth Controller** (`auth.controller.js`)

#### **Registration Endpoint**: `POST /api/auth/register`

**Validation Rules:**
1. **Email Uniqueness**: Checks if email already exists
2. **Role Validation**: Must be 'user' or 'worker'
3. **Worker-Specific Validation**:
   - `workerData` object required
   - `skills` array required (min 1)
   - `categories` array required (min 1)
   - `experience` required (≥ 0)
   - `pricePerHour` required (> 0)
   - Complete location required (city, state, pincode)

**Registration Flow:**
```javascript
1. Validate email uniqueness
2. Validate role
3. If worker, validate worker-specific fields
4. Create User record
5. If worker, create Worker profile (linked via userId)
6. Return JWT token with user data
7. Auto-redirect to appropriate dashboard
```

---

## 🎨 Frontend Implementation

### **Components:**

#### **WorkerRegistrationForm.jsx**
- **Location**: `frontend/src/components/WorkerRegistrationForm.jsx`
- **Size**: ~900 lines
- **Features**:
  - 3-step wizard with progress indicator
  - Real-time validation
  - Dynamic skill tags (add/remove)
  - Checkbox-based category selection
  - State-city dropdown cascade
  - Character counter for bio
  - Step-by-step error handling
  - Beautiful green theme

#### **Register.jsx** (Updated)
- Shows selection screen (User vs Worker)
- For users: Simple form
- For workers: Loads WorkerRegistrationForm component
- Smart routing based on role

---

## ✅ Validation Constraints

### **Step 1 Validation:**
```javascript
- Name: Required, min 2 chars, max 50 chars
- Email: Required, valid format, unique
- Phone: Required, exactly 10 digits
- Password: Required, min 6 chars
- Confirm Password: Required, must match password
```

### **Step 2 Validation:**
```javascript
- State: Required, must select from dropdown
- City: Required, must select from dropdown (based on state)
- Pincode: Required, exactly 6 digits
- Address: Required, non-empty string
```

### **Step 3 Validation:**
```javascript
- Categories: Required, min 1 selected
- Skills: Required, min 1 added, max 10 allowed
- Experience: Required, 0-50 years
- Price Per Hour: Required, ₹50-₹10,000
- Service Radius: Optional, 1-50 km (default 10)
- Bio: Required, 50-500 characters
```

---

## 🚀 Data Flow

### **Worker Registration Process:**

```
1. User selects "Register as Worker"
   ↓
2. Fills Step 1 (Personal) → Validated
   ↓
3. Fills Step 2 (Location) → Validated
   ↓
4. Fills Step 3 (Professional) → Validated
   ↓
5. Submits form with complete data
   ↓
6. Backend receives request with role='worker' + workerData
   ↓
7. Validates all fields (email unique, required fields, ranges)
   ↓
8. Creates User record in User table
   ↓
9. Creates Worker profile in Worker table (userId = user._id)
   ↓
10. Returns JWT token
   ↓
11. Frontend redirects to /worker/dashboard
```

### **Regular User Registration:**
```
1. User selects "Register as User"
   ↓
2. Fills simple form (name, email, phone, password)
   ↓
3. Submits with role='user'
   ↓
4. Backend creates User record only
   ↓
5. NO Worker profile created
   ↓
6. Redirects to /dashboard
```

---

## 📊 Database Relationships

```
User Collection
├─ _id: ObjectId
├─ role: 'user' | 'worker'
└─ ...other fields

Worker Collection
├─ _id: ObjectId
├─ userId: ObjectId → References User._id
└─ ...professional fields

Relationship: One-to-One (User ← Worker)
- Each Worker has exactly ONE User
- Users with role='worker' have a Worker profile
- Users with role='user' have NO Worker profile
```

---

## 🎯 Service Categories

Available categories for workers:
- Plumber
- Electrician
- Carpenter
- Painter
- Cleaner
- AC Repair
- Appliance Repair
- Pest Control
- Gardener
- Driver
- Moving & Packing
- Beauty & Salon
- Tutor
- Other

---

## 📍 Location Data

### **Supported States & Cities:**
- Maharashtra (Mumbai, Pune, Nagpur, Thane, Nashik, Aurangabad)
- Delhi (New Delhi, North Delhi, South Delhi, East Delhi, West Delhi)
- Karnataka (Bangalore, Mysore, Hubli, Mangalore)
- Tamil Nadu (Chennai, Coimbatore, Madurai, Tiruchirappalli)
- Gujarat (Ahmedabad, Surat, Vadodara, Rajkot)
- Uttar Pradesh (Lucknow, Kanpur, Agra, Varanasi, Noida)
- West Bengal (Kolkata, Howrah, Durgapur, Asansol)
- Rajasthan (Jaipur, Jodhpur, Kota, Bikaner, Udaipur)
- Telangana (Hyderabad, Warangal, Nizamabad)
- Haryana (Faridabad, Gurugram, Panipat, Ambala)

---

## 🔒 Security Features

1. **Password Hashing**: Bcrypt with salt (10 rounds)
2. **Email Validation**: Regex pattern matching
3. **Phone Validation**: Exactly 10 digits
4. **Unique Email**: Database-level uniqueness check
5. **SQL Injection Protection**: Mongoose schema validation
6. **XSS Protection**: Input sanitization
7. **Role-Based Access**: Proper role assignment
8. **JWT Authentication**: Secure token generation

---

## 🎨 UI/UX Features

### **Step Progress Indicator:**
- Visual progress bar
- Checkmark on completed steps
- Current step highlighted in green
- Step names below indicators

### **Form Features:**
- Icons for each input field
- Real-time validation feedback
- Error messages below fields
- Character counter for bio
- Dynamic skill tags with remove button
- State-city cascade dropdown
- Back/Continue navigation
- Loading states on submit

### **Validation Feedback:**
- Red borders on invalid fields
- Error text in red below fields
- Success checkmarks on completed steps
- Toast notifications for errors/success

---

## 🧪 Testing Instructions

### **Test Worker Registration:**
1. Go to `http://localhost:5173/register`
2. Click "Register as Worker"
3. **Step 1**: Fill personal details
   - Name: Test Worker
   - Email: testworker@example.com
   - Phone: 9876543210
   - Password: test123
   - Confirm: test123
   - Click "Continue"
4. **Step 2**: Fill location
   - State: Maharashtra
   - City: Mumbai
   - Pincode: 400001
   - Address: 123 Test Street
   - Click "Continue"
5. **Step 3**: Fill professional details
   - Select categories: Plumber, Electrician
   - Add skills: "Pipe fitting", "Electrical wiring"
   - Experience: 5
   - Price: 500
   - Bio: (Write 50+ characters about expertise)
   - Click "Complete Worker Registration"
6. Should redirect to `/worker/dashboard`

### **Verify Database:**
```javascript
// Check User collection
db.users.findOne({ email: "testworker@example.com" })
// Should have: role='worker', location data

// Check Worker collection
db.workers.findOne({ /* userId matches above user */ })
// Should have: skills, categories, experience, pricePerHour, bio, etc.
```

---

## 📝 API Request Format

### **Worker Registration Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "9876543210",
  "role": "worker",
  "location": {
    "coordinates": [0, 0],
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "workerData": {
    "skills": ["Pipe fitting", "Leak repair", "Installation"],
    "categories": ["Plumber"],
    "experience": 5,
    "pricePerHour": 500,
    "serviceRadius": 10,
    "bio": "Experienced plumber with 5+ years..."
  }
}
```

### **Response:**
```json
{
  "success": true,
  "message": "Worker registered successfully",
  "token": "JWT_TOKEN_HERE",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "worker",
      ...
    }
  }
}
```

---

## 🎯 Default Worker Settings

When a worker registers, these defaults are applied:
- **Service Radius**: 10 km
- **Availability**: 'available'
- **Verified**: false
- **Rating**: 0
- **Total Reviews**: 0
- **Total Jobs**: 0
- **Completed Jobs**: 0
- **Total Earnings**: 0
- **Working Hours**: Monday-Saturday 9 AM-6 PM, Sunday off

---

## 🎉 Feature Status: **COMPLETE & PRODUCTION-READY**

All validation constraints implemented, separate database tables working, comprehensive multi-step form with real-time validation, and proper error handling! 🚀
