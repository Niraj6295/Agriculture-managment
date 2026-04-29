# 🌾 Smart Agriculture – AI-Powered Monitoring System
### MERN Stack + Groq AI + Razorpay + Socket.io | Full-Stack Application

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (localhost) |
| AI | Groq AI (Llama 3.3-70b) |
| Maps | Leaflet + OpenStreetMap (free) |
| Weather | Open-Meteo API (free, no key needed) |
| Auth | JWT + bcryptjs + OTP (2FA) |
| Real-time | Socket.io (chat) |
| Payments | Razorpay (test + live) |

---

## 🚀 Quick Setup (All on Localhost)

### Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017
- A free Groq API key from https://console.groq.com
- A Razorpay account (test keys) from https://dashboard.razorpay.com

---

### Step 1 — Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

---

### Step 2 — Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure .env (see Environment Variables section below)
# Add your GROQ_API_KEY and RAZORPAY keys

# Seed database with demo data + 60 farmers + 48 marketplace products
node seed.js

# Start backend
npm run dev
# Backend runs at: http://localhost:5000
```

---

### Step 3 — Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
# Frontend runs at: http://localhost:5173
```

---

### Step 4 — Open the App
Visit **http://localhost:5173**

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agri.com | admin123 |
| Farmer | farmer@agri.com | farmer123 |
| Expert | expert@agri.com | expert123 |

---

## 🔑 Environment Variables

### `backend/.env`
```env
# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart_agriculture
JWT_SECRET=smart_agri_jwt_super_secret_key_2024

# Groq AI (get free key from https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Razorpay (get test keys from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> ⚠️ Razorpay key MUST start with `rzp_test_` (not `yrzp_` or anything else)

---

## 📁 Project Structure

```
smart-agriculture/
├── start.sh                        # One-command start (Linux/macOS)
├── start-windows.bat               # One-command start (Windows)
├── README.md
│
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # JWT auth, 2FA, OTP, change password
│   │   ├── cropController.js       # CRUD + dashboard stats
│   │   ├── aiController.js         # Groq AI chatbot + disease + soil
│   │   ├── adminController.js      # Admin panel + broadcast alerts
│   │   ├── dataControllers.js      # Soil, weather, irrigation, alerts
│   │   ├── marketController.js     # Marketplace, cart, orders, Razorpay
│   │   ├── chatController.js       # Real-time chat rooms + requests
│   │   └── fieldController.js      # Field map boundaries + markers
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect + RBAC + activity log
│   │   ├── uploadMiddleware.js     # Multer local file uploads
│   │   └── validateMiddleware.js   # Input validation + sanitize
│   ├── models/
│   │   ├── User.js                 # User (admin/farmer/expert) + 2FA
│   │   ├── Crop.js                 # Crop + AI disease analysis history
│   │   ├── SoilData.js             # Soil readings
│   │   ├── Field.js                # Field map boundaries + markers
│   │   ├── Market.js               # Product, Cart, Order, Recommendation
│   │   ├── Chat.js                 # ChatRequest, ChatRoom, Message
│   │   └── misc.js                 # WeatherData, Irrigation, Alert, AILog
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── soilRoutes.js
│   │   ├── weatherRoutes.js
│   │   ├── irrigationRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── chatRoutes.js
│   │   └── fieldRoutes.js
│   ├── uploads/                    # Local image storage (auto-created)
│   ├── seed.js                     # Seeds 63 users + 48 products + crops
│   ├── server.js                   # Express + Socket.io entry point
│   └── .env                        # ← Add your API keys here
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx     # JWT auth state
        │   ├── ThemeContext.jsx    # Dark mode
        │   ├── SocketContext.jsx   # Socket.io connection
        │   └── ChatContext.jsx     # Persistent chat state across navigation
        ├── components/
        │   ├── farmer/
        │   │   └── CropDetail.jsx  # Crop detail modal + AI history
        │   └── shared/
        │       ├── Layout.jsx      # Role-based sidebar + topbar
        │       ├── AlertBadge.jsx  # Live unread alert count
        │       └── UI.jsx          # Spinner, Modal, EmptyState, etc.
        ├── hooks/
        │   ├── useFetch.js         # Reusable data-fetching hook
        │   └── useAlerts.js        # Polling unread alert count
        ├── pages/
        │   ├── LoginPage.jsx       # Login + OTP 2FA verify
        │   ├── RegisterPage.jsx    # Registration
        │   ├── DashboardPage.jsx   # Role-aware: Admin / Expert / Farmer
        │   ├── CropsPage.jsx       # Full CRUD + image upload + detail modal
        │   ├── SoilPage.jsx        # Soil tracking + trend charts
        │   ├── WeatherPage.jsx     # Live weather + 7-day forecast
        │   ├── IrrigationPage.jsx  # Irrigation schedule management
        │   ├── AlertsPage.jsx      # Notifications + mark read
        │   ├── AIChatPage.jsx      # Groq AI chatbot
        │   ├── DiseasePage.jsx     # AI disease detection
        │   ├── MapPage.jsx         # Leaflet field map + draw boundaries
        │   ├── ReportsPage.jsx     # Role-aware farm summary + JSON export
        │   ├── ProfilePage.jsx     # Profile + change password + 2FA
        │   ├── FarmerChatPage.jsx  # Farmer ↔ Expert real-time chat
        │   ├── ExpertChatPage.jsx  # Expert chat + pin + direct message
        │   ├── MarketplacePage.jsx # Browse, cart, Razorpay checkout, orders
        │   ├── AdminMarketPage.jsx # Admin product management + orders
        │   ├── ExpertRecommendPage.jsx # Expert recommends products to farmers
        │   ├── ExpertPage.jsx      # Expert panel — view all farms
        │   ├── AdminPage.jsx       # Admin panel — user management
        │   └── NotFoundPage.jsx    # 404 page
        └── utils/
            └── api.js              # Axios with JWT interceptor
```

---

## 🤖 AI Features (Groq API)

| Feature | Description |
|---------|-------------|
| AI Chatbot | Conversational farming assistant (Llama 3.3-70b) |
| Disease Detection | Symptom-based crop disease diagnosis with JSON response |
| Soil Analysis | AI recommendations based on soil nutrient readings |

> Get your **free** Groq API key at https://console.groq.com

---

## 👥 Role-Based Access

### 🛡️ Admin
- System dashboard (total users, crops, AI interactions, revenue)
- User management — activate/deactivate/delete users
- Broadcast alerts to all users or specific roles
- Activity logs per user
- **Marketplace Management** — add/edit/delete products with image URLs
- Order management — update order status
- Marketplace revenue + top products stats

### 🌾 Farmer
- Personal dashboard with crop health charts
- Crop management (CRUD + image upload + AI disease history)
- Soil data tracking with trend charts
- Live weather + 7-day forecast
- Irrigation scheduling
- **Field Map** — draw field boundaries on map, place markers, save to DB
- **Expert Chat** — send request to expert, real-time messaging
- **Marketplace** — browse products, add to cart, Razorpay checkout
- Expert product recommendations
- AI chatbot + disease detection
- Reports + JSON export

### 🎓 Expert
- System-wide dashboard (all farms, critical crop alerts)
- **Farmer Chats** — accept/reject requests, start direct chat, pin conversations
- **Recommend Products** — recommend marketplace products to specific farmers
- Expert Panel — view all farmer data
- Disease detection + AI tools
- All-farms report

---

## 💬 Real-Time Chat System

- **Farmer → Expert**: Farmer sends a request with a message; expert accepts or rejects
- **Expert → Farmer**: Expert can start a direct chat without waiting for a request
- **Socket.io**: Live message delivery with typing indicators and online status
- **Pinned Chats**: Experts can pin important farmer conversations to the top
- **Persistent**: Messages stored in MongoDB, survive page navigation and refresh

---

## 🏪 Marketplace + Razorpay

### Flow
1. Admin adds products with images, price, stock
2. Expert recommends products to specific farmers
3. Farmer browses → adds to cart → fills delivery address
4. Razorpay checkout popup → pay with UPI/card/netbanking
5. On success: stock reduced, order saved, alert sent to farmer
6. Admin updates order status (processing → shipped → delivered)

### Test Payment Credentials
| Method | Details |
|--------|---------|
| Card | `4111 1111 1111 1111` · Expiry `12/26` · CVV `123` |
| UPI | `success@razorpay` |
| OTP | `1234` |
| Net Banking | Select any bank → click Success |

---

## 🗺️ Field Map Features

- **Draw Field Boundary** — click map points to draw polygon, auto-calculates area in hectares
- **Place Markers** — named point markers for wells, storage, etc.
- **Field Properties** — soil type, irrigation source, ownership, linked crop, notes
- **3 Map Layers** — Street, Satellite (Esri), Terrain
- **My Location** — GPS button flies to current position
- **Persistent** — all fields saved to MongoDB, survive refresh
- **Color Coding** — 8 color choices per field
- **Edit/Delete** — click any field for detail panel with edit and delete

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login + JWT |
| POST | /api/auth/verify-otp | 2FA OTP verification |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile + photo |
| PUT | /api/auth/change-password | Change password |
| PUT | /api/auth/toggle-2fa | Toggle 2FA |

### Crops
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/crops | Get crops (role-filtered) |
| POST | /api/crops | Add crop |
| GET | /api/crops/dashboard | Dashboard stats |
| PUT | /api/crops/:id | Update crop |
| DELETE | /api/crops/:id | Delete crop |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/ai/chat | AI chatbot |
| POST | /api/ai/disease-detect | Disease detection |
| POST | /api/ai/soil-analysis | Soil AI analysis |
| GET | /api/ai/logs | AI usage logs |

### Marketplace
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/market/products | Browse products |
| POST | /api/market/cart | Add to cart |
| POST | /api/market/orders/create | Create Razorpay order |
| POST | /api/market/orders/verify | Verify payment |
| GET | /api/market/orders/my | My orders |
| POST | /api/market/recommend | Expert recommend product |
| GET | /api/market/recommendations/mine | Farmer's recommendations |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/chat/request | Farmer sends request |
| GET | /api/chat/requests | Expert incoming requests |
| PATCH | /api/chat/requests/:id/respond | Accept/reject |
| POST | /api/chat/start-direct | Expert starts direct chat |
| GET | /api/chat/rooms | Get chat rooms |
| POST | /api/chat/rooms/:id/messages | Send message |
| PATCH | /api/chat/rooms/:id/pin | Expert pin/unpin |

### Field Map
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/fields | Get all fields |
| POST | /api/fields | Save new field/marker |
| PUT | /api/fields/:id | Update field |
| DELETE | /api/fields/:id | Remove field |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/stats | System statistics |
| GET | /api/admin/users | All users |
| PATCH | /api/admin/users/:id/toggle-status | Activate/deactivate |
| DELETE | /api/admin/users/:id | Delete user |
| POST | /api/admin/broadcast-alert | Send alert to all |

---

## ✅ Features Checklist

- ✅ JWT Authentication + Role-based access (Admin / Farmer / Expert)
- ✅ Two-Factor Authentication (OTP via email, dev mode shows in response)
- ✅ Change password
- ✅ Crop monitoring — full CRUD + image upload + AI disease history
- ✅ Soil data tracking with trend line charts
- ✅ Live weather from Open-Meteo (free, no API key)
- ✅ Irrigation scheduling with status management
- ✅ Alert & notification system with unread badge
- ✅ AI Chatbot (Groq Llama 3.3-70b)
- ✅ AI-based crop disease detection (handles object/string/array responses)
- ✅ AI soil analysis recommendations
- ✅ Field Map — draw boundaries, place markers, save to MongoDB
- ✅ 3 map tile layers (Street / Satellite / Terrain)
- ✅ Real-time chat — Socket.io with typing indicators + online status
- ✅ Chat requests system (farmer requests → expert accepts/rejects)
- ✅ Expert can start direct chat with any farmer
- ✅ Expert can pin chats to top
- ✅ Marketplace — 48 products with Unsplash images
- ✅ Shopping cart + address + Razorpay payment gateway
- ✅ Expert product recommendations to farmers
- ✅ Admin product management with image URL inputs + file upload
- ✅ Order status management (admin)
- ✅ Role-aware dashboards (different for Admin / Expert / Farmer)
- ✅ Role-aware Reports (Expert sees all farms, Farmer sees own)
- ✅ Dark mode
- ✅ Activity logs + audit tracking
- ✅ Admin panel — user management + broadcast alerts
- ✅ Rate limiting + CORS security
- ✅ Local file storage for crop and profile images
- ✅ Seeded with 63 users + 48 marketplace products + sample data

---

## 📌 Important Notes

- MongoDB must be running locally before starting the backend
- Weather uses Open-Meteo — completely free, no API key needed
- Maps use OpenStreetMap — completely free, no API key needed
- AI features require Groq API key (free tier: https://console.groq.com)
- Razorpay key **must start with** `rzp_test_` — no typos, no inline comments in .env
- All data stored locally — no cloud database dependencies
- Socket.io enables real-time chat without any additional service
