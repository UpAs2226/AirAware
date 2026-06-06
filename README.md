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

## Features

- **Real-time AQI Data** — Live air quality from Open-Meteo API (free, no key needed)
- **City Search** — Search and compare any city worldwide
- **48-Hour Forecast** — Area chart with predicted AQI
- **AI Health Analysis** — Powered by Groq LLaMA-3 model
- **AI Chatbot** — Interactive health assistant (AirBot)
- **Custom Alerts** — Threshold-based alerts stored in MongoDB
- **Health Profile** — Personalized for asthma, COPD, allergies
- **JWT Authentication** — Secure register/login/protected routes



## Tech Stack

**Frontend:** React 18, Vite, React Router v6, Recharts, Tailwind CSS, Lucide React  
**Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Groq SDK  
**Database:** MongoDB Atlas  
**AI:** Groq (LLaMA-3 8B)  
**Data:** Open-Meteo Air Quality API (free, no API key)

## DEPLOYED WEBSITE LINK

https://airaware-1-zmpv.onrender.com
