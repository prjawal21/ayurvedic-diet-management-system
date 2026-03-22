# VedaCare — Ayurvedic Diet Management System

> Smart India Hackathon 2025 | Problem Statement ID: 25024  
> Ministry of Ayush / All India Institute of Ayurveda (AIIA)  
> Category: MedTech / BioTech / HealthTech

## Overview

VedaCare is a comprehensive cloud-based Ayurvedic Diet Management Software designed for Ayurvedic dietitians and hospitals. It bridges the gap between modern nutritional science and traditional Ayurvedic dietary principles by integrating:

- **Ayurvedic intelligence** — Prakriti (constitution), Dosha balancing, Rasa (six tastes), Guna, Vipaka, Virya, Ritucharya (seasonal diet), Viruddha Ahara (food incompatibility) detection
- **Modern nutrition science** — ICMR 2020 RDA comparison, Mifflin-St Jeor BMR calculation, 11 micronutrient tracking
- **Clinical workflow** — Patient management, visit tracking, diet versioning, printable diet charts

## Features

- 🌿 **Automated Ayurvedic diet generation** based on patient Prakriti, Agni, season, severity, and medical conditions
- 📊 **8,000+ food database** (USDA SR Legacy 2018) with curated Indian food annotations
- 🧬 **AI-assisted meal selection** via Groq API (Llama 3.3) with rule-based fallback
- 👨⚕️ **Multi-role access** — Admin, Doctor, Dietitian with clinic-scoped data isolation
- 📋 **Print/PDF export** of diet charts for patient handouts
- ✏️ **Manual diet editing** with real-time nutrition recalculation
- 📱 **Responsive UI** for desktop and tablet use

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| AI | Groq API (Llama 3.3-70b) |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

## Project Structure

```
VedaCare/
├── frontend/          # React 18 + Vite frontend
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/     # Ayurvedic rule engine, diet generation
└── data/              # Local datasets (gitignored)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- Groq API key (optional — falls back to rule-based if not set)

### Installation

```bash
# Clone the repository
git clone https://github.com/prjawal21/ayurvedic-diet-management-system.git
cd ayurvedic-diet-management-system

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in your values in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# Fill in your Render backend URL
```

### Database Seeding

```bash
cd backend

# Seed curated Indian foods (required for diet generation)
npm run seed-indian

# Optional: seed full USDA database (requires CSV files in data/usda_sr_legacy/)
npm run seed-usda
```

### Running Locally

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:5000`

### Create Admin User

```bash
cd backend && npm run create-admin
```

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — set `VITE_API_URL` to your Render backend URL
- **Backend** → [Render](https://render.com) — set all environment variables from `.env.example`
- **Database** → [MongoDB Atlas](https://atlas.mongodb.com) — free M0 cluster

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Allowed CORS origin (your Vercel URL) |
| `GROQ_API_KEY` | Groq API key for AI meal selection |
| `GROQ_MODEL` | Groq model name (default: llama-3.3-70b-versatile) |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |

## Ayurvedic Intelligence

VedaCare implements the following Ayurvedic concepts programmatically:

- **Prakriti** — Vata, Pitta, Kapha and dual combinations
- **Agni** — Low, Medium, High digestive capacity filtering
- **Rasa** — Six taste balancing (Madhura, Amla, Lavana, Katu, Tikta, Kashaya)
- **Virya** — Warming/Cooling thermal balance
- **Vipaka** — Post-digestive effect tracking
- **Guna** — 20 qualities filtering
- **Ritucharya** — All 6 Ayurvedic seasonal adjustments
- **Viruddha Ahara** — Food incompatibility detection and replacement suggestions
- **Condition-based filtering** — Disease-specific food restrictions

## License

MIT License — built for Smart India Hackathon 2025

## Team

Developed for SIH 2025 under Problem Statement ID 25024  
Organization: Ministry of Ayush | Department: All India Institute of Ayurveda (AIIA)
