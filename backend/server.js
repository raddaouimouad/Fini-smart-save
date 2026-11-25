require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Trop de requêtes. Veuillez réessayer plus tard.' },
});
app.use('/api/', globalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/gaming', require('./routes/gaming'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FINI API is running', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[FINI Error]', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 FINI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Admin can access API at http://localhost:${PORT}/api/admin`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
