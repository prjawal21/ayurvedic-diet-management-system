# VedaCare – Ayurvedic Diet Management System

**A cloud-based clinic management and nutrient analysis platform for Ayurvedic dietitians.** 

Built for Smart India Hackathon 2025 (Problem Statement ID: 25024) under the Ministry of Ayush / All India Institute of Ayurveda (AIIA). Category: MedTech / HealthTech / Software.

---

## 🌟 Features

### Ayurvedic Intelligence
- **Automated Diet Generation**: AI and rule-based generation of patient-specific diet charts tailored to individual health conditions
- **Dosha-Based Compatibility**: Food compatibility scoring synchronized with the patient's Prakriti (Vata, Pitta, Kapha) and current imbalances
- **Viruddha Ahara Detection**: Intelligent incompatibility detection to prevent unsafe food combinations based on classical Ayurvedic principles
- **Dietary Filtering**: Precise diet adjustments based on Rasa (taste), Guna (qualities), Virya (thermal potency), and Vipaka (post-digestive effect)
- **Ritucharya Adjustments**: Seasonal dietary recommendations dynamically adjusting to all six Ayurvedic seasons

### Clinical Workflow
- **Patient Management**: Comprehensive comprehensive tools for doctors and dietitians to register, track, and manage patient profiles
- **Diet Chart Export**: Print and PDF export functionality for patient handouts
- **Multi-role Access**: Admin, Doctor, and Dietitian dashboards with clinic-scoped data isolation
- **Manual Adjustments**: Manual diet editing capabilities with real-time nutrition recalculation

### Nutritional Science
- **Extensive Database**: 57 curated Indian dishes with full Ayurvedic annotations plus the full USDA SR Legacy 2018 dataset (~7,793 items)
- **Nutrient Analysis**: Real-time tracking of macro and micronutrients comparing against ICMR 2020 RDA
- **BMR Calculation**: Integrated Mifflin-St Jeor BMR calculation

### Technical Highlights
- **Modern Stack**: React + Node.js + Express + MongoDB
- **AI-Powered**: AI-assisted meal selection via Groq API (Llama 3.3) with rule-based fallback
- **Responsive UI**: Clean, professional design optimized for desktop and tablet clinical use

---

## 📁 Project Structure

```text
VedaCare/
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth & Validation
│   │   └── utils/       # Ayurvedic rule engine, diet generation
├── frontend/            # React 18 + Vite frontend
│   ├── src/
│   │   ├── api/         # Axios API clients
│   │   ├── components/  # Reusable UI elements
│   │   ├── pages/       # Dashboard, Patient, Diet Planner
│   │   └── context/     # Global state management
├── data/                # Local datasets (USDA, Indian Foods)
└── project documents/   # Project documentation and reports
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or Atlas)
- **Groq API Key** (optional — falls back to rule-based if not set)

### Backend Setup

1. **Navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
Create a `.env` file in the `backend` directory with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/vedacare
JWT_SECRET=your_secure_random_string_min_32_chars
FRONTEND_URL=http://localhost:5173
PORT=5000
```
*(Optional: Add `GROQ_API_KEY` and `GROQ_MODEL` for AI meal generation)*

4. **Start backend server:**
```bash
npm start
```
*(Or use `npm run dev` for nodemon development server)*

Backend runs at: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```

4. **Start development server:**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/vedacare` |
| `JWT_SECRET` | Secret for JWT tokens (32+ chars) | `your-secret-key-12345` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `PORT` | API Server port | `5000` |
| `GROQ_API_KEY` | Groq API key for AI | `gsk_...` |
| `GROQ_MODEL` | Groq model selection | `llama-3.3-70b-versatile` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL base | `http://localhost:5000` |

---

## 🎨 Tech Stack

### Backend
- **Node.js** & **Express** - Fast, unopinionated web framework
- **MongoDB** & **Mongoose** - Document database and Object Data Modeling
- **Groq** - LLM API for intelligent meal generation
- **JWT** - Secure stateless authentication
- **Bcrypt** - Password hashing securely

### Frontend
- **React 18** - UI library
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first styling framework
- **React Router** - Client-side routing
- **Axios** - Promise-based HTTP client

---

## 📖 Usage

1. **Register/Login** as an Admin or Doctor at `http://localhost:5173`
2. **Setup Clinic** — Configure your clinic details and add practitioners
3. **Register Patient** — Input patient vitals, medical history, and Prakriti
4. **Generate Diet** — Use the AI engine or manual selection to create a customized Ayurvedic diet chart
5. **Review Incompatibilities** — The system automatically flags *Viruddha Ahara* (incompatible foods) 
6. **Track Nutrition** — Verify the macro and micronutrient breakdown
7. **Export & Print** — Generate a professional PDF handout for the patient

---

## 🔒 Security Features

- **JWT-based authentication**
- **Bcrypt password hashing**
- **Role-Based Access Control (RBAC)** (Admin, Doctor, Dietitian)
- **Clinic-Scoped Data Isolation** to protect patient privacy
- **CORS configuration**
- **Environment variable protection**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Ministry of Ayush** & **All India Institute of Ayurveda (AIIA)**
- **Groq** - LLM API provider
- **USDA** - FoodData Central database
- **React & Node.js** - Open-source communities

---

**Bridging ancient Ayurvedic wisdom with modern nutritional science.**
