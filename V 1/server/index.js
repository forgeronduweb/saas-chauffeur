const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const vehicleRoutes = require('./routes/vehicles');
const rideRoutes = require('./routes/rides');
const offerRoutes = require('./routes/offers');
const applicationRoutes = require('./routes/applications');
const statsRoutes = require('./routes/stats');
const missionRoutes = require('./routes/missions');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');

const { connectToDatabase } = require('./db/connect');
const app = express();

// Configuration CORS pour la production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          process.env.CLIENT_URL,
          process.env.ADMIN_URL,
          process.env.API_URL,
          'https://chauffeur.onrender.com',
          'https://admin-chauffeur.onrender.com',
          'https://server-chauffeur.onrender.com'
        ].filter(Boolean)
      : [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5173',
          'http://localhost:4000'
        ];
    
    console.log('🔍 CORS Check - Origin:', origin);
    console.log('🔍 Allowed origins:', allowedOrigins);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    
    // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ No origin - allowing request');
      return callback(null, true);
    }
    
    // Vérifier si l'origin est autorisée
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      // En production, accepter temporairement toutes les origines .onrender.com
      if (process.env.NODE_ENV === 'production' && origin.includes('.onrender.com')) {
        console.log('⚠️ Allowing .onrender.com origin temporarily');
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.1', // Version pour vérifier le déploiement
    cors: {
      clientUrl: process.env.CLIENT_URL,
      adminUrl: process.env.ADMIN_URL,
      apiUrl: process.env.API_URL
    },
    requestHeaders: {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent')?.substring(0, 50) + '...'
    }
  });
});

// Endpoint de debug pour vérifier la configuration
app.get('/debug/config', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    corsOrigins: {
      clientUrl: process.env.CLIENT_URL,
      adminUrl: process.env.ADMIN_URL,
      apiUrl: process.env.API_URL
    },
    requestOrigin: req.get('Origin') || 'No origin header'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
connectToDatabase()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });


