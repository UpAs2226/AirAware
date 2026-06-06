# AirAware — Full-Stack MERN Application

A full-stack air quality monitoring platform with real-time data, AI health analysis via Groq, and personalized health alerts.

## Project Structure

```
airaware/
├── backend/          # Node.js + Express + MongoDB
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   ├── server.js     # Entry point
│   └── .env          # Environment variables ← Edit this!
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # All page components
        ├── components/
        ├── context/
        └── utils/
```

---

## Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/airaware
JWT_SECRET=your_super_secret_key_here_minimum_32_chars
GROQ_API_KEY=gsk_your_groq_api_key_here
NODE_ENV=development
```

Start the backend:

```bash
npm run dev    # development (with nodemon)
npm start      # production
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:3000
```

> The frontend proxies `/api` requests to `http://localhost:5000` automatically.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | ✅ |
| `GROQ_API_KEY` | Groq API key for AI features | ⚡ For AI |
| `PORT` | Backend port (default: 5000) | Optional |

### Getting a Groq API Key
1. Visit https://console.groq.com
2. Sign up / Login
3. Go to API Keys → Create New Key
4. Paste the key in `.env`

### Getting a MongoDB URI
1. Visit https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user
4. Get the connection string (replace `<password>`)

---

## Features

- **Real-time AQI Data** — Live air quality from Open-Meteo API (free, no key needed)
- **City Search** — Search and compare any city worldwide
- **48-Hour Forecast** — Area chart with predicted AQI
- **AI Health Analysis** — Powered by Groq LLaMA-3 model
- **AI Chatbot** — Interactive health assistant (AirBot)
- **Custom Alerts** — Threshold-based alerts stored in MongoDB
- **Health Profile** — Personalized for asthma, COPD, allergies
- **JWT Authentication** — Secure register/login/protected routes

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| GET | `/api/air-quality/current` | ✅ | Current AQI by coords |
| GET | `/api/air-quality/forecast` | ✅ | 48h forecast |
| GET | `/api/air-quality/geocode` | ✅ | City search |
| GET | `/api/alerts` | ✅ | List alerts |
| POST | `/api/alerts` | ✅ | Create alert |
| PUT | `/api/alerts/:id` | ✅ | Update alert |
| DELETE | `/api/alerts/:id` | ✅ | Delete alert |
| POST | `/api/ai/analyze` | ✅ | AI health analysis |
| POST | `/api/ai/chat` | ✅ | AI chatbot |

## Tech Stack

**Frontend:** React 18, Vite, React Router v6, Recharts, Tailwind CSS, Lucide React  
**Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Groq SDK  
**Database:** MongoDB Atlas  
**AI:** Groq (LLaMA-3 8B)  
**Data:** Open-Meteo Air Quality API (free, no API key)
