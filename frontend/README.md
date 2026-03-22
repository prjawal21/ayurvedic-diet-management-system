# Ayurveda Diet Management System - Frontend

A minimal, functional React frontend for the Ayurvedic Diet Management System. This is a doctor-facing MVP application that integrates with the existing Node.js backend.

## Tech Stack

- React (Vite)
- React Router
- Axios
- Tailwind CSS
- JavaScript

## Features

- Doctor authentication (register/login)
- Patient management (create, view)
- Diet chart generation
- Print-friendly diet chart display
- JWT-based authentication

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`

## Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will start on `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js              # Axios API service
│   ├── components/
│   │   ├── ProtectedRoute.jsx  # Auth guard
│   │   └── Navbar.jsx          # Navigation bar
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Dashboard.jsx       # Patient list
│   │   ├── AddPatient.jsx      # Create patient form
│   │   ├── PatientDetail.jsx   # Patient details
│   │   └── DietChart.jsx       # Diet chart display
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state management
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind styles
├── tailwind.config.js
└── package.json
```

## Routes

- `/login` - Doctor login
- `/register` - Doctor registration
- `/dashboard` - Patient list (protected)
- `/patients/new` - Add new patient (protected)
- `/patients/:id` - Patient details (protected)
- `/diet/:patientId` - Diet chart (protected)

## Usage Flow

1. **Register/Login** as a doctor
2. **Add a patient** with Ayurvedic attributes
3. **View patient details**
4. **Generate diet chart** based on Ayurvedic rules
5. **View and print** the diet chart

## API Integration

The frontend connects to the backend at `http://localhost:5000` with the following endpoints:

### Authentication
- `POST /auth/register`
- `POST /auth/login`

### Patients
- `GET /patients` - Get all patients for logged-in doctor
- `POST /patients`
- `GET /patients/:id`

### Diet Charts
- `POST /diet/generate`
- `GET /diet/:patientId`

All protected endpoints require JWT token in the Authorization header.

## Authentication

- JWT tokens are stored in `localStorage`
- Axios interceptor automatically adds token to requests
- Protected routes redirect to login if unauthenticated

## Diet Chart Features

The diet chart page displays:

- **Meals**: Breakfast, Lunch, Dinner with food items
- **Nutritional Summary**: Total calories, protein, carbs, fat
- **Ayurvedic Analysis**:
  - Rasa (taste) distribution
  - Virya (potency) balance
  - Digestibility profile
- **Compliance Notes**: Prakriti-specific recommendations
- **Print Support**: Clean, print-friendly layout
- **Generation Timestamp**: Clearly displayed date and time

### Important Notes

> **Latest Diet Chart Only**: The system displays the **most recently generated diet chart** for each patient. Historical diet charts are out of scope for this MVP. Each time a new diet chart is generated, it replaces the previous one.

> **Patient Data**: Patient list is fetched from the backend database. The dashboard will display all patients created by the logged-in doctor, persisting across sessions and browsers.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- This is an MVP with minimal styling
- No animations or complex UI
- Focus on functionality and clarity
- Print-friendly diet chart design
- Backend must be running on port 5000

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

ISC
