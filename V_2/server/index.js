require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const offerRoutes = require('./routes/offers');
const applicationsRoutes = require('./routes/applications');
const statsRoutes = require('./routes/stats');
const searchRoutes = require('./routes/search');
const messageRoutes = require('./routes/messages');
const employerRoutes = require('./routes/employer');
const adminRoutes = require('./routes/admin');
const platformContentRoutes = require('./routes/platformContent');
const reviewRoutes = require('./routes/reviews');
const promotionRoutes = require('./routes/promotions');

const { connectToDatabase } = require('./db/connect');
const { getCacheStats, invalidateCache } = require('./middleware/cache');
const KeepAlive = require('./utils/keepAlive');
const { createIndexes } = require('./utils/createIndexes');
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
app.use(express.json({ limit: '50mb' })); // Augmenter la limite pour les images en base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Initialiser Passport
app.use(passport.initialize());

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

// Endpoint pour les statistiques du cache
app.get('/debug/cache', (req, res) => {
  const stats = getCacheStats();
  res.json({
    cache: stats,
    message: 'Statistiques du cache en mémoire'
  });
});

// Endpoint pour vider le cache (admin uniquement en production)
app.post('/debug/cache/clear', (req, res) => {
  const pattern = req.query.pattern;
  invalidateCache(pattern);
  res.json({
    success: true,
    message: pattern ? `Cache invalidé pour: ${pattern}` : 'Tout le cache a été vidé'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/platform-content', platformContentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promotions', promotionRoutes);

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
  .then(async () => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
    
    // Créer les index pour optimiser les performances
    await createIndexes();
    
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
      
      // Activer le keep-alive en production pour éviter que Render endorme le serveur
      if (process.env.NODE_ENV === 'production' && process.env.API_URL) {
        const keepAlive = new KeepAlive(process.env.API_URL, 10 * 60 * 1000); // 10 minutes
        keepAlive.start();
        
        // Arrêter le keep-alive proprement lors de l'arrêt du serveur
        process.on('SIGTERM', () => {
          console.log('SIGTERM reçu, arrêt du keep-alive...');
          keepAlive.stop();
          process.exit(0);
        });
      }
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });


