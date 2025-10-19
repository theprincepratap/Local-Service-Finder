# 🔍 Troubleshooting White Screen

## Quick Diagnostic Steps:

### 1. **Check Browser Console (Most Important!)**
```
Press F12 → Go to "Console" tab
Look for RED error messages
```

Common errors you might see:
- ❌ "Failed to fetch" = Backend not running
- ❌ "Module not found" = Missing package
- ❌ "Cannot read property" = Code error
- ❌ Blank = Page might actually be loading

### 2. **Check if Servers are Running**

**Frontend (Vite):**
- Should show: `VITE v5.4.20  ready in XXXms`
- Should show: `➜  Local:   http://localhost:5173/`
- If not, run: `cd frontend && npm run dev`

**Backend (Node):**
- Should show: `Server running on port 5000`
- Should show: `MongoDB connected`
- If not, run: `cd backend && node server.js`

### 3. **Test URLs Directly**

Try these URLs in your browser:

1. **Debug Page**: http://localhost:5173/debug.html
   - This will show if frontend is running

2. **Backend Health**: http://localhost:5000/api/health
   - Should show: `{"success":true,"message":"Server is running"}`

3. **Main App**: http://localhost:5173/
   - Should show the home page

### 4. **Common Fixes**

#### ❌ White Screen + No Console Errors
**Fix:**
```bash
# Clear browser cache
Ctrl + Shift + Delete
# OR
Hard refresh: Ctrl + Shift + R
```

#### ❌ "Cannot GET /"
**Fix:**
```bash
cd frontend
npm run dev
# Wait for "ready in" message
```

#### ❌ 404 errors for CSS/JS files
**Fix:**
```bash
# Rebuild
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

#### ❌ React errors
**Fix:**
```bash
cd frontend
npm install react react-dom react-router-dom
npm run dev
```

### 5. **Step-by-Step Restart**

```powershell
# Stop all processes (Ctrl+C in each terminal)

# Terminal 1 - Start Backend
cd d:\VITPROJECT\LocalServiceFinderApp\backend
node server.js

# Wait for "Server running on port 5000"
# Wait for "MongoDB connected"

# Terminal 2 - Start Frontend  
cd d:\VITPROJECT\LocalServiceFinderApp\frontend
npm run dev

# Wait for "ready in XXXms"
# Open: http://localhost:5173
```

### 6. **Check Package Installation**

```bash
cd frontend

# Check if node_modules exists
ls node_modules

# If not, install:
npm install

# Check specific packages:
npm list react react-dom react-router-dom
```

### 7. **Browser-Specific Issues**

Try different browsers:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ⚠️ Safari (might have CORS issues)

### 8. **Check Network Tab**

In Browser (F12):
1. Go to "Network" tab
2. Refresh page (F5)
3. Look for failed requests (RED)
4. Check Status codes:
   - 200 = OK ✅
   - 404 = Not Found ❌
   - 500 = Server Error ❌

### 9. **Check Vite Config**

File: `frontend/vite.config.js`

Should have:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 10. **Emergency Reset**

If nothing works:

```bash
# Frontend clean install
cd frontend
rm -rf node_modules package-lock.json .vite dist
npm install
npm run dev

# Test with simple page
# Visit: http://localhost:5173/debug.html
```

---

## 🎯 Most Likely Causes:

1. **Frontend not running** (80%)
   - Fix: `cd frontend && npm run dev`

2. **JavaScript error** (15%)
   - Fix: Check browser console

3. **Missing packages** (4%)
   - Fix: `npm install`

4. **Port conflict** (1%)
   - Fix: Change port in vite.config.js

---

## ✅ What to Check NOW:

1. [ ] Open http://localhost:5173 in browser
2. [ ] Press F12 and check Console tab
3. [ ] Look for errors (RED text)
4. [ ] Take screenshot of console and share
5. [ ] Check if `npm run dev` is running in terminal
6. [ ] Check terminal output for errors

---

## 📞 Quick Test Commands:

```powershell
# Check if frontend is accessible
curl http://localhost:5173

# Check if backend is accessible  
curl http://localhost:5000/api/health

# Check processes on ports
netstat -ano | findstr :5173
netstat -ano | findstr :5000
```

---

## 🆘 If Still White Screen:

1. Send me screenshot of:
   - Browser console (F12 → Console)
   - Terminal running `npm run dev`
   - Network tab (F12 → Network)

2. Tell me:
   - Which URL you're trying to open?
   - Any error messages?
   - Did frontend server start successfully?

---

**90% of white screens are because the dev server isn't running or there's a console error!**
