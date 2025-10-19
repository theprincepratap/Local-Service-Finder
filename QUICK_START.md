# 🚀 Quick Setup - You're Almost There!

## ✅ What's Been Done

1. ✅ Backend dependencies installed (451 packages)
2. ✅ Frontend dependencies installed (389 packages)
3. ✅ `.env` files created for both backend and frontend

---

## ⚠️ Important: Database Setup

You have **TWO OPTIONS** for MongoDB:

### **Option 1: Local MongoDB (Easiest for Testing)**

**If you have MongoDB installed on your computer:**
- Your `.env` is already configured to use: `mongodb://localhost:27017/localworker`
- Just start MongoDB service and run the app!

**Windows - Start MongoDB:**
```powershell
# Start MongoDB service
net start MongoDB

# Or if using MongoDB Community Server:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

### **Option 2: MongoDB Atlas (Cloud - Recommended for Production)**

**Get a FREE cloud database:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster (free tier: M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Edit `backend\.env` and update `MONGO_URI`:

```env
# Comment out local MongoDB:
# MONGO_URI=mongodb://localhost:27017/localworker

# Uncomment and use your Atlas connection string:
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/localworker?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_USERNAME` with your MongoDB Atlas username
- `YOUR_PASSWORD` with your password
- `cluster0.xxxxx` with your cluster address

---

## 🏃 Running the Application

### **Start Backend Server**

**PowerShell:**
```powershell
cd D:\VITPROJECT\LocalServiceFinderApp\backend
npm run dev
```

**You should see:**
```
✅ MongoDB Connected: localhost (or your Atlas cluster)
🚀 Server running on port 5000
```

### **Start Frontend Server (New Terminal)**

**PowerShell:**
```powershell
cd D:\VITPROJECT\LocalServiceFinderApp\frontend
npm run dev
```

**You should see:**
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🌐 Access the Application

1. **Frontend:** http://localhost:5173
2. **Backend API:** http://localhost:5000
3. **Health Check:** http://localhost:5000/api/health

---

## 🐛 Troubleshooting

### **Error: "Cannot connect to MongoDB"**

**If using Local MongoDB:**
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start if not running
net start MongoDB
```

**If using MongoDB Atlas:**
- Check your connection string in `.env`
- Make sure you replaced username and password
- Whitelist your IP in MongoDB Atlas (Network Access)
- Check internet connection

### **Error: "Port 5000 already in use"**

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### **Error: "Module not found"**

```powershell
# Reinstall dependencies
cd backend
Remove-Item node_modules -Recurse -Force
npm install

cd ..\frontend
Remove-Item node_modules -Recurse -Force
npm install
```

---

## 📋 Quick Command Reference (PowerShell)

```powershell
# Navigate to project
cd D:\VITPROJECT\LocalServiceFinderApp

# Backend
cd backend
npm run dev          # Start backend server
npm start            # Production mode

# Frontend
cd frontend
npm run dev          # Start frontend server
npm run build        # Build for production

# Both (use separate terminals)
# Terminal 1:
cd backend; npm run dev

# Terminal 2:
cd frontend; npm run dev
```

---

## ✅ Next Steps

1. **Choose MongoDB option** (Local or Atlas)
2. **Start MongoDB** (if using local)
3. **Start backend** server
4. **Start frontend** server (new terminal)
5. **Open** http://localhost:5173 in browser
6. **Test** the application!

---

## 🎯 Testing the Setup

Once both servers are running:

1. Open browser: http://localhost:5173
2. You should see the LocalWorker home page
3. Try registering a new user
4. Check backend terminal for API requests

---

## 📝 Important Notes

- The warnings during `npm install` are normal (deprecated packages)
- The 2 moderate vulnerabilities are in dev dependencies (safe for development)
- Keep both terminal windows open while developing
- Press `Ctrl+C` in terminal to stop servers

---

**You're all set! 🎉 Choose your MongoDB option and start the servers!**
