# 🚀 LocalServiceFinderApp - Deployment Guide

Complete step-by-step guide to deploy your application to production.

**Last Updated:** November 13, 2025  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Alternative: Deploy Both on Railway](#alternative-deploy-on-railway)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Domain & SSL Configuration](#domain--ssl-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## 🔍 Pre-Deployment Checklist

Before deploying, ensure you have:

### Accounts Required
- [ ] GitHub account (for code repository)
- [ ] MongoDB Atlas account (database)
- [ ] Render account (backend hosting) - OR Railway
- [ ] Vercel account (frontend hosting) - OR Netlify
- [ ] Cloudinary account (image uploads)
- [ ] Razorpay account (payments)
- [ ] Google Cloud Console (Maps API)

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files are NOT committed (in .gitignore)
- [ ] Production build tested locally
- [ ] All dependencies listed in package.json
- [ ] Database indexes created

### Testing
- [ ] Local development working
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] File uploads working
- [ ] Socket.IO connections working

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Cluster

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com/
   - Sign in or create account

2. **Create New Cluster:**
   ```
   - Click "Build a Cluster"
   - Choose FREE tier (M0 Sandbox)
   - Select region closest to your users (e.g., Mumbai for India)
   - Cluster name: "LocalServiceFinder"
   - Click "Create Cluster"
   ```

3. **Wait for cluster creation (2-3 minutes)**

### Step 2: Configure Network Access

1. **Whitelist IP Addresses:**
   ```
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   ```

   ⚠️ **Security Note:** For production, whitelist only your hosting provider's IPs.

### Step 3: Create Database User

1. **Add Database User:**
   ```
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: localserviceapp
   - Password: Generate secure password (save this!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"
   ```

### Step 4: Get Connection String

1. **Get MongoDB URI:**
   ```
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy connection string
   ```

2. **Your connection string will look like:**
   ```
   mongodb+srv://localserviceapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Replace `<password>` with your database user password**

4. **Add database name:**
   ```
   mongodb+srv://localserviceapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/localservicefinder?retryWrites=true&w=majority
   ```

### Step 5: Create Indexes

Connect to your database and run:

```javascript
// In MongoDB Compass or Atlas UI → Collections → Indexes

// WorkerUser collection
db.workerusers.createIndex({ location: "2dsphere" })
db.workerusers.createIndex({ categories: 1, approvalStatus: 1, isActive: 1 })
db.workerusers.createIndex({ email: 1 }, { unique: true })

// User collection
db.users.createIndex({ email: 1 }, { unique: true })

// Booking collection
db.bookings.createIndex({ userId: 1, status: 1 })
db.bookings.createIndex({ workerId: 1, status: 1 })
db.bookings.createIndex({ createdAt: -1 })
```

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Update `package.json` start script:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

2. **Create `render.yaml` in project root (optional):**
   ```yaml
   services:
     - type: web
       name: localservicefinder-backend
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

### Step 2: Deploy on Render

1. **Sign up/Login to Render:**
   - Visit: https://render.com/
   - Sign up with GitHub

2. **Create New Web Service:**
   ```
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select "LocalServiceFinderApp" repository
   ```

3. **Configure Service:**
   ```
   Name: localservicefinder-api
   Region: Choose closest to your MongoDB region
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or Starter for better performance)
   ```

4. **Add Environment Variables:**

   Click "Advanced" → "Add Environment Variable" and add these one by one:

   ```bash
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://localserviceapp:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/localservicefinder?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   JWT_EXPIRE=7d
   
   # Cloudinary (get from cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Razorpay (get from razorpay.com)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Google Maps
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Frontend URL (will update after frontend deployment)
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # Socket.IO CORS
   SOCKET_IO_CORS_ORIGIN=https://your-frontend-url.vercel.app
   
   # Admin
   ADMIN_EMAIL=theprincepratap@gmail.com
   ADMIN_PASSWORD=ChangeThisSecurePassword123!
   ADMIN_NAME=Prince Kumar
   ADMIN_PHONE=9999999999
   ```

5. **Create Service:**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy your backend URL: `https://localservicefinder-api.onrender.com`

### Step 3: Verify Backend Deployment

Test your API:
```bash
# Health check
curl https://localservicefinder-api.onrender.com/

# API test
curl https://localservicefinder-api.onrender.com/api/health
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Create `.env.production` in frontend folder:**
   ```bash
   VITE_API_URL=https://localservicefinder-api.onrender.com
   VITE_SOCKET_URL=https://localservicefinder-api.onrender.com
   ```

2. **Update `vite.config.js` if needed:**
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     build: {
       outDir: 'dist',
       sourcemap: false,
       rollupOptions: {
         output: {
           manualChunks: {
             'react-vendor': ['react', 'react-dom', 'react-router-dom'],
             'map-vendor': ['leaflet', 'react-leaflet']
           }
         }
       }
     }
   })
   ```

3. **Create `vercel.json` in frontend folder:**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable"
           }
         ]
       }
     ]
   }
   ```

### Step 2: Deploy on Vercel

1. **Sign up/Login to Vercel:**
   - Visit: https://vercel.com/
   - Sign up with GitHub

2. **Import Project:**
   ```
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select "LocalServiceFinderApp"
   ```

3. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://localservicefinder-api.onrender.com
   VITE_SOCKET_URL=https://localservicefinder-api.onrender.com
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build (2-3 minutes)
   - Your frontend URL: `https://localservicefinder.vercel.app`

### Step 3: Update Backend CORS

Go back to Render and update these environment variables:

```bash
FRONTEND_URL=https://localservicefinder.vercel.app
SOCKET_IO_CORS_ORIGIN=https://localservicefinder.vercel.app
```

Then trigger a redeploy.

---

## 🚂 Alternative: Deploy Both on Railway

Railway is simpler for full-stack apps.

### Step 1: Deploy Backend on Railway

1. **Sign up at Railway:**
   - Visit: https://railway.app/
   - Sign up with GitHub

2. **Create New Project:**
   ```
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose "LocalServiceFinderApp"
   ```

3. **Add MongoDB Plugin:**
   ```
   - Click "New" → "Database" → "Add MongoDB"
   - Railway will provision MongoDB for you
   - Copy MONGO_URL from variables tab
   ```

4. **Configure Backend Service:**
   ```
   - Click "New" → "GitHub Repo"
   - Root Directory: backend
   - Start Command: npm start
   ```

5. **Add Environment Variables** (same as Render)

6. **Generate Domain:**
   - Go to Settings → Generate Domain
   - Copy: `https://backend-production-xxxx.up.railway.app`

### Step 2: Deploy Frontend on Railway

1. **Add Frontend Service:**
   ```
   - Click "New" → "GitHub Repo" (select same repo)
   - Root Directory: frontend
   - Build Command: npm run build
   - Start Command: npx serve -s dist -l $PORT
   ```

2. **Add serve package:**

   Update frontend `package.json`:
   ```json
   {
     "dependencies": {
       "serve": "^14.2.0"
     },
     "scripts": {
       "start": "serve -s dist -l $PORT"
     }
   }
   ```

3. **Add Environment Variables:**
   ```
   VITE_API_URL=https://backend-production-xxxx.up.railway.app
   ```

4. **Generate Domain:**
   - Settings → Generate Domain
   - Copy: `https://frontend-production-yyyy.up.railway.app`

---

## 🔐 Environment Variables

### Required for Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens (32+ chars) | `abc123...` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `FRONTEND_URL` | Your frontend URL for CORS | `https://app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | `your_name` |
| `CLOUDINARY_API_KEY` | Cloudinary key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `abc123...` |
| `RAZORPAY_KEY_ID` | Payment gateway key | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Payment gateway secret | `abc123...` |
| `GOOGLE_MAPS_API_KEY` | Google Maps key | `AIza...` |

### Required for Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com` |
| `VITE_SOCKET_URL` | Socket.IO server URL | Same as API URL |

---

## ✅ Post-Deployment Steps

### 1. Test Authentication

```bash
# Register a test user
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "1234567890"
  }'

# Login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 2. Create Admin User

Run this script or use MongoDB Compass:

```javascript
// Connect to your production database and run:
db.admins.insertOne({
  name: "Admin",
  email: "admin@localservice.com",
  password: "$2a$10$...", // bcrypt hashed password
  role: "admin",
  phone: "9999999999",
  isActive: true,
  createdAt: new Date()
})
```

Or use the backend endpoint if you created one.

### 3. Seed Initial Data

Create some test workers:

```bash
curl -X POST https://your-backend-url.com/api/workers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Plumber",
    "email": "john@example.com",
    "phone": "9876543210",
    "categories": ["Plumber"],
    "skills": ["Pipe repair", "Leak fixing"],
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716],
      "city": "Bangalore",
      "state": "Karnataka"
    },
    "pricePerHour": 500
  }'
```

### 4. Configure Monitoring

**Render:**
- Enable email notifications: Settings → Alerts

**Railway:**
- Set up Discord/Slack webhooks: Settings → Integrations

### 5. Set Up Custom Domain (Optional)

**For Vercel:**
1. Go to Project Settings → Domains
2. Add custom domain: `www.localservicefinder.com`
3. Follow DNS configuration instructions

**For Render:**
1. Go to Dashboard → Settings → Custom Domain
2. Add domain and configure DNS

---

## 🌍 Domain & SSL Configuration

### Purchase Domain (Optional)

Recommended registrars:
- Namecheap: https://www.namecheap.com/
- GoDaddy: https://www.godaddy.com/
- Google Domains: https://domains.google/

### Configure DNS

Example DNS records for Vercel:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

For Render (backend subdomain):

```
Type    Name    Value
CNAME   api     your-app.onrender.com
```

### SSL Certificate

Both Vercel and Render provide free SSL certificates automatically!

---

## 📊 Monitoring & Maintenance

### Health Checks

Add this endpoint to your backend:

```javascript
// backend/routes/health.routes.js
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})
```

### Logging

Use a service like:
- **Logtail** (free tier)
- **Datadog** (paid)
- **New Relic** (free tier)

### Database Backups

**MongoDB Atlas:**
- Go to Cluster → Backup
- Enable continuous backups (free tier: 1 backup/day)

### Performance Monitoring

Install monitoring libraries:

```bash
cd backend
npm install @sentry/node
```

### Uptime Monitoring

Free services:
- **UptimeRobot**: https://uptimerobot.com/
- **Freshping**: https://www.freshworks.com/website-monitoring/

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **CORS Errors**

**Problem:** Frontend can't connect to backend

**Solution:**
- Check `FRONTEND_URL` in backend env vars
- Ensure `CORS_ORIGIN` includes your frontend domain
- Verify backend CORS middleware in `server.js`

#### 2. **MongoDB Connection Failed**

**Problem:** "Could not connect to any servers"

**Solution:**
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions
- Ensure `MONGO_URI` env var is set correctly

#### 3. **500 Internal Server Error**

**Problem:** API requests failing

**Solution:**
- Check backend logs: Render Dashboard → Logs
- Verify all required env vars are set
- Check MongoDB connection
- Test endpoints with Postman

#### 4. **Images Not Uploading**

**Problem:** File uploads fail

**Solution:**
- Verify Cloudinary credentials
- Check API key limits
- Ensure multer middleware is configured
- Check file size limits

#### 5. **Socket.IO Not Connecting**

**Problem:** Real-time features not working

**Solution:**
- Add WebSocket support in hosting platform
- Update `SOCKET_IO_CORS_ORIGIN`
- Check Socket.IO client connection URL
- Verify port configuration

#### 6. **Build Failures**

**Problem:** Deployment fails during build

**Solution:**
```bash
# Locally test production build
cd frontend
npm run build

cd ../backend
npm install --production
npm start
```

### Debugging Commands

```bash
# Check backend logs (Render)
# Go to Dashboard → Logs tab

# Check frontend logs (Vercel)
# Go to Deployment → View Function Logs

# Test backend locally with production env
cd backend
NODE_ENV=production npm start

# Test frontend build locally
cd frontend
npm run build
npx serve -s dist
```

### Get Help

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Railway Docs**: https://docs.railway.app/

---

## 🎉 Deployment Complete!

Your application should now be live:

- **Frontend:** `https://localservicefinder.vercel.app`
- **Backend API:** `https://localservicefinder-api.onrender.com`
- **Admin Panel:** `https://localservicefinder.vercel.app/admin`

### Next Steps

1. ✅ Test all major features
2. ✅ Set up monitoring and alerts
3. ✅ Configure automated backups
4. ✅ Add custom domain (optional)
5. ✅ Set up CI/CD for auto-deployments
6. ✅ Monitor performance and logs
7. ✅ Scale as needed

### Security Checklist

- [ ] Change all default passwords
- [ ] Rotate JWT secrets regularly
- [ ] Enable rate limiting
- [ ] Set up HTTPS only
- [ ] Configure security headers
- [ ] Regular dependency updates
- [ ] Monitor error logs
- [ ] Set up backup strategy

---

**Need Help?** Create an issue on GitHub or contact: theprincepratap@gmail.com

**Good luck with your deployment! 🚀**
