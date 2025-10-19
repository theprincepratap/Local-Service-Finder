# ⚡ Command Cheat Sheet

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Navigate to project
cd LocalServiceFinderApp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Copy environment files
cd ../backend
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

cd ../frontend
echo VITE_API_URL=http://localhost:5000/api > .env
```

### Daily Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📦 NPM Commands

### Backend Commands
```bash
cd backend

npm install              # Install dependencies
npm start               # Start production server
npm run dev             # Start development server (nodemon)
npm test                # Run tests
```

### Frontend Commands
```bash
cd frontend

npm install             # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

---

## 🗄️ MongoDB Commands

### MongoDB Atlas (Cloud)
```bash
# Already handled through connection string
# No local commands needed
```

### Local MongoDB
```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Mac/Linux)
sudo systemctl start mongod

# Stop MongoDB (Windows)
net stop MongoDB

# Stop MongoDB (Mac/Linux)
sudo systemctl stop mongod

# MongoDB Shell
mongosh
# or older versions:
mongo
```

### Useful Mongo Shell Commands
```javascript
// Show databases
show dbs

// Use database
use localworker

// Show collections
show collections

// Find all users
db.users.find()

// Find all workers
db.workers.find()

// Count documents
db.users.countDocuments()

// Drop collection
db.users.drop()

// Create index
db.workers.createIndex({ location: "2dsphere" })
```

---

## 🔧 Git Commands

### Initial Setup
```bash
# Initialize repository
git init

# Add remote
git remote add origin <your-repo-url>

# First commit
git add .
git commit -m "Initial commit: MERN stack setup"
git push -u origin main
```

### Daily Workflow
```bash
# Check status
git status

# Add files
git add .                    # Add all files
git add filename.js          # Add specific file

# Commit
git commit -m "Add feature X"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature
```

---

## 🐛 Debugging Commands

### Check Running Processes
```bash
# Windows - Check port 5000
netstat -ano | findstr :5000

# Mac/Linux - Check port 5000
lsof -i :5000

# Windows - Kill process
taskkill /PID <PID> /F

# Mac/Linux - Kill process
kill -9 <PID>
```

### Clear Node Modules
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json    # Mac/Linux
rmdir /s node_modules && del package-lock.json    # Windows
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json    # Mac/Linux
rmdir /s node_modules && del package-lock.json    # Windows
npm install
```

### Clear Vite Cache
```bash
cd frontend
rm -rf .vite node_modules/.vite    # Mac/Linux
rmdir /s .vite node_modules\.vite  # Windows
```

---

## 🧪 Testing Commands

### Backend API Testing (using curl)
```bash
# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get User (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### PowerShell (Windows)
```powershell
# Register User
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@example.com","password":"password123","phone":"9876543210"}'

# Login
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'
```

---

## 📊 Useful VS Code Commands

### Terminal
```
Ctrl + `              # Open/close terminal
Ctrl + Shift + `      # Create new terminal
Ctrl + Shift + 5      # Split terminal
```

### Editor
```
Ctrl + P              # Quick open file
Ctrl + Shift + P      # Command palette
Ctrl + B              # Toggle sidebar
Ctrl + /              # Toggle comment
Alt + Up/Down         # Move line up/down
Ctrl + D              # Select next occurrence
```

### Code Navigation
```
F12                   # Go to definition
Alt + Left/Right      # Navigate back/forward
Ctrl + Shift + O      # Go to symbol
Ctrl + G              # Go to line
```

---

## 🔍 Environment Variables Check

### Backend
```bash
cd backend
cat .env              # Mac/Linux
type .env             # Windows
```

### Frontend
```bash
cd frontend
cat .env              # Mac/Linux
type .env             # Windows
```

---

## 🌐 Network Commands

### Check if Backend is Running
```bash
# Using curl
curl http://localhost:5000/api/health

# Using browser
# Open: http://localhost:5000/api/health
```

### Check if Frontend is Running
```bash
# Open browser
# Navigate to: http://localhost:5173
```

---

## 📱 Installation Shortcuts

### Install All Dependencies (from root)
```bash
# Install both backend and frontend
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### Update All Dependencies
```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

---

## 🔐 Security Commands

### Generate Random JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Check for Vulnerabilities
```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

---

## 🚀 Production Build

### Build Frontend
```bash
cd frontend
npm run build
# Output: dist/ folder
```

### Serve Production Build Locally
```bash
cd frontend
npm run preview
# Opens on http://localhost:4173
```

---

## 📦 Package Management

### Add New Package
```bash
# Backend
cd backend
npm install package-name
npm install -D package-name    # Dev dependency

# Frontend
cd frontend
npm install package-name
npm install -D package-name    # Dev dependency
```

### Remove Package
```bash
npm uninstall package-name
```

### List Installed Packages
```bash
npm list
npm list --depth=0    # Top-level only
```

---

## 🎯 Common Workflows

### Starting Fresh Development Session
```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Start servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

### Before Pushing to Git
```bash
# 1. Check what changed
git status

# 2. Test everything works
cd backend && npm run dev    # Test backend
cd frontend && npm run dev   # Test frontend

# 3. Commit and push
git add .
git commit -m "Your message"
git push
```

---

## 🆘 Emergency Commands

### Nuclear Option (Complete Reset)
```bash
# CAUTION: This deletes everything and starts fresh

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .vite dist
npm install

# Git (if needed)
git clean -fdx    # VERY DANGEROUS: Removes all untracked files
```

---

## 📝 Logging Commands

### View Backend Logs
```bash
cd backend
npm run dev | tee backend.log    # Mac/Linux
npm run dev > backend.log        # Windows
```

### Clear Console
```bash
clear           # Mac/Linux
cls             # Windows
```

---

## 🎨 Tailwind CSS Commands

### Rebuild Tailwind (if needed)
```bash
cd frontend
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

---

## 💾 Backup Commands

### Backup Database
```bash
# MongoDB Atlas: Use cloud backup feature

# Local MongoDB
mongodump --db localworker --out ./backup
```

### Restore Database
```bash
mongorestore --db localworker ./backup/localworker
```

---

## 🔄 Quick Reference

### Start Everything
```bash
# One-liner to start both servers
cd backend && npm run dev & cd ../frontend && npm run dev
```

### Stop Everything
```bash
Ctrl + C    # In each terminal
```

### Check Versions
```bash
node --version
npm --version
git --version
mongosh --version
```

---

**Save this file for quick reference! 📌**
