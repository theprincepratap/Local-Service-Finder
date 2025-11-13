# 🔧 Local Service Finder# 🔧 Local Worker Finder Application



<div align="center">A full-stack MERN application that connects users with local service workers (plumbers, electricians, cleaners, etc.) based on location, ratings, and availability.



![Local Service Finder](https://img.shields.io/badge/Local%20Service%20Finder-Connect%20with%20Local%20Workers-blue?style=for-the-badge)**Project by:** Prince Kumar  

**Tech Stack:** MongoDB, Express.js, React.js, Node.js (MERN)  

**Your One-Stop Platform for Finding and Booking Local Service Professionals****Purpose:** College Project + Real-world Product



[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)---

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)## 📋 Table of Contents

[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6.0-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)- [Features](#features)

- [Tech Stack](#tech-stack)

[🚀 Features](#-features) • [📸 Screenshots](#-screenshots) • [🛠️ Tech Stack](#️-tech-stack) • [⚡ Quick Start](#-quick-start) • [📖 Documentation](#-documentation)- [Project Structure](#project-structure)

- [Installation](#installation)

</div>- [Configuration](#configuration)

- [Running the Application](#running-the-application)

---- [API Documentation](#api-documentation)

- [Database Schema](#database-schema)

## 🌟 About- [Development Roadmap](#development-roadmap)

- [Contributing](#contributing)

**Local Service Finder** is a modern, full-stack web application that bridges the gap between users and local service professionals. Whether you need a plumber, electrician, carpenter, or any other service professional, our platform makes it easy to find, book, and track workers in real-time.

---

### 🎯 Key Highlights

## ✨ Features

- 🗺️ **Real-Time Worker Tracking** - Live GPS tracking with interactive maps

- 💰 **Secure Payment System** - Integrated Razorpay payment gateway### User Features

- 🔐 **Dual Login System** - Separate portals for users and workers- 🔐 User authentication (JWT-based)

- 📱 **Responsive Design** - Works seamlessly on all devices- 🔍 Search nearby workers by location, category, and ratings

- 🚀 **Socket.IO Integration** - Real-time updates and notifications- 📅 Book workers for services

- 🤖 **AI-Powered Search** - Smart worker recommendations- 💳 Online payment integration (Razorpay)

- 👨‍💼 **Admin Dashboard** - Complete platform management system- ⭐ Rate and review workers

- 📍 Real-time worker tracking (Socket.IO)

---- 📊 Booking history and management



## ✨ Features### Worker Features

- 👷 Worker registration and profile management

### For Users 👥- 📋 Job request management (accept/reject)

- 💰 Earnings dashboard

| Feature | Description |- 🔔 Real-time booking notifications

|---------|-------------|- ⏰ Availability management

| 🔍 **Smart Search** | Find workers by category, location, and skills with AI-powered recommendations |- 📈 Performance analytics

| 📅 **Easy Booking** | Book services with flexible scheduling and instant confirmation |

| 🗺️ **Live Tracking** | Track worker location in real-time with ETA calculations |### Admin Features

| 💳 **Wallet System** | Add money to wallet and pay securely through Razorpay |- 👥 User and worker management

| ⭐ **Rating & Reviews** | Rate and review workers after service completion |- ✅ Worker verification system

| 📱 **Notifications** | Get real-time updates on booking status via Socket.IO |- 📊 Platform analytics and statistics

| 📊 **Booking History** | View all past and current bookings in one place |- 💼 Service category management

- 🎫 Complaint handling

### For Workers 🛠️

---

| Feature | Description |

|---------|-------------|## 🛠️ Tech Stack

| 📋 **Job Management** | View and manage all booking requests in one dashboard |

| ✅ **Accept/Reject** | Quick accept or reject functionality for bookings |### Frontend

| 🚗 **Journey Tracking** | Start journey with automatic GPS tracking enabled |- **React.js** - UI library

| 💰 **Earnings Dashboard** | Track earnings, pending payments, and wallet balance |- **Vite** - Build tool

| 🔔 **Real-time Alerts** | Instant notifications for new booking requests |- **Tailwind CSS** - Styling

| 📍 **Location Services** | Automatic location updates for better visibility |- **React Router** - Navigation

| 👤 **Profile Management** | Update skills, photos, and service details |- **React Query (TanStack Query)** - Data fetching

- **Zustand** - State management

### For Admins 👨‍💼- **Socket.IO Client** - Real-time updates

- **Axios** - HTTP client

| Feature | Description |- **React Leaflet** - Maps integration

|---------|-------------|

| 📊 **Analytics Dashboard** | Comprehensive overview of platform statistics |### Backend

| 👥 **User Management** | View, edit, and manage all users |- **Node.js** - Runtime environment

| 🛠️ **Worker Verification** | Approve or reject worker registrations |- **Express.js** - Web framework

| 📈 **Revenue Tracking** | Monitor platform earnings and transaction history |- **MongoDB** - Database

| 🔧 **Booking Management** | View and manage all bookings across the platform |- **Mongoose** - ODM

| ⚙️ **System Controls** | Platform-wide settings and configurations |- **JWT** - Authentication

- **Socket.IO** - Real-time communication

---- **Bcrypt** - Password hashing

- **Multer** - File uploads

## 📸 Screenshots- **Cloudinary** - Image storage

- **Razorpay** - Payment gateway

<div align="center">

---

### 🏠 Home Page

*Beautiful landing page with category search*## 📁 Project Structure



### 🗺️ Real-Time Tracking```

*Live worker location tracking with interactive maps*LocalServiceFinderApp/

├── backend/

### 💼 Worker Dashboard│   ├── config/

*Comprehensive dashboard for managing jobs and earnings*│   │   └── db.js                 # MongoDB connection

│   ├── controllers/

### 👨‍💼 Admin Panel│   │   ├── auth.controller.js    # Authentication logic

*Powerful admin controls for platform management*│   │   ├── worker.controller.js  # Worker management

│   │   └── booking.controller.js # Booking management

</div>│   ├── middleware/

│   │   └── auth.middleware.js    # JWT authentication

---│   ├── models/

│   │   ├── User.model.js         # User schema

## 🛠️ Tech Stack│   │   ├── Worker.model.js       # Worker schema

│   │   ├── Booking.model.js      # Booking schema

### Frontend 🎨│   │   ├── Review.model.js       # Review schema

│   │   └── Payment.model.js      # Payment schema

```javascript│   ├── routes/

- React 18.2.0          // UI Library│   │   ├── auth.routes.js        # Auth routes

- Vite 5.0.0            // Build Tool│   │   ├── worker.routes.js      # Worker routes

- Zustand               // State Management│   │   ├── booking.routes.js     # Booking routes

- React Router v6       // Routing│   │   ├── review.routes.js      # Review routes

- Tailwind CSS          // Styling│   │   ├── payment.routes.js     # Payment routes

- React Leaflet 4.2.1   // Maps Integration│   │   └── admin.routes.js       # Admin routes

- Socket.IO Client      // Real-time Communication│   ├── utils/

- Axios                 // API Requests│   │   ├── auth.utils.js         # Auth helpers

- React Query           // Data Fetching│   │   ├── location.utils.js     # Geospatial calculations

- React Hot Toast       // Notifications│   │   └── helpers.js            # General utilities

```│   ├── .env.example              # Environment variables template

│   ├── .gitignore

### Backend ⚙️│   ├── package.json

│   └── server.js                 # Entry point

```javascript│

- Node.js 18+           // Runtime├── frontend/

- Express.js 4.18.2     // Web Framework│   ├── public/

- MongoDB Atlas         // Database│   ├── src/

- Mongoose 8.0.0        // ODM│   │   ├── components/

- Socket.IO 4.6.0       // WebSocket Server│   │   │   ├── Navbar.jsx

- JWT                   // Authentication│   │   │   └── Footer.jsx

- Bcrypt.js             // Password Hashing│   │   ├── pages/

- Multer                // File Upload│   │   │   ├── Home.jsx

- Cloudinary            // Image Storage│   │   │   ├── Login.jsx

- Razorpay              // Payment Gateway│   │   │   ├── Register.jsx

- Nodemailer            // Email Service│   │   │   ├── WorkerSearch.jsx

```│   │   │   ├── WorkerProfile.jsx

│   │   │   ├── Dashboard.jsx

### External Services 🌐│   │   │   ├── BookingPage.jsx

│   │   │   └── NotFound.jsx

- **MongoDB Atlas** - Cloud Database│   │   ├── services/

- **Cloudinary** - Image & Media Management│   │   │   ├── api.js            # Axios instance

- **Razorpay** - Payment Processing│   │   │   └── apiService.js     # API methods

- **Google Maps API** - Geocoding & Location Services│   │   ├── store/

- **OpenStreetMap** - Map Tiles for Leaflet│   │   │   └── authStore.js      # Zustand auth store

- **Render/Vercel** - Deployment Platforms│   │   ├── App.jsx

│   │   ├── main.jsx

---│   │   └── index.css

│   ├── .gitignore

## ⚡ Quick Start│   ├── index.html

│   ├── package.json

### Prerequisites│   ├── vite.config.js

│   ├── tailwind.config.js

Before you begin, ensure you have the following installed:│   └── postcss.config.js

│

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)└── README.md

- **npm** (v9 or higher) - Comes with Node.js```

- **MongoDB** (Local or Atlas account) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- **Git** - [Download](https://git-scm.com/)---



### 📥 Installation## 🚀 Installation



1. **Clone the repository**### Prerequisites

- Node.js (v16 or higher)

```bash- MongoDB (local or MongoDB Atlas)

git clone https://github.com/theprincepratap/Local-Service-Finder.git- npm or yarn

cd Local-Service-Finder- Git

```

### Clone Repository

2. **Install Backend Dependencies**```bash

git clone <your-repository-url>

```bashcd LocalServiceFinderApp

cd backend```

npm install

```### Backend Setup

```bash

3. **Install Frontend Dependencies**cd backend

npm install

```bash```

cd ../frontend

npm install### Frontend Setup

``````bash

cd frontend

### 🔐 Environment Setupnpm install

```

4. **Backend Configuration**

---

Create a `.env` file in the `backend` folder:

## ⚙️ Configuration

```env

# Server Configuration### Backend Configuration

NODE_ENV=development

PORT=50001. Create `.env` file in the `backend` directory:



# Database```bash

MONGO_URI=your_mongodb_connection_stringcd backend

cp .env.example .env

# JWT Configuration```

JWT_SECRET=your_super_secret_jwt_key

JWT_EXPIRE=7d2. Update `.env` with your credentials:



# Cloudinary (Image Storage)```env

CLOUDINARY_CLOUD_NAME=your_cloud_name# Server

CLOUDINARY_API_KEY=your_api_keyPORT=5000

CLOUDINARY_API_SECRET=your_api_secretNODE_ENV=development



# Razorpay (Payment Gateway)# Database

RAZORPAY_KEY_ID=your_razorpay_key_idMONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/localworker?retryWrites=true&w=majority

RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# JWT

# Google Maps APIJWT_SECRET=your_super_secret_jwt_key

GOOGLE_MAPS_API_KEY=your_google_maps_api_keyJWT_EXPIRE=7d



# Frontend URL (for CORS)# Cloudinary

FRONTEND_URL=http://localhost:5173CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

# Admin CredentialsCLOUDINARY_API_SECRET=your_api_secret

ADMIN_EMAIL=admin@localservicefinder.com

ADMIN_PASSWORD=Admin@123# Razorpay

ADMIN_NAME=Super AdminRAZORPAY_KEY_ID=your_razorpay_key_id

ADMIN_PHONE=1234567890RAZORPAY_KEY_SECRET=your_razorpay_key_secret

```

# Google Maps

5. **Frontend Configuration**GOOGLE_MAPS_API_KEY=your_google_maps_api_key



Create a `.env` file in the `frontend` folder:# Frontend URL

FRONTEND_URL=http://localhost:5173

```env```

VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000### Frontend Configuration

```

Create `.env` file in the `frontend` directory:

### 🚀 Running the Application

```env

6. **Start Backend Server**VITE_API_URL=http://localhost:5000/api

```

```bash

cd backend---

npm start

# or for development with nodemon## 🏃 Running the Application

npm run dev

```### Development Mode



Server will run on `http://localhost:5000`#### Start Backend Server

```bash

7. **Start Frontend Development Server**cd backend

npm run dev

```bash```

cd frontendServer runs on: `http://localhost:5000`

npm run dev

```#### Start Frontend Development Server

```bash

Frontend will run on `http://localhost:5173`cd frontend

npm run dev

### 👤 Create Admin Account```

Frontend runs on: `http://localhost:5173`

8. **Run Admin Creation Script**

### Production Mode

```bash

cd backend#### Build Frontend

node scripts/createAdmin.js```bash

```cd frontend

npm run build

### 🎉 Access the Application```



- **Frontend**: http://localhost:5173#### Start Backend

- **Backend API**: http://localhost:5000/api```bash

- **Admin Panel**: http://localhost:5173/admincd backend

npm start

---```



## 📖 Documentation---



### 📚 Available Documentation## 📡 API Documentation



- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete guide for deploying to production### Authentication Routes

- **[Final Report](docs/Final_Report_LocalServiceFinderApp.md)** - Comprehensive project documentation

- **[API Documentation](#)** - RESTful API endpoints reference#### Register User

```http

### 🔑 Key API EndpointsPOST /api/auth/register

Content-Type: application/json

#### Authentication

- `POST /api/auth/register` - User registration{

- `POST /api/auth/login` - User login  "name": "John Doe",

- `POST /api/auth/worker/register` - Worker registration  "email": "john@example.com",

- `POST /api/auth/worker/login` - Worker login  "password": "password123",

- `POST /api/admin/login` - Admin login  "phone": "9876543210",

  "role": "user",

#### Bookings  "location": {

- `GET /api/bookings` - Get all bookings    "coordinates": [77.5946, 12.9716],

- `POST /api/bookings` - Create new booking    "address": "Bangalore, India"

- `PUT /api/bookings/:id/status` - Update booking status  }

- `PUT /api/bookings/:id/worker-location` - Update worker location}

- `GET /api/bookings/:id/worker-location` - Get worker location```



#### Search & Workers#### Login

- `GET /api/search/workers` - Search workers by location/category```http

- `GET /api/workers/:id` - Get worker detailsPOST /api/auth/login

- `PUT /api/workers/profile` - Update worker profileContent-Type: application/json



#### Payments{

- `POST /api/wallet/add` - Add money to wallet  "email": "john@example.com",

- `POST /api/payment/verify` - Verify Razorpay payment  "password": "password123"

}

---```



## 🔄 Booking Workflow#### Get Current User

```http

```mermaidGET /api/auth/me

graph LRAuthorization: Bearer <token>

    A[User Searches] --> B[Select Worker]```

    B --> C[Create Booking]

    C --> D{Worker Response}### Worker Routes

    D -->|Accept| E[Status: Confirmed]

    D -->|Reject| F[Refund to Wallet]#### Get Nearby Workers

    E --> G[Start Journey]```http

    G --> H[Status: On-the-way]GET /api/workers/nearby?longitude=77.5946&latitude=12.9716&maxDistance=10000&category=Plumber

    H --> I[GPS Tracking Active]```

    I --> J[Arrive & Start]

    J --> K[Status: In-Progress]#### Register as Worker

    K --> L[Complete Job]```http

    L --> M[Status: Completed]POST /api/workers/register

    M --> N[Payment to Worker]Authorization: Bearer <token>

```Content-Type: application/json



---{

  "skills": ["Plumbing", "Pipe Repair"],

## 🗺️ Real-Time Location Tracking  "categories": ["Plumber"],

  "experience": 5,

### How It Works  "pricePerHour": 300,

  "location": {

1. **Worker Accepts Booking** → Status changes to `confirmed`    "coordinates": [77.5946, 12.9716]

2. **Worker Clicks "Start Journey"** → Status changes to `on-the-way`  }

3. **GPS Tracking Enabled** → Browser's `navigator.geolocation.watchPosition()` activated}

4. **Location Updates** → Worker's location sent to server every 5 seconds```

5. **User Sees Map** → Live tracking with distance and ETA calculations

6. **Socket.IO Push** → Real-time updates without page refresh### Booking Routes



### Technologies Used#### Create Booking

```http

- **Frontend**: React Leaflet (OpenStreetMap tiles)POST /api/bookings

- **Backend**: Geospatial queries with MongoDBAuthorization: Bearer <token>

- **Real-time**: Socket.IO for instant updatesContent-Type: application/json

- **Calculations**: Haversine formula for distance, average speed for ETA

{

---  "workerId": "worker_id",

  "serviceType": "Plumbing",

## 💰 Payment Flow  "scheduledDate": "2024-01-15",

  "scheduledTime": "10:00 AM",

### Wallet System  "totalPrice": 500,

  "location": {

1. User adds money to wallet via Razorpay    "coordinates": [77.5946, 12.9716],

2. Booking creation deducts amount from user wallet    "address": "123 Street, Bangalore"

3. Amount moves to worker's pending earnings  }

4. On completion, money transfers to worker wallet}

5. On rejection/cancellation, automatic refund to user```



### Transaction Safety#### Get User Bookings

```http

- ✅ **MongoDB Transactions** - ACID complianceGET /api/bookings/my-bookings?status=pending&page=1&limit=10

- ✅ **Razorpay Integration** - Secure payment gatewayAuthorization: Bearer <token>

- ✅ **Signature Verification** - Prevent payment tampering```

- ✅ **Rollback Support** - Automatic refunds on failure

---

---

## 🗄️ Database Schema

## 🚀 Deployment

### User Schema

### Quick Deploy with Scripts- name, email, password, phone, role

- location (GeoJSON Point)

We provide automated deployment scripts for easy setup:- profileImage, isActive, isVerified



**For Windows (PowerShell):**### Worker Schema

```powershell- userId (ref: User)

.\deploy.ps1- skills, categories, experience, pricePerHour

```- rating, totalReviews

- location (GeoJSON Point with 2dsphere index)

**For Linux/Mac (Bash):**- availability, verified, totalJobs, completedJobs, totalEarnings

```bash

chmod +x deploy.sh### Booking Schema

./deploy.sh- userId, workerId

```- serviceType, scheduledDate, scheduledTime

- location, status, paymentStatus, totalPrice

### Manual Deployment- platformFee, workerEarning



Refer to our comprehensive [Deployment Guide](DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying to:### Review Schema

- bookingId, userId, workerId

- 🌐 **Render** (Backend)- rating, comment

- ⚡ **Vercel** (Frontend)- categories (punctuality, quality, behavior, value)

- 🗄️ **MongoDB Atlas** (Database)

- 🚂 **Railway** (Alternative Full-Stack)### Payment Schema

- bookingId, userId, workerId

---- amount, status, paymentMethod

- transactionId, razorpayOrderId

## 🤝 Contributing

---

Contributions are welcome! Please follow these steps:

## 🛣️ Development Roadmap

1. Fork the repository

2. Create your feature branch (`git checkout -b feature/AmazingFeature`)### ✅ Phase 1: Setup (Completed)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)- [x] Project initialization

4. Push to the branch (`git push origin feature/AmazingFeature`)- [x] Database models

5. Open a Pull Request- [x] Authentication system

- [x] Basic API routes

### 📋 Contribution Guidelines- [x] Frontend setup with React + Vite



- Follow the existing code style### 🚧 Phase 2: Core Features (In Progress)

- Write clear commit messages- [ ] Worker search with geospatial queries

- Add comments for complex logic- [ ] Booking system

- Test your changes thoroughly- [ ] Payment integration (Razorpay)

- Update documentation if needed- [ ] Review and rating system



---### 📅 Phase 3: Real-time Features (Upcoming)

- [ ] Socket.IO integration

## 🐛 Troubleshooting- [ ] Real-time booking updates

- [ ] Worker location tracking

### Common Issues- [ ] Chat system



**Issue: MongoDB Connection Error**### 📅 Phase 4: Admin Panel (Upcoming)

```bash- [ ] Admin dashboard

Error: connect ECONNREFUSED- [ ] Worker verification

```- [ ] Analytics and reports

**Solution:** Check your MongoDB URI in `.env` and ensure MongoDB is running- [ ] User management



**Issue: Cloudinary Upload Fails**### 📅 Phase 5: Advanced Features (Future)

```bash- [ ] Push notifications

Error: Upload failed- [ ] AI-based worker recommendations

```- [ ] Multi-language support

**Solution:** Verify Cloudinary credentials in `.env` file- [ ] Mobile app (React Native)



**Issue: Payment Verification Fails**---

```bash

Error: Invalid signature## 📚 DSA Concepts Used

```

**Solution:** Ensure Razorpay key and secret are correctly configured- **Sorting**: QuickSort for worker ranking (by distance, rating, price)

- **Searching**: Binary search for fast lookups

**Issue: Socket.IO Connection Failed**- **Geospatial Algorithms**: Haversine formula for distance calculation

```bash- **Hashing**: Password hashing, token generation, fast data access

WebSocket connection failed- **Priority Queue**: Job allocation based on worker rating

```- **Graph Theory**: Future - shortest path between user and worker

**Solution:** Check CORS settings in backend and VITE_SOCKET_URL in frontend

---

For more troubleshooting help, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#troubleshooting)

## 🔒 Security Features

---

- ✅ Password hashing with bcrypt

## 📊 Project Statistics- ✅ JWT-based authentication

- ✅ CORS protection

- **Total Files**: 250+- ✅ Helmet.js for HTTP headers

- **Lines of Code**: 25,000+- ✅ Input validation

- **Components**: 30+- ✅ Rate limiting (to be implemented)

- **API Endpoints**: 40+- ✅ SQL injection prevention (MongoDB)

- **Database Models**: 6

- **Real-time Events**: 10+---



---## 🤝 Contributing



## 🔒 Security FeaturesThis is a college project, but contributions and suggestions are welcome!



- 🔐 **JWT Authentication** - Secure token-based auth1. Fork the repository

- 🔒 **Password Hashing** - Bcrypt with salt rounds2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

- 🛡️ **CORS Protection** - Configured allowed origins3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

- ✅ **Input Validation** - Mongoose schema validation4. Push to the branch (`git push origin feature/AmazingFeature`)

- 🚫 **SQL Injection Prevention** - NoSQL with Mongoose5. Open a Pull Request

- 🔑 **Environment Variables** - Sensitive data protection

- 👤 **Role-Based Access** - User, Worker, Admin roles---



---## 📄 License



## 📝 LicenseThis project is for educational purposes.



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.---



---## 👨‍💻 Author



## 👨‍💻 Author**Prince Kumar**  

- College Project + Portfolio Product

**Prince Pratap**- MERN Stack Developer



- GitHub: [@theprincepratap](https://github.com/theprincepratap)---

- Repository: [Local-Service-Finder](https://github.com/theprincepratap/Local-Service-Finder)

## 🙏 Acknowledgments

---

- VIT College

## 🙏 Acknowledgments- MERN Stack Community

- Open Source Contributors

- React & Vite communities for excellent documentation

- MongoDB for the powerful database platform---

- Socket.IO for real-time capabilities

- OpenStreetMap for free map tiles## 📞 Support

- All contributors and supporters

For any queries or issues:

---- Create an issue in the repository

- Contact: [Your Email]

## 📞 Support

---

If you encounter any issues or have questions:

## 🎯 Next Steps

1. Check the [Troubleshooting](#-troubleshooting) section

2. Review the [Deployment Guide](DEPLOYMENT_GUIDE.md)1. **Install Dependencies**:

3. Open an issue on [GitHub Issues](https://github.com/theprincepratap/Local-Service-Finder/issues)   ```bash

   cd backend && npm install

---   cd ../frontend && npm install

   ```

<div align="center">

2. **Setup MongoDB Atlas**:

### ⭐ Star this repository if you find it helpful!   - Create account at mongodb.com

   - Create cluster and get connection string

**Made with ❤️ for connecting local service professionals with customers**   - Add to `.env` file



[⬆ Back to Top](#-local-service-finder)3. **Get API Keys**:

   - Cloudinary: cloudinary.com

</div>   - Razorpay: razorpay.com

   - Google Maps: console.cloud.google.com

4. **Run Application**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Test the Application**:
   - Open `http://localhost:5173`
   - Register a user
   - Register as worker
   - Test booking flow

---

**Happy Coding! 🚀**
