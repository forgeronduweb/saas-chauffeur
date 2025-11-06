const mongoose = require('mongoose');

// Configuration optimisée pour MongoDB Atlas et production
const mongooseOptions = {
  autoIndex: true,
  maxPoolSize: 10, // Nombre max de connexions simultanées
  minPoolSize: 2,  // Maintenir 2 connexions minimum
  serverSelectionTimeoutMS: 5000, // Timeout pour sélection du serveur
  socketTimeoutMS: 45000, // Timeout pour les opérations
  family: 4, // Utiliser IPv4
  retryWrites: true,
  w: 'majority',
  // Compression pour réduire la bande passante
  compressors: ['zlib'],
  zlibCompressionLevel: 6
};

async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chauffeurs';
  
  mongoose.set('strictQuery', true);
  
  // Gestion des événements de connexion
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected successfully');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });
  
  // Reconnexion automatique en cas de déconnexion
  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
  
  try {
    await mongoose.connect(uri, mongooseOptions);
    console.log('🚀 Database connection pool initialized');
  } catch (error) {
    console.error('💥 Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

module.exports = { connectToDatabase };


