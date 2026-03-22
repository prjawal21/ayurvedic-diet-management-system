# Ayurveda Diet Management System - Backend

A cloud-based backend API for Ayurvedic dietitians to manage patients and generate personalized diet charts based on Ayurvedic principles.

## ⚠️ MVP Scope & Clinical Disclaimer

**This is a Minimum Viable Product (MVP) backend** designed to validate core Ayurvedic diet management workflows.

### Out of Scope for This Phase:
- ❌ AI/ML-based recommendations
- ❌ Large-scale food databases (8,000+ items)
- ❌ Hospital Information System (HIS) / Electronic Health Record (EHR) integration
- ❌ Mobile applications
- ❌ Regulatory compliance (HIPAA, GDPR, etc.)
- ❌ Advanced security hardening for production deployment

### Clinical Responsibility:
> **IMPORTANT**: This system is a **clinical decision-support tool** designed to assist Ayurvedic practitioners. It does **not replace practitioner expertise, clinical judgment, or professional responsibility**. All diet recommendations must be reviewed and approved by qualified practitioners before patient implementation.

## Features

- **Doctor Authentication**: JWT-based secure authentication
- **Patient Management**: Create and manage patient profiles with Ayurvedic attributes
- **Food Database**: Comprehensive Indian food database with nutritional and Ayurvedic properties
- **Diet Chart Generation**: Rule-based Ayurvedic diet plan generation
- **Prakriti-Based Filtering**: Customized food recommendations based on body constitution
- **Nutrient Tracking**: Automatic calculation of calories, protein, carbs, and fat

## Tech Stack

- Node.js (LTS)
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or remote connection)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the backend directory with the following:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ayurveda-diet-system
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
   JWT_EXPIRE=7d
   ```

4. **Seed the database** with sample foods:
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register Doctor
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Dr. Sharma",
  "email": "sharma@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "sharma@example.com",
  "password": "password123"
}
```

### Patient Management

#### Create Patient
```http
POST /patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "age": 35,
  "gender": "Male",
  "prakriti": "Pitta",
  "dietaryPreference": "Veg",
  "digestionStrength": "Medium",
  "waterIntake": 2.5,
  "bowelMovement": "Regular"
}
```

#### Get Patient
```http
GET /patients/:id
Authorization: Bearer <token>
```

### Food Management

#### Add Food
```http
POST /foods
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Basmati Rice",
  "calories": 200,
  "protein": 4,
  "carbs": 45,
  "fat": 0.5,
  "rasa": ["Madhura"],
  "virya": "Sheeta",
  "digestibility": "Easy",
  "category": "Grain"
}
```

#### Get All Foods
```http
GET /foods
Authorization: Bearer <token>
```

### Diet Chart

#### Generate Diet Chart
```http
POST /diet/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "patient_id_here"
}
```

#### Get Diet Chart
```http
GET /diet/:patientId
Authorization: Bearer <token>
```

## Ayurvedic Rules

The system implements the following Ayurvedic principles:

1. **Prakriti-Based Filtering**:
   - Vata: Avoids Sheeta (cold) foods
   - Pitta: Avoids Ushna (hot) foods
   - Kapha: Prefers Ushna (hot) foods
   - Dual Prakriti (e.g., Vata-Pitta): Conservative filtering applied based on primary dosha to avoid aggravating either constitution

2. **Digestibility**:
   - Low digestion: Only Easy foods
   - Medium digestion: Easy and Moderate foods
   - High digestion: All foods

3. **Age-Based Calories** *(Baseline Heuristics)*:
   - < 12 years: 1500 calories/day
   - 13-60 years: 2000 calories/day
   - > 60 years: 1700 calories/day
   
   > **Note**: These are baseline heuristics for initial diet generation. Values are adjustable by practitioners in future versions and are not meant to replace clinical judgment based on individual patient needs, activity levels, or medical conditions.

4. **Rasa (Taste) Balance**: Tracks distribution of 6 tastes (Madhura, Amla, Lavana, Katu, Tikta, Kashaya)

5. **Virya (Potency) Balance**: Monitors Ushna vs Sheeta foods

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── models/
│   │   ├── User.js               # Doctor model
│   │   ├── Patient.js            # Patient model
│   │   ├── Food.js               # Food model
│   │   └── DietChart.js          # Diet chart model
│   ├── routes/
│   │   ├── auth.routes.js        # Auth routes
│   │   ├── patient.routes.js     # Patient routes
│   │   ├── food.routes.js        # Food routes
│   │   └── diet.routes.js        # Diet routes
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth logic
│   │   ├── patient.controller.js # Patient logic
│   │   ├── food.controller.js    # Food logic
│   │   └── diet.controller.js    # Diet logic
│   ├── utils/
│   │   ├── ayurvedaRules.js      # Rule engine
│   │   └── seedFoods.js          # Database seeding
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification
│   ├── app.js                    # Express app
│   └── server.js                 # Server entry point
├── .env                          # Environment variables
├── .gitignore
└── package.json
```

## Sample Workflow

1. **Register as a doctor**
2. **Login** to receive JWT token
3. **Create patient profiles** with Ayurvedic attributes
4. **Generate diet charts** - the system will:
   - Filter foods based on patient's Prakriti
   - Consider digestion strength
   - Calculate age-appropriate calories
   - Create balanced meals (breakfast, lunch, dinner) with evenly distributed calories
   - Provide nutrient totals and Ayurvedic compliance notes
   
   > **Assumption**: Calories are evenly distributed across three meals by default. This is a configurable heuristic, not a medical mandate, and can be customized based on practitioner preferences or patient requirements.

## Notes

- This is a **deployment-ready MVP foundation** focused on rule-based logic (NO AI)
- Database includes 23 sample Indian foods as a representative subset for validation
- Schema and rule engine are designed to scale to larger datasets without structural changes
- All protected routes require JWT authentication
- Passwords are hashed using bcryptjs
- CORS is enabled for frontend integration
- The Ayurvedic rule engine is deterministic and transparent, prioritizing explainable decision-making over black-box intelligence

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample foods

## License

ISC
