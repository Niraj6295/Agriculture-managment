# 🌾 Smart Agriculture – AI-Powered Monitoring System
### MERN Stack + Groq AI | Full-Stack Application

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (localhost) |
| AI | Groq AI (Llama 3) |
| Maps | Leaflet + OpenStreetMap (free) |
| Weather | Open-Meteo API (free, no key needed) |
| Auth | JWT + bcryptjs + OTP (2FA) |

---

## 🚀 Quick Setup (All on Localhost)

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017
- A free Groq API key from https://console.groq.com

---

### Step 1 — Start MongoDB
```bash
# macOS/Linux
mongod --dbpath /usr/local/var/mongodb

# Windows
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

# Or using Homebrew (macOS)
brew services start mongodb-community
```

---

### Step 2 — Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment (edit .env and add your Groq API key)
# GROQ_API_KEY=your_groq_api_key_here

# Seed database with demo data
node seed.js

# Start backend (development)
npm run dev

# Backend runs at: http://localhost:5000
```

---

### Step 3 — Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend (development)
npm run dev

# Frontend runs at: http://localhost:5173
```

---

### Step 4 — Open the App
Visit **http://localhost:5173** in your browser.

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agri.com | admin123 |
| Farmer | farmer@agri.com | farmer123 |
| Expert | expert@agri.com | expert123 |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_agriculture
JWT_SECRET=smart_agri_jwt_super_secret_key_2024
GROQ_API_KEY=your_groq_api_key_here   # 👈 Required for AI features
GROQ_MODEL=llama3-8b-8192
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOAD_BASE_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
smart-agriculture/
├── start.sh                       # One-command start (Linux/macOS)
├── start-windows.bat              # One-command start (Windows)
├── package.json                   # Root scripts (npm run start)
├── README.md
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # JWT auth, 2FA, OTP, changePassword
│   │   ├── cropController.js      # CRUD + dashboard stats
│   │   ├── aiController.js        # Groq AI chatbot + disease + soil
│   │   ├── adminController.js     # Admin panel + broadcast
│   │   └── dataControllers.js     # Soil, weather, irrigation, alerts
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + RBAC + activity log
│   │   ├── uploadMiddleware.js    # Multer local file uploads
│   │   └── validateMiddleware.js  # Input validation + sanitize
│   ├── models/
│   │   ├── User.js                # User (admin/farmer/expert) + 2FA
│   │   ├── Crop.js                # Crop + AI disease analysis history
│   │   ├── SoilData.js            # Soil readings
│   │   └── misc.js                # WeatherData, Irrigation, Alert, AILog
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   ├── cropRoutes.js          # /api/crops/*
│   │   ├── soilRoutes.js          # /api/soil/*
│   │   ├── weatherRoutes.js       # /api/weather/*
│   │   ├── irrigationRoutes.js    # /api/irrigation/*
│   │   ├── alertRoutes.js         # /api/alerts/*
│   │   ├── aiRoutes.js            # /api/ai/*
│   │   ├── reportRoutes.js        # /api/reports/*
│   │   └── adminRoutes.js         # /api/admin/*
│   ├── uploads/                   # Local image storage (auto-created)
│   ├── seed.js                    # Database seeder with demo data
│   ├── server.js                  # Express entry point
│   ├── .env                       # ← Add your GROQ_API_KEY here
│   └── .gitignore
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── farmer/
    │   │   │   └── CropDetail.jsx   # Crop detail modal + AI history
    │   │   └── shared/
    │   │       ├── Layout.jsx        # Sidebar + topbar + dark mode
    │   │       ├── AlertBadge.jsx    # Live unread alert count
    │   │       └── UI.jsx            # Spinner, Modal, EmptyState, etc.
    │   ├── context/
    │   │   ├── AuthContext.jsx       # JWT auth state
    │   │   └── ThemeContext.jsx      # Dark mode
    │   ├── hooks/
    │   │   ├── useFetch.js           # Reusable data-fetching hook
    │   │   └── useAlerts.js          # Polling unread alert count
    │   ├── pages/
    │   │   ├── LoginPage.jsx         # Login + OTP 2FA verify
    │   │   ├── RegisterPage.jsx      # Registration
    │   │   ├── DashboardPage.jsx     # Stats cards + pie + bar charts
    │   │   ├── CropsPage.jsx         # Full CRUD + image upload + detail
    │   │   ├── SoilPage.jsx          # Soil tracking + trend lines
    │   │   ├── WeatherPage.jsx       # Live weather + 7-day forecast
    │   │   ├── IrrigationPage.jsx    # Schedule management
    │   │   ├── AlertsPage.jsx        # Notifications + mark read
    │   │   ├── AIChatPage.jsx        # Groq AI chatbot
    │   │   ├── DiseasePage.jsx       # AI disease detection
    │   │   ├── MapPage.jsx           # Leaflet field map
    │   │   ├── ReportsPage.jsx       # Farm summary + JSON export
    │   │   ├── ProfilePage.jsx       # Profile + change password + 2FA
    │   │   ├── ExpertPage.jsx        # Expert panel — view farms + advice
    │   │   ├── AdminPage.jsx         # User management + broadcast
    │   │   └── NotFoundPage.jsx      # 404 page
    │   ├── utils/
    │   │   └── api.js                # Axios with JWT interceptor
    │   ├── App.jsx                   # Router + protected routes
    │   ├── index.css                 # Tailwind + global styles
    │   └── main.jsx                  # React entry point
    ├── index.html
    ├── vite.config.js                # Vite + proxy to :5000
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env                          # Frontend env vars
    └── .gitignore
```

---

## 🤖 AI Features (Groq API)

1. **AI Chatbot** — Conversational farming assistant (llama3-8b-8192)
2. **Disease Detection** — Symptom-based crop disease diagnosis
3. **Soil Analysis** — AI recommendations based on soil readings

> Get your free Groq API key at https://console.groq.com (generous free tier)

---

## 🌐 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login + JWT |
| POST | /api/auth/verify-otp | 2FA OTP verification |
| GET | /api/crops | Get farmer's crops |
| POST | /api/crops | Add crop |
| GET | /api/crops/dashboard | Dashboard stats |
| GET | /api/soil | Soil records |
| GET | /api/weather | Weather data |
| GET | /api/irrigation | Irrigation schedules |
| GET | /api/alerts | User alerts |
| POST | /api/ai/chat | AI chatbot |
| POST | /api/ai/disease-detect | Disease detection |
| POST | /api/ai/soil-analysis | Soil AI analysis |
| GET | /api/reports/summary | Farm report |
| GET | /api/admin/stats | Admin dashboard |
| GET | /api/admin/users | All users |

---

## 🏷️ Features Implemented

- ✅ JWT Authentication with role-based access (Admin / Farmer / Expert)
- ✅ Two-Factor Authentication (OTP via email or dev mode)
- ✅ Crop monitoring with full CRUD + image upload
- ✅ Soil data tracking with trend charts
- ✅ Live weather from Open-Meteo (no API key needed)
- ✅ Irrigation scheduling with status tracking
- ✅ Alert & notification system
- ✅ AI chatbot (Groq Llama 3)
- ✅ AI-based crop disease detection
- ✅ AI soil analysis recommendations
- ✅ Geo-location field map (Leaflet + OpenStreetMap)
- ✅ Dashboard analytics with Recharts
- ✅ Dark mode
- ✅ Activity logs & audit tracking
- ✅ Admin panel with user management & broadcast alerts
- ✅ Farm summary reports with JSON export
- ✅ Rate limiting & CORS security
- ✅ Local file storage for crop images

---

## 📌 Notes

- MongoDB must be running locally before starting the backend
- Weather data uses Open-Meteo (completely free, no API key)
- Maps use OpenStreetMap (completely free, no API key)
- AI features require a Groq API key (free tier available)
- All data stored locally — no cloud dependencies
