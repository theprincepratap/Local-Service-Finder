# LocalServiceFinderApp - Quick Deployment (Windows PowerShell)
# Run this script in PowerShell

Write-Host "🚀 LocalServiceFinderApp Deployment Helper" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is not installed. Download from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm is not installed." -ForegroundColor Red
    exit 1
}

$gitVersion = git --version 2>$null
if ($gitVersion) {
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Git is not installed. Download from: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: GitHub Repository
Write-Host "📦 Step 1: GitHub Repository" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
Write-Host ""
$githubReady = Read-Host "Have you pushed your code to GitHub? (y/n)"

if ($githubReady -ne "y") {
    Write-Host ""
    Write-Host "Please run these commands first:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  git init"
    Write-Host "  git add ."
    Write-Host "  git commit -m 'Initial commit'"
    Write-Host "  git branch -M main"
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/LocalServiceFinderApp.git"
    Write-Host "  git push -u origin main"
    Write-Host ""
    exit 0
}

Write-Host "✓ GitHub repository ready" -ForegroundColor Green
Write-Host ""

# Step 2: MongoDB Atlas
Write-Host "🗄️  Step 2: MongoDB Atlas Setup" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
Write-Host ""
$mongodbReady = Read-Host "Have you created a MongoDB Atlas cluster? (y/n)"

if ($mongodbReady -ne "y") {
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://cloud.mongodb.com/"
    Write-Host "2. Create a FREE cluster (M0)"
    Write-Host "3. Add a database user"
    Write-Host "4. Whitelist IP: 0.0.0.0/0"
    Write-Host "5. Get your connection string"
    Write-Host ""
    Write-Host "Press Enter when done..."
    $null = Read-Host
}

$MONGO_URI = Read-Host "Enter your MongoDB URI"
Write-Host "✓ MongoDB URI saved" -ForegroundColor Green
Write-Host ""

# Step 3: Third-party Services
Write-Host "🔑 Step 3: Third-party Service Keys" -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow
Write-Host ""

$hasCloudinary = Read-Host "Do you have Cloudinary account? (y/n)"

if ($hasCloudinary -eq "y") {
    $CLOUDINARY_CLOUD_NAME = Read-Host "Enter Cloudinary Cloud Name"
    $CLOUDINARY_API_KEY = Read-Host "Enter Cloudinary API Key"
    $CLOUDINARY_API_SECRET = Read-Host "Enter Cloudinary API Secret"
} else {
    Write-Host "⚠ Skipping Cloudinary (image uploads will not work)" -ForegroundColor Yellow
    $CLOUDINARY_CLOUD_NAME = "not_set"
    $CLOUDINARY_API_KEY = "not_set"
    $CLOUDINARY_API_SECRET = "not_set"
}

Write-Host ""
$hasRazorpay = Read-Host "Do you have Razorpay account? (y/n)"

if ($hasRazorpay -eq "y") {
    $RAZORPAY_KEY_ID = Read-Host "Enter Razorpay Key ID"
    $RAZORPAY_KEY_SECRET = Read-Host "Enter Razorpay Key Secret"
} else {
    Write-Host "⚠ Skipping Razorpay (payments will not work)" -ForegroundColor Yellow
    $RAZORPAY_KEY_ID = "not_set"
    $RAZORPAY_KEY_SECRET = "not_set"
}

Write-Host ""
$hasMaps = Read-Host "Do you have Google Maps API Key? (y/n)"

if ($hasMaps -eq "y") {
    $GOOGLE_MAPS_API_KEY = Read-Host "Enter Google Maps API Key"
} else {
    Write-Host "⚠ Skipping Google Maps (maps may not work)" -ForegroundColor Yellow
    $GOOGLE_MAPS_API_KEY = "not_set"
}

Write-Host ""
Write-Host "✓ Service keys collected" -ForegroundColor Green
Write-Host ""

# Generate JWT Secret (simple PowerShell version)
$JWT_SECRET = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))

# Step 4: Backend Deployment Instructions
Write-Host "🖥️  Step 4: Backend Deployment (Render)" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://render.com/"
Write-Host "2. Sign up with GitHub"
Write-Host "3. Click 'New +' → 'Web Service'"
Write-Host "4. Connect your repository"
Write-Host "5. Configure:"
Write-Host "   - Name: localservicefinder-api"
Write-Host "   - Root Directory: backend"
Write-Host "   - Runtime: Node"
Write-Host "   - Build Command: npm install"
Write-Host "   - Start Command: npm start"
Write-Host ""
Write-Host "6. Add these environment variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Copy and paste these into Render:" -ForegroundColor White
Write-Host "   ────────────────────────────────────" -ForegroundColor Gray
Write-Host "NODE_ENV=production"
Write-Host "PORT=5000"
Write-Host "MONGO_URI=$MONGO_URI"
Write-Host "JWT_SECRET=$JWT_SECRET"
Write-Host "JWT_EXPIRE=7d"
Write-Host "CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME"
Write-Host "CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY"
Write-Host "CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"
Write-Host "RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID"
Write-Host "RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET"
Write-Host "GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY"
Write-Host "FRONTEND_URL=https://YOUR_FRONTEND_URL.vercel.app"
Write-Host "SOCKET_IO_CORS_ORIGIN=https://YOUR_FRONTEND_URL.vercel.app"
Write-Host "ADMIN_EMAIL=theprincepratap@gmail.com"
Write-Host "ADMIN_PASSWORD=ChangeThisPassword123!"
Write-Host "ADMIN_NAME=Admin"
Write-Host "ADMIN_PHONE=9999999999"
Write-Host "   ────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Click 'Create Web Service'"
Write-Host ""
Write-Host "Press Enter after backend is deployed..." -ForegroundColor Yellow
$null = Read-Host

$BACKEND_URL = Read-Host "Enter your backend URL (e.g., https://yourapp.onrender.com)"
Write-Host "✓ Backend URL saved" -ForegroundColor Green
Write-Host ""

# Step 5: Frontend Deployment Instructions
Write-Host "🌐 Step 5: Frontend Deployment (Vercel)" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://vercel.com/"
Write-Host "2. Sign up with GitHub"
Write-Host "3. Click 'Add New...' → 'Project'"
Write-Host "4. Import your repository"
Write-Host "5. Configure:"
Write-Host "   - Framework: Vite"
Write-Host "   - Root Directory: frontend"
Write-Host "   - Build Command: npm run build"
Write-Host "   - Output Directory: dist"
Write-Host ""
Write-Host "6. Add environment variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "VITE_API_URL=$BACKEND_URL"
Write-Host "VITE_SOCKET_URL=$BACKEND_URL"
Write-Host ""
Write-Host "7. Click 'Deploy'"
Write-Host ""
Write-Host "Press Enter after frontend is deployed..." -ForegroundColor Yellow
$null = Read-Host

$FRONTEND_URL = Read-Host "Enter your frontend URL (e.g., https://yourapp.vercel.app)"
Write-Host ""

# Step 6: Update Backend CORS
Write-Host "🔄 Step 6: Update Backend CORS" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Go back to Render and update these environment variables:" -ForegroundColor Red
Write-Host ""
Write-Host "FRONTEND_URL=$FRONTEND_URL"
Write-Host "SOCKET_IO_CORS_ORIGIN=$FRONTEND_URL"
Write-Host ""
Write-Host "Then redeploy your backend service."
Write-Host ""
Write-Host "Press Enter when done..." -ForegroundColor Yellow
$null = Read-Host

# Final Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your application is now live:" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Frontend: $FRONTEND_URL"
Write-Host "  🖥️  Backend:  $BACKEND_URL"
Write-Host "  🗄️  Database: MongoDB Atlas"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Test authentication: $FRONTEND_URL/login"
Write-Host "  2. Create admin user via MongoDB"
Write-Host "  3. Test worker search"
Write-Host "  4. Create test bookings"
Write-Host "  5. Set up monitoring (UptimeRobot)"
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT_GUIDE.md"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Save deployment info
$deploymentInfo = @"
Deployment Information
=====================

Date: $(Get-Date)

Frontend URL: $FRONTEND_URL
Backend URL: $BACKEND_URL

MongoDB URI: $MONGO_URI
JWT Secret: $JWT_SECRET

Cloudinary: $CLOUDINARY_CLOUD_NAME
Razorpay: $RAZORPAY_KEY_ID
Google Maps: $GOOGLE_MAPS_API_KEY

Next Steps:
1. Test application
2. Create admin user
3. Set up monitoring
4. Configure custom domain (optional)
"@

$deploymentInfo | Out-File -FilePath "deployment-info.txt" -Encoding UTF8

Write-Host ""
Write-Host "Deployment info saved to: deployment-info.txt" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Happy deploying!" -ForegroundColor Cyan
