const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/patients', require('./routes/patient.routes'));
app.use('/visits', require('./routes/visit.routes'));
app.use('/foods', require('./routes/food.routes'));
app.use('/diet', require('./routes/diet.routes'));
app.use('/conditions', require('./routes/condition.routes'));

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ayurveda Diet Management System API',
        version: '1.0.0'
    });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

module.exports = app;
