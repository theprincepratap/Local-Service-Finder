# 🎯 WORKER LOCATION TESTING GUIDE - Step by Step

## 🧪 Test 1: Worker Registration with Live Location

### **Step-by-Step Instructions:**

```
1. Open Browser
   └─> Navigate to: http://localhost:5173/register

2. Select Registration Type
   └─> Click: "Register as Worker" button
   └─> Should see: Green-themed registration form

3. STEP 1: Personal Information
   ├─> Name: "Test Worker"
   ├─> Email: "testworker@example.com"
   ├─> Phone: "9876543210"
   ├─> Password: "test123"
   └─> Confirm Password: "test123"
   └─> Click: "Continue to Location Details"

4. STEP 2: Location Information ⭐ IMPORTANT
   ├─> State: Select "Karnataka"
   ├─> City: Select "Bangalore"
   ├─> Pincode: "560001"
   ├─> Address: "123 Test Street, Test Area"
   └─> 📍 LIVE LOCATION CAPTURE:
       ├─> Click: "Click to capture your current location"
       ├─> Browser shows permission prompt
       ├─> Click: "Allow"
       ├─> Wait 2-5 seconds
       ├─> ✅ Should see:
       │   ├─ Green checkmark icon
       │   ├─ "Location captured" text
       │   ├─ "Lat: XX.XXXXXX, Lng: YY.YYYYYY"
       │   └─ Detected Address box
       └─> Click: "Continue to Professional Details"

5. STEP 3: Professional Information
   ├─> Service Categories: Check "Plumber" and "Electrician"
   ├─> Skills: 
   │   ├─ Type "Pipe fitting" → Press Enter
   │   ├─ Type "Electrical wiring" → Press Enter
   │   └─ Type "Installation" → Press Enter
   ├─> Experience: "5"
   ├─> Price per Hour: "500"
   ├─> Service Radius: "10"
   └─> Bio: "Experienced plumber and electrician with 5+ years of expertise..."
   └─> Click: "Complete Worker Registration"

6. Success!
   └─> Should redirect to: /worker/dashboard
   └─> Toast: "Worker registration successful!"

7. ✅ VERIFY IN MONGODB:
   
   A) Check User Collection:
      db.users.findOne({ email: "testworker@example.com" })
      
      Expected Result:
      {
        _id: ObjectId(...),
        name: "Test Worker",
        email: "testworker@example.com",
        role: "worker", ← IMPORTANT
        location: {
          type: "Point",
          coordinates: [77.XXXX, 12.XXXX], ← REAL COORDINATES!
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          address: "123 Test Street, Test Area"
        },
        ...
      }
   
   B) Check Worker Collection:
      db.workers.findOne({ /* userId from above User */ })
      
      Expected Result:
      {
        _id: ObjectId(...),
        userId: ObjectId(...), ← References User._id
        skills: ["Pipe fitting", "Electrical wiring", "Installation"],
        categories: ["Plumber", "Electrician"],
        experience: 5,
        pricePerHour: 500,
        serviceRadius: 10,
        bio: "Experienced plumber...",
        location: { ← SAME AS USER
          type: "Point",
          coordinates: [77.XXXX, 12.XXXX]
        },
        availability: "available",
        verified: false,
        workingHours: {...},
        ...
      }

8. Backend Console Check:
   ✅ Worker profile created: [ObjectId]
   ✅ Worker registered: [ObjectId]
   POST /api/auth/register 201
```

---

## 🧪 Test 2: User Registration with Optional Location

### **Step-by-Step Instructions:**

```
1. Navigate to: http://localhost:5173/register

2. Select: "Register as User"
   └─> Should see: Blue-themed simple form

3. Fill Form:
   ├─> Name: "Test User"
   ├─> Email: "testuser@example.com"
   ├─> Phone: "9876543211"
   ├─> Password: "test123"
   └─> Confirm Password: "test123"

4. 📍 OPTIONAL Location Capture:
   ├─> Click: "Click to capture your current location"
   ├─> Allow permission
   └─> ✅ Location captured (green state)
   
   OR
   
   └─> ℹ️ Skip location capture (will show info toast)

5. Click: "Create Account"

6. Success!
   └─> Should redirect to: /dashboard
   └─> Toast: "Registration successful!"

7. ✅ VERIFY IN MONGODB:
   
   A) Check User Collection:
      db.users.findOne({ email: "testuser@example.com" })
      
      Expected Result:
      {
        _id: ObjectId(...),
        name: "Test User",
        email: "testuser@example.com",
        role: "user", ← NOT "worker"
        location: {
          type: "Point",
          coordinates: [77.XXXX, 12.XXXX] or [0, 0] if skipped
        },
        ...
      }
   
   B) Check Worker Collection:
      db.workers.findOne({ /* userId from above */ })
      
      Expected Result:
      null ← NO WORKER DOCUMENT! This is correct!

8. Backend Console:
   ✅ User registered: [ObjectId]
   POST /api/auth/register 201
```

---

## 🧪 Test 3: Error Handling - Location Permission Denied

### **Test Steps:**

```
1. Go to Worker Registration Step 2

2. Click: "Click to capture your current location"

3. Browser Permission Prompt:
   └─> Click: "Block" or "Deny"

4. Expected Result:
   ├─> Button turns RED
   ├─> Icon: ⚠️ (alert)
   ├─> Error message: "Location access denied. Please enable location permissions."
   └─> Red error box with details

5. Try to Continue to Step 3:
   └─> Should be BLOCKED with error:
       "Please capture your live location"

6. To Fix:
   ├─> Browser settings → Site permissions → Location → Allow
   ├─> Refresh page
   └─> Try again
```

---

## 🎯 Expected Results Summary

| Test Case | User Table | Worker Table | Location | Redirect |
|-----------|------------|--------------|----------|----------|
| Worker Registration | ✅ Created (role=worker) | ✅ Created | Real GPS | /worker/dashboard |
| User Registration | ✅ Created (role=user) | ❌ Not created | Optional | /dashboard |
| Permission Denied | ❌ Not created | ❌ Not created | Blocked | Registration page |

---

## ✅ Success Checklist

After testing, verify:

- [ ] Worker registration creates both User and Worker documents
- [ ] User registration creates only User document
- [ ] Workers have real GPS coordinates (not [0, 0])
- [ ] Users can optionally capture location
- [ ] Location permission denial shows error
- [ ] Console logs show detailed information
- [ ] Redirects work correctly based on role
- [ ] Database collections have proper data structure

---

## 🚀 All Tests Passing? You're Ready! 

Your worker registration system with live location capture is now fully functional! 🎉
