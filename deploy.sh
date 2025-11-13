#!/bin/bash

# LocalServiceFinderApp - Quick Deployment Script
# This script helps you deploy the application step by step

echo "🚀 LocalServiceFinderApp Deployment Helper"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if command_exists node; then
    echo -e "${GREEN}✓${NC} Node.js is installed: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js is not installed. Please install it first."
    exit 1
fi

if command_exists npm; then
    echo -e "${GREEN}✓${NC} npm is installed: $(npm --version)"
else
    echo -e "${RED}✗${NC} npm is not installed."
    exit 1
fi

if command_exists git; then
    echo -e "${GREEN}✓${NC} Git is installed: $(git --version)"
else
    echo -e "${RED}✗${NC} Git is not installed."
    exit 1
fi

echo ""
echo "=========================================="
echo ""

# Step 1: GitHub Repository
echo "📦 Step 1: GitHub Repository"
echo "----------------------------"
echo ""
echo "Have you pushed your code to GitHub? (y/n)"
read -r github_ready

if [ "$github_ready" != "y" ]; then
    echo ""
    echo "Please run these commands first:"
    echo ""
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git branch -M main"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/LocalServiceFinderApp.git"
    echo "  git push -u origin main"
    echo ""
    exit 0
fi

echo -e "${GREEN}✓${NC} GitHub repository ready"
echo ""

# Step 2: MongoDB Atlas
echo "🗄️  Step 2: MongoDB Atlas Setup"
echo "-------------------------------"
echo ""
echo "Have you created a MongoDB Atlas cluster? (y/n)"
read -r mongodb_ready

if [ "$mongodb_ready" != "y" ]; then
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Go to: https://cloud.mongodb.com/"
    echo "2. Create a FREE cluster (M0)"
    echo "3. Add a database user"
    echo "4. Whitelist IP: 0.0.0.0/0"
    echo "5. Get your connection string"
    echo ""
    echo "Press Enter when done..."
    read -r
fi

echo "Enter your MongoDB URI:"
read -r MONGO_URI
echo -e "${GREEN}✓${NC} MongoDB URI saved"
echo ""

# Step 3: Third-party Services
echo "🔑 Step 3: Third-party Service Keys"
echo "------------------------------------"
echo ""

echo "Do you have Cloudinary account? (y/n)"
read -r has_cloudinary

if [ "$has_cloudinary" = "y" ]; then
    echo "Enter Cloudinary Cloud Name:"
    read -r CLOUDINARY_CLOUD_NAME
    echo "Enter Cloudinary API Key:"
    read -r CLOUDINARY_API_KEY
    echo "Enter Cloudinary API Secret:"
    read -r CLOUDINARY_API_SECRET
else
    echo -e "${YELLOW}⚠${NC} Skipping Cloudinary (image uploads will not work)"
    CLOUDINARY_CLOUD_NAME="not_set"
    CLOUDINARY_API_KEY="not_set"
    CLOUDINARY_API_SECRET="not_set"
fi

echo ""
echo "Do you have Razorpay account? (y/n)"
read -r has_razorpay

if [ "$has_razorpay" = "y" ]; then
    echo "Enter Razorpay Key ID:"
    read -r RAZORPAY_KEY_ID
    echo "Enter Razorpay Key Secret:"
    read -r RAZORPAY_KEY_SECRET
else
    echo -e "${YELLOW}⚠${NC} Skipping Razorpay (payments will not work)"
    RAZORPAY_KEY_ID="not_set"
    RAZORPAY_KEY_SECRET="not_set"
fi

echo ""
echo "Do you have Google Maps API Key? (y/n)"
read -r has_maps

if [ "$has_maps" = "y" ]; then
    echo "Enter Google Maps API Key:"
    read -r GOOGLE_MAPS_API_KEY
else
    echo -e "${YELLOW}⚠${NC} Skipping Google Maps (maps may not work)"
    GOOGLE_MAPS_API_KEY="not_set"
fi

echo ""
echo -e "${GREEN}✓${NC} Service keys collected"
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)

# Step 4: Backend Deployment Instructions
echo "🖥️  Step 4: Backend Deployment (Render)"
echo "---------------------------------------"
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: https://render.com/"
echo "2. Sign up with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your repository"
echo "5. Configure:"
echo "   - Name: localservicefinder-api"
echo "   - Root Directory: backend"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo ""
echo "6. Add these environment variables:"
echo ""
echo "   Copy and paste these into Render:"
echo "   ────────────────────────────────────"
echo "   NODE_ENV=production"
echo "   PORT=5000"
echo "   MONGO_URI=$MONGO_URI"
echo "   JWT_SECRET=$JWT_SECRET"
echo "   JWT_EXPIRE=7d"
echo "   CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME"
echo "   CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY"
echo "   CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"
echo "   RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID"
echo "   RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET"
echo "   GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY"
echo "   FRONTEND_URL=https://YOUR_FRONTEND_URL.vercel.app"
echo "   SOCKET_IO_CORS_ORIGIN=https://YOUR_FRONTEND_URL.vercel.app"
echo "   ADMIN_EMAIL=theprincepratap@gmail.com"
echo "   ADMIN_PASSWORD=ChangeThisPassword123!"
echo "   ADMIN_NAME=Admin"
echo "   ADMIN_PHONE=9999999999"
echo "   ────────────────────────────────────"
echo ""
echo "7. Click 'Create Web Service'"
echo ""
echo "Press Enter after backend is deployed..."
read -r

echo "Enter your backend URL (e.g., https://yourapp.onrender.com):"
read -r BACKEND_URL
echo -e "${GREEN}✓${NC} Backend URL saved"
echo ""

# Step 5: Frontend Deployment Instructions
echo "🌐 Step 5: Frontend Deployment (Vercel)"
echo "---------------------------------------"
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: https://vercel.com/"
echo "2. Sign up with GitHub"
echo "3. Click 'Add New...' → 'Project'"
echo "4. Import your repository"
echo "5. Configure:"
echo "   - Framework: Vite"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo ""
echo "6. Add environment variable:"
echo ""
echo "   VITE_API_URL=$BACKEND_URL"
echo "   VITE_SOCKET_URL=$BACKEND_URL"
echo ""
echo "7. Click 'Deploy'"
echo ""
echo "Press Enter after frontend is deployed..."
read -r

echo "Enter your frontend URL (e.g., https://yourapp.vercel.app):"
read -r FRONTEND_URL
echo ""

# Step 6: Update Backend CORS
echo "🔄 Step 6: Update Backend CORS"
echo "-------------------------------"
echo ""
echo "IMPORTANT: Go back to Render and update these environment variables:"
echo ""
echo "   FRONTEND_URL=$FRONTEND_URL"
echo "   SOCKET_IO_CORS_ORIGIN=$FRONTEND_URL"
echo ""
echo "Then redeploy your backend service."
echo ""
echo "Press Enter when done..."
read -r

# Final Summary
echo ""
echo "=========================================="
echo "🎉 Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now live:"
echo ""
echo "  🌐 Frontend: $FRONTEND_URL"
echo "  🖥️  Backend:  $BACKEND_URL"
echo "  🗄️  Database: MongoDB Atlas"
echo ""
echo "Next steps:"
echo ""
echo "  1. Test authentication: $FRONTEND_URL/login"
echo "  2. Create admin user via MongoDB"
echo "  3. Test worker search"
echo "  4. Create test bookings"
echo "  5. Set up monitoring (UptimeRobot)"
echo ""
echo "For detailed instructions, see:"
echo "  DEPLOYMENT_GUIDE.md"
echo ""
echo "=========================================="

# Save deployment info
cat > deployment-info.txt << EOF
Deployment Information
=====================

Date: $(date)

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
EOF

echo "Deployment info saved to: deployment-info.txt"
echo ""
echo "🚀 Happy deploying!"
