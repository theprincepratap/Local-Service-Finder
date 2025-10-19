# Profile Photo Upload Feature

## ✅ Implementation Complete

### Backend Changes

#### 1. **Upload Middleware** (`backend/middleware/upload.js`)
- Configured Multer for file uploads
- Storage: `backend/uploads/profiles/`
- File naming: `profile-{timestamp}-{random}.{ext}`
- Validation: Only JPEG, JPG, PNG, GIF allowed
- Size limit: 2MB maximum
- Auto-creates upload directory if not exists

#### 2. **Auth Controller** (`backend/controllers/auth.controller.js`)
- New endpoint: `uploadPhoto`
- Deletes old profile photo when new one is uploaded
- Updates user's `profileImage` field in database
- Returns image URL: `/uploads/profiles/{filename}`
- Error handling: Deletes uploaded file if database update fails

#### 3. **Auth Routes** (`backend/routes/auth.routes.js`)
- New route: `POST /api/auth/upload-photo`
- Protected route (requires authentication)
- Uses multer middleware: `upload.single('photo')`

#### 4. **Server Configuration** (`backend/server.js`)
- Added static file serving: `/uploads` directory
- Images accessible at: `http://localhost:5000/uploads/profiles/{filename}`

---

### Frontend Changes

#### 1. **API Service** (`frontend/src/services/apiService.js`)
- New method: `uploadProfilePhoto(file)`
- Sends FormData with multipart/form-data headers
- Returns uploaded image data

#### 2. **Auth Store** (`frontend/src/store/authStore.js`)
- Added `updateUser(userData)` method
- Updates user state with new profile image

#### 3. **Settings Page** (`frontend/src/pages/Settings.jsx`)
- File input with ref for programmatic clicks
- Image preview with gradient fallback
- Upload progress indicator (spinner overlay)
- Validates file type and size before upload
- Auto-updates UI after successful upload
- Camera icon button to trigger file selection

---

## 🎯 How to Use

### For Users:
1. Navigate to Settings page (`/settings`)
2. Click on "Profile" tab
3. Click the "Change Photo" button (with camera icon)
4. Select an image file (JPG, PNG, or GIF, max 2MB)
5. Photo uploads automatically and updates instantly

### API Usage:
```javascript
// Upload profile photo
const file = document.querySelector('input[type="file"]').files[0];
const response = await apiService.auth.uploadProfilePhoto(file);

// Response format:
{
  success: true,
  message: 'Profile photo uploaded successfully',
  data: {
    user: { ...updatedUserObject },
    imageUrl: '/uploads/profiles/profile-1234567890-123456789.jpg'
  }
}
```

---

## 📁 File Structure

```
backend/
├── middleware/
│   └── upload.js              ✅ NEW - Multer configuration
├── controllers/
│   └── auth.controller.js     ✅ UPDATED - Added uploadPhoto
├── routes/
│   └── auth.routes.js         ✅ UPDATED - Added upload route
├── server.js                  ✅ UPDATED - Added static file serving
└── uploads/
    └── profiles/              ✅ NEW - Upload directory
        └── (uploaded images)

frontend/
├── services/
│   └── apiService.js          ✅ UPDATED - Added uploadProfilePhoto
├── store/
│   └── authStore.js           ✅ UPDATED - Added updateUser
└── pages/
    └── Settings.jsx           ✅ UPDATED - Added photo upload UI
```

---

## 🔒 Security Features

1. **File Type Validation**: Only images allowed (JPEG, JPG, PNG, GIF)
2. **File Size Limit**: Maximum 2MB
3. **Authentication Required**: Protected route - must be logged in
4. **Old Photo Cleanup**: Automatically deletes previous photo to save space
5. **Unique Filenames**: Prevents filename collisions
6. **Error Handling**: Cleans up uploaded file if database update fails

---

## 🎨 UI Features

1. **Image Preview**: Shows uploaded photo or gradient fallback with initials
2. **Upload Indicator**: Spinner overlay during upload
3. **Disabled State**: Button disabled during upload
4. **File Input Hidden**: Clean UI with custom button
5. **Error Messages**: Toast notifications for validation errors
6. **Success Feedback**: Toast notification on successful upload

---

## 🐛 Error Handling

**Backend Errors:**
- 400: No file uploaded
- 401: Not authenticated
- 500: Upload or database error

**Frontend Validation:**
- File type not allowed → Toast error
- File too large (>2MB) → Toast error
- Upload failed → Toast error with message

---

## 🚀 Testing

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Login as Demo Worker**: Click "Demo Worker Login" button
4. **Navigate to Settings**: Click profile menu → Settings
5. **Upload Photo**: Click "Change Photo" and select an image

---

## 📝 Dependencies

**Backend:**
- `multer: ^1.4.5-lts.1` (already installed)
- `path` (built-in)
- `fs` (built-in)

**Frontend:**
- No new dependencies required
- Uses native FormData API

---

## 🎯 Image URL Format

**Uploaded images are accessible at:**
```
http://localhost:5000/uploads/profiles/profile-1234567890-123456789.jpg
```

**In frontend, use:**
```jsx
<img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/profiles/${user.profileImage}`} />
```

Or simpler (as implemented):
```jsx
<img src={`http://localhost:5000/uploads/profiles/${user.profileImage}`} />
```

---

## ✅ Feature Status: **COMPLETE**

All functionality implemented and ready to use!
