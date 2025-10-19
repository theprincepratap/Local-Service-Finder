# 🔧 Local Worker Finder Application

A full-stack MERN application that connects users with local service workers (plumbers, electricians, cleaners, etc.) based on location, ratings, and availability.

**Project by:** Prince Kumar  
**Tech Stack:** MongoDB, Express.js, React.js, Node.js (MERN)  
**Purpose:** College Project + Real-world Product

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)

---

## ✨ Features

### User Features
- 🔐 User authentication (JWT-based)
- 🔍 Search nearby workers by location, category, and ratings
- 📅 Book workers for services
- 💳 Online payment integration (Razorpay)
- ⭐ Rate and review workers
- 📍 Real-time worker tracking (Socket.IO)
- 📊 Booking history and management

### Worker Features
- 👷 Worker registration and profile management
- 📋 Job request management (accept/reject)
- 💰 Earnings dashboard
- 🔔 Real-time booking notifications
- ⏰ Availability management
- 📈 Performance analytics

### Admin Features
- 👥 User and worker management
- ✅ Worker verification system
- 📊 Platform analytics and statistics
- 💼 Service category management
- 🎫 Complaint handling

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query (TanStack Query)** - Data fetching
- **Zustand** - State management
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client
- **React Leaflet** - Maps integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway

---

## 📁 Project Structure

```
LocalServiceFinderApp/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── worker.controller.js  # Worker management
│   │   └── booking.controller.js # Booking management
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT authentication
│   ├── models/
│   │   ├── User.model.js         # User schema
│   │   ├── Worker.model.js       # Worker schema
│   │   ├── Booking.model.js      # Booking schema
│   │   ├── Review.model.js       # Review schema
│   │   └── Payment.model.js      # Payment schema
│   ├── routes/
│   │   ├── auth.routes.js        # Auth routes
│   │   ├── worker.routes.js      # Worker routes
│   │   ├── booking.routes.js     # Booking routes
│   │   ├── review.routes.js      # Review routes
│   │   ├── payment.routes.js     # Payment routes
│   │   └── admin.routes.js       # Admin routes
│   ├── utils/
│   │   ├── auth.utils.js         # Auth helpers
│   │   ├── location.utils.js     # Geospatial calculations
│   │   └── helpers.js            # General utilities
│   ├── .env.example              # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── WorkerSearch.jsx
│   │   │   ├── WorkerProfile.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance
│   │   │   └── apiService.js     # API methods
│   │   ├── store/
│   │   │   └── authStore.js      # Zustand auth store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Git

### Clone Repository
```bash
git clone <your-repository-url>
cd LocalServiceFinderApp
```

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

2. Update `.env` with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/localworker?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Create `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Backend
```bash
cd backend
npm start
```

---

## 📡 API Documentation

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "user",
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": "Bangalore, India"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Worker Routes

#### Get Nearby Workers
```http
GET /api/workers/nearby?longitude=77.5946&latitude=12.9716&maxDistance=10000&category=Plumber
```

#### Register as Worker
```http
POST /api/workers/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "skills": ["Plumbing", "Pipe Repair"],
  "categories": ["Plumber"],
  "experience": 5,
  "pricePerHour": 300,
  "location": {
    "coordinates": [77.5946, 12.9716]
  }
}
```

### Booking Routes

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "workerId": "worker_id",
  "serviceType": "Plumbing",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00 AM",
  "totalPrice": 500,
  "location": {
    "coordinates": [77.5946, 12.9716],
    "address": "123 Street, Bangalore"
  }
}
```

#### Get User Bookings
```http
GET /api/bookings/my-bookings?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### User Schema
- name, email, password, phone, role
- location (GeoJSON Point)
- profileImage, isActive, isVerified

### Worker Schema
- userId (ref: User)
- skills, categories, experience, pricePerHour
- rating, totalReviews
- location (GeoJSON Point with 2dsphere index)
- availability, verified, totalJobs, completedJobs, totalEarnings

### Booking Schema
- userId, workerId
- serviceType, scheduledDate, scheduledTime
- location, status, paymentStatus, totalPrice
- platformFee, workerEarning

### Review Schema
- bookingId, userId, workerId
- rating, comment
- categories (punctuality, quality, behavior, value)

### Payment Schema
- bookingId, userId, workerId
- amount, status, paymentMethod
- transactionId, razorpayOrderId

---

## 🛣️ Development Roadmap

### ✅ Phase 1: Setup (Completed)
- [x] Project initialization
- [x] Database models
- [x] Authentication system
- [x] Basic API routes
- [x] Frontend setup with React + Vite

### 🚧 Phase 2: Core Features (In Progress)
- [ ] Worker search with geospatial queries
- [ ] Booking system
- [ ] Payment integration (Razorpay)
- [ ] Review and rating system

### 📅 Phase 3: Real-time Features (Upcoming)
- [ ] Socket.IO integration
- [ ] Real-time booking updates
- [ ] Worker location tracking
- [ ] Chat system

### 📅 Phase 4: Admin Panel (Upcoming)
- [ ] Admin dashboard
- [ ] Worker verification
- [ ] Analytics and reports
- [ ] User management

### 📅 Phase 5: Advanced Features (Future)
- [ ] Push notifications
- [ ] AI-based worker recommendations
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 📚 DSA Concepts Used

- **Sorting**: QuickSort for worker ranking (by distance, rating, price)
- **Searching**: Binary search for fast lookups
- **Geospatial Algorithms**: Haversine formula for distance calculation
- **Hashing**: Password hashing, token generation, fast data access
- **Priority Queue**: Job allocation based on worker rating
- **Graph Theory**: Future - shortest path between user and worker

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers
- ✅ Input validation
- ✅ Rate limiting (to be implemented)
- ✅ SQL injection prevention (MongoDB)

---

## 🤝 Contributing

This is a college project, but contributions and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Prince Kumar**  
- College Project + Portfolio Product
- MERN Stack Developer

---

## 🙏 Acknowledgments

- VIT College
- MERN Stack Community
- Open Source Contributors

---

## 📞 Support

For any queries or issues:
- Create an issue in the repository
- Contact: [Your Email]

---

## 🎯 Next Steps

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup MongoDB Atlas**:
   - Create account at mongodb.com
   - Create cluster and get connection string
   - Add to `.env` file

3. **Get API Keys**:
   - Cloudinary: cloudinary.com
   - Razorpay: razorpay.com
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
