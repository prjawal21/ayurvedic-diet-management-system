<div align="center">

<br/>

<img src="https://img.shields.io/badge/VedaCare-Ayurvedic%20Intelligence-brightgreen?style=for-the-badge&logo=leaf&logoColor=white" alt="VedaCare" height="40"/>

<h1>🌿 VedaCare</h1>

<h3>Ayurvedic Diet Management & Clinical Intelligence Platform</h3>

<p><em>Bridging five millennia of Ayurvedic wisdom with modern nutritional science.</em></p>

<br/>

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq%20%2F%20Llama%203.3-FF6B35?style=flat-square)](https://groq.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

</div>

---

## ✦ What is VedaCare?

Most diet management tools speak the language of calories and macros. VedaCare speaks Ayurveda.

**The problem with existing clinical diet software:** It ignores Prakriti (body constitution), seasonal rhythms, and classical food compatibility rules — the very foundations of Ayurvedic nutrition. Dietitians are left reconciling two separate systems manually.

**VedaCare bridges this gap.** It layers a full Ayurvedic intelligence engine — Dosha scoring, Viruddha Ahara detection, Ritucharya-aware adjustments — on top of a rigorous nutritional database (USDA SR Legacy + curated Indian foods). The result: a single platform where ancient principles and modern science work together, not against each other.

---

## 📸 Screenshots



<table>
  <tr>
    <td align="center"><b>Admin Dashboard</b></td>
    <td align="center"><b>Diet Chart Generator</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/7d8de5c2-06b3-4d96-bd20-a7bdec443df4" alt="Admin Dashboard" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/f4c2a37f-f758-4204-81f5-ccb51c3f3360" alt="Diet Chart Generator" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Nutrient Analysis</b></td>
    <td align="center"><b>Visits Display</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/445daea0-d9d2-4c87-ae24-af7e4d0a0ecb" alt="Nutrient Analysis" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/5ddc78cc-45d3-4017-bab9-a5351b96ad81" alt="Visits Display" width="100%"/></td>
  </tr>
</table>

---

## ⚡ Features

### 🧘 Ayurvedic Intelligence
| Feature | Description |
|---|---|
| **AI Diet Generation** | Patient-specific diet charts generated via Llama 3.3 with a rule-based fallback |
| **Dosha Compatibility** | Food scoring synced to each patient's Prakriti (Vata · Pitta · Kapha) |
| **Viruddha Ahara Detection** | Real-time flagging of incompatible food combinations per classical texts |
| **Dietary Filtering** | Adjustments based on Rasa, Guna, Virya, and Vipaka |
| **Ritucharya Adjustments** | Dynamic seasonal recommendations across all six Ayurvedic seasons |

### 🏥 Clinical Workflow
| Feature | Description |
|---|---|
| **Patient Management** | Register, track, and manage complete patient profiles and history |
| **Multi-role Access** | Admin, Doctor, and Dietitian dashboards with clinic-scoped data isolation |
| **Diet Chart Export** | One-click PDF generation for patient handouts |
| **Manual Overrides** | Edit any generated diet with instant nutrition recalculation |

### 🔬 Nutritional Science
| Feature | Description |
|---|---|
| **Dual Database** | 57 curated Indian dishes + full USDA SR Legacy 2018 (~7,793 items) |
| **Real-time Nutrient Tracking** | Macro & micronutrients benchmarked against ICMR 2020 RDA |
| **BMR Calculation** | Mifflin-St Jeor equation integrated into diet targets |

---

## 🏗️ Architecture

```
VedaCare/
├── backend/                  # Node.js + Express API
│   └── src/
│       ├── controllers/      # Route handlers
│       ├── models/           # Mongoose schemas
│       ├── routes/           # API endpoints
│       ├── middleware/        # Auth & validation
│       └── utils/            # Ayurvedic rule engine · diet generation
│
├── frontend/                 # React 18 + Vite
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # Reusable UI elements
│       ├── pages/            # Dashboard · Patient · Diet Planner
│       └── context/          # Global state (React Context)
│
├── data/                     # Local datasets (USDA · Indian Foods)
└── docs/                     # Documentation & reports
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `v18+`
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Groq API Key** *(optional — system falls back to rule-based generation)*

---

### 1 · Clone the repository

```bash
git clone https://github.com/your-username/vedacare.git
cd vedacare
```

### 2 · Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/vedacare
JWT_SECRET=your_secure_random_string_min_32_chars
FRONTEND_URL=http://localhost:5173
PORT=5000

# Optional — enables AI meal generation
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
```

```bash
npm start          # production
npm run dev        # development (nodemon)
```

Backend runs at → `http://localhost:5000`

---

### 3 · Frontend setup

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🌐 Environment Variables Reference

### Backend

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ characters) |
| `FRONTEND_URL` | ✅ | Allowed CORS origin |
| `PORT` | ✅ | API server port |
| `GROQ_API_KEY` | ⬜ | Groq API key for AI generation |
| `GROQ_MODEL` | ⬜ | Groq model name |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the backend API |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td><b>Frontend</b></td>
    <td>React 18 · Vite · Tailwind CSS · React Router · Axios</td>
  </tr>
  <tr>
    <td><b>Backend</b></td>
    <td>Node.js · Express</td>
  </tr>
  <tr>
    <td><b>Database</b></td>
    <td>MongoDB · Mongoose</td>
  </tr>
  <tr>
    <td><b>AI / LLM</b></td>
    <td>Groq API · Llama 3.3 70B (with rule-based fallback)</td>
  </tr>
  <tr>
    <td><b>Auth</b></td>
    <td>JWT · Bcrypt</td>
  </tr>
  <tr>
    <td><b>Data Sources</b></td>
    <td>USDA SR Legacy 2018 · ICMR 2020 RDA · Custom Indian Foods DB</td>
  </tr>
</table>

---

## 🔒 Security

- **JWT-based stateless authentication**
- **Bcrypt password hashing** (adaptive cost factor)
- **Role-Based Access Control** — Admin · Doctor · Dietitian
- **Clinic-scoped data isolation** — practitioners only access their own clinic's records
- **CORS whitelisting** via environment configuration
- **No secrets in source** — all sensitive values managed via `.env`

---

## 📖 Usage Walkthrough

```
1. Register / Login     →  Create an account as Admin or Doctor
2. Setup Clinic         →  Configure clinic details, add practitioners
3. Register Patient     →  Input vitals, medical history, and Prakriti type
4. Generate Diet        →  AI engine or manual selection builds a personalised diet chart
5. Review Flags         →  System highlights any Viruddha Ahara (incompatible) combinations
6. Track Nutrition      →  Verify macro & micronutrient breakdown against ICMR RDA
7. Export & Print       →  Download a professional PDF handout for the patient
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br/>

Made with 🌿 by the VedaCare Team

<br/>

*Ancient wisdom. Modern science. One platform.*

</div>
