# 🚀 Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Recommended version: 18.x or higher
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. MongoDB Setup Options

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your password in connection string

#### Option B: Local MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service
4. Use connection string: `mongodb://localhost:27017/localworker`

### 3. Get Required API Keys

#### Cloudinary (Image Upload)
1. Visit: https://cloudinary.com/
2. Sign up for free account
3. Get your Cloud Name, API Key, and API Secret
4. Add to `.env` file

#### Razorpay (Payment Gateway)
1. Visit: https://razorpay.com/
2. Create account
3. Get Test API Keys from Dashboard
4. Add to `.env` file

#### Google Maps API (Location Services)
1. Visit: https://console.cloud.google.com/
2. Create new project
3. Enable "Maps JavaScript API" and "Geocoding API"
4. Create credentials (API Key)
5. Add to `.env` file

---

## Installation Steps

### Step 1: Clone and Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
# On Mac/Linux: cp .env.example .env

# Edit .env file with your credentials
# Use any text editor (VS Code, Notepad, etc.)
```

### Step 2: Configure Backend Environment

Edit `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/localworker?retryWrites=true&w=majority

# JWT Secret (any random string)
JWT_SECRET=mySuper_Secret_JWT_Key_12345_ChangThis

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay credentials (Test mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup Frontend

```bash
# Open new terminal
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file
echo VITE_API_URL=http://localhost:5000/api > .env
# On Windows CMD: echo VITE_API_URL=http://localhost:5000/api > .env
```

---

## Running the Application

### Method 1: Using Two Terminals (Recommended for Development)

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
✅ Backend should be running on `http://localhost:5000`

#### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```
✅ Frontend should be running on `http://localhost:5173`

### Method 2: Using VS Code
1. Open the project in VS Code
2. Use integrated terminal (Ctrl + `)
3. Split terminal (Ctrl + Shift + 5)
4. Run backend in one terminal, frontend in another

---

## Verify Installation

### 1. Check Backend
Open browser: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check Frontend
Open browser: `http://localhost:5173`

You should see the LocalWorker homepage

### 3. Check Database Connection
Look for this message in backend terminal:
```
✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
```

---

## Testing the Application

### 1. Register a User
1. Go to `http://localhost:5173/register`
2. Fill in user details
3. Click "Sign Up"

### 2. Login
1. Go to `http://localhost:5173/login`
2. Use your registered email and password
3. Click "Login"

### 3. Register as Worker
1. After login, go to your dashboard
2. Click "Register as Worker"
3. Fill in worker details
4. Submit

### 4. Test Worker Search
1. Go to "Find Workers"
2. Enter your location
3. Search for workers

---

## Common Issues and Solutions

### Issue 1: "Cannot connect to MongoDB"
**Solution:**
- Check internet connection (if using MongoDB Atlas)
- Verify MongoDB connection string in `.env`
- Make sure you've whitelisted your IP in MongoDB Atlas
- Replace `<password>` in connection string with actual password

### Issue 2: "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

Or change PORT in `.env` file:
```env
PORT=5001
```

### Issue 3: Frontend can't connect to backend
**Solution:**
- Make sure backend is running
- Check `VITE_API_URL` in `frontend/.env`
- Check CORS settings in `backend/server.js`

### Issue 4: "Module not found" error
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows
rmdir /s node_modules
del package-lock.json
npm install
```

---

## Development Tips

### Hot Reload
- Backend uses `nodemon` - auto-restarts on file changes
- Frontend uses Vite - hot module replacement (instant updates)

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API testing)

### Environment Variables
- Never commit `.env` files to Git
- Use `.env.example` as template
- Keep sensitive data secure

---

## API Testing

### Using Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create new request
3. Test endpoints:

#### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

---

## Project Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test          # Run tests (to be implemented)
```

### Frontend Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## Next Steps

1. ✅ Complete installation
2. ✅ Test basic features
3. 📝 Implement remaining features (worker search, booking, payments)
4. 🎨 Customize UI/UX
5. 🧪 Add comprehensive testing
6. 🚀 Deploy to production

---

## Deployment Guide (Future)

### Frontend: Vercel
```bash
npm run build
# Deploy to Vercel
```

### Backend: Render/Railway
```bash
# Push to GitHub
# Connect to Render/Railway
# Auto-deploy
```

### Database: MongoDB Atlas
- Already cloud-hosted
- No deployment needed

---

## Support

If you encounter issues:
1. Check this guide first
2. Review error messages carefully
3. Check MongoDB connection
4. Verify all environment variables
5. Ensure all dependencies are installed

---

**Happy Coding! 🎉**
