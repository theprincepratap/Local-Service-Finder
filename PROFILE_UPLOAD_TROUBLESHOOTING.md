# Profile Photo Upload - Troubleshooting Guide

## Issue: Route Not Found (404) when uploading profile photo

### Quick Fix Steps:

1. **Restart Backend Server**
   The most common cause is that the server needs to be restarted to load the upload route.
   
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   cd backend
   node server.js
   ```

2. **Verify Route is Registered**
   Check backend console for:
   ```
   ╔════════════════════════════════════════╗
   ║   🚀 Server running on port 5000       ║
   ╚════════════════════════════════════════╝
   ```

3. **Test the Upload Endpoint**
   Open browser console and check the exact error:
   - Frontend URL: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api/auth/upload-photo`
   
   Expected request:
   ```
   POST http://localhost:5000/api/auth/upload-photo
   Authorization: Bearer <token>
   Content-Type: multipart/form-data
   ```

4. **Check Console Logs**
   When you try to upload, you should see:
   ```
   📸 Upload photo request received
   User: <userId>
   File: { ... file details ... }
   ✅ Profile photo uploaded successfully: profile-xxxxx.jpg
   POST /api/auth/upload-photo 200
   ```

   If you see:
   ```
   POST /api/auth/upload-photo 404
   ```
   The route is not registered → Restart server

### Verification Checklist:

- [ ] Backend server is running on port 5000
- [ ] MongoDB is connected
- [ ] `backend/middleware/upload.js` exists
- [ ] `backend/uploads/profiles/` directory exists (created automatically)
- [ ] Auth token is present in request headers
- [ ] File is selected before clicking upload

### Common Issues:

**1. 404 Not Found**
- **Cause**: Server not restarted after code changes
- **Fix**: Restart backend server

**2. 401 Unauthorized**
- **Cause**: No authentication token
- **Fix**: Make sure user is logged in

**3. 400 Bad Request - "Please upload a file"**
- **Cause**: File not attached to request
- **Fix**: Check frontend is sending FormData correctly

**4. 413 Payload Too Large**
- **Cause**: File size exceeds 2MB limit
- **Fix**: Compress image or increase limit in `upload.js`

**5. Network Error**
- **Cause**: Backend server not running
- **Fix**: Start backend server

### Test Manually with cURL:

```bash
# Replace <TOKEN> with your actual JWT token
# Replace <FILE_PATH> with path to an image file

curl -X POST http://localhost:5000/api/auth/upload-photo \
  -H "Authorization: Bearer <TOKEN>" \
  -F "photo=@<FILE_PATH>"
```

Example:
```bash
curl -X POST http://localhost:5000/api/auth/upload-photo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "photo=@C:/Users/You/Pictures/avatar.jpg"
```

Expected Response:
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "data": {
    "user": { ... },
    "imageUrl": "/uploads/profiles/profile-1729262400000-123456789.jpg"
  }
}
```

### Frontend Debug:

Add this to `Settings.jsx` to see request details:

```javascript
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log('📸 File selected:', file.name, file.size, file.type);

  try {
    setUploading(true);
    console.log('📤 Uploading to:', '/api/auth/upload-photo');
    
    const response = await apiService.auth.uploadProfilePhoto(file);
    
    console.log('✅ Upload response:', response);
    // ... rest of code
  } catch (error) {
    console.error('❌ Upload error:', error.response || error);
    // ... rest of code
  }
};
```

### Still Not Working?

1. Check `backend/server.js` - auth routes should be registered:
   ```javascript
   app.use('/api/auth', require('./routes/auth.routes'));
   ```

2. Check `backend/routes/auth.routes.js` - upload route should exist:
   ```javascript
   router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);
   ```

3. Check `backend/controllers/auth.controller.js` - uploadPhoto should be exported:
   ```javascript
   exports.uploadPhoto = async (req, res) => { ... }
   ```

4. Verify dependencies are installed:
   ```bash
   cd backend
   npm list multer
   # Should show: multer@1.4.5 (or similar version)
   ```

5. Check for typos in route path:
   - Frontend: `/auth/upload-photo` ✅
   - NOT: `/auth/upload-image` ❌
   - NOT: `/auth/uploadphoto` ❌

### Success Indicators:

When everything works correctly:

1. **Frontend Console**:
   ```
   📸 File selected: avatar.jpg 156789 image/jpeg
   📤 Uploading to: /api/auth/upload-photo
   ✅ Upload response: { success: true, ... }
   ```

2. **Backend Console**:
   ```
   📸 Upload photo request received
   User: 507f1f77bcf86cd799439011
   File: { fieldname: 'photo', originalname: 'avatar.jpg', ... }
   🗑️ Deleted old profile image (if exists)
   ✅ Profile photo uploaded successfully: profile-1729262400000-123456789.jpg
   POST /api/auth/upload-photo 200 123.456 ms
   ```

3. **File System**:
   - New file created in `backend/uploads/profiles/`
   - Old file deleted (if existed)

4. **Database**:
   - User document updated with new `profileImage` field

5. **Frontend UI**:
   - Image preview updates immediately
   - Success toast notification shown

---

## Quick Command Reference:

```bash
# Restart backend
cd backend
node server.js

# Check if uploads directory exists
dir backend\uploads\profiles  # Windows
ls -la backend/uploads/profiles  # Linux/Mac

# Test upload endpoint
curl http://localhost:5000/api/auth/upload-photo -v

# Check backend logs
# Should show route registration on startup
```

---

## Solution Applied:

✅ **Fixed in `apiService.js`:**
- Removed explicit `Content-Type: multipart/form-data` header
- Let browser automatically set the correct boundary

✅ **Added detailed logging in `auth.controller.js`:**
- Console logs show upload request details
- Helps identify where upload fails

✅ **Next Step:**
**RESTART YOUR BACKEND SERVER** - This is the most likely fix!

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd backend
node server.js
```

After restart, try uploading again and check the console logs.
