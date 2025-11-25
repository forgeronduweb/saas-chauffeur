/**
 * Script de diagnostic pour Google OAuth
 * Vérifie la configuration et teste la connectivité
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function diagnoseOAuth() {
  console.log('🔍 Diagnostic Google OAuth\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log(`  GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`  GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`  GOOGLE_CALLBACK_URL: ${process.env.GOOGLE_CALLBACK_URL || '❌ Manquant'}`);
  console.log(`  CLIENT_URL: ${process.env.CLIENT_URL || '❌ Manquant'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`  MONGO_URI: ${process.env.MONGO_URI ? '✅ Configuré' : '❌ Manquant'}\n`);

  // 2. Vérifier la connexion MongoDB
  console.log('🔌 Test de connexion MongoDB:');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('  ✅ Connexion MongoDB réussie');
    
    // Tester une requête simple
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`  📊 Nombre d'utilisateurs: ${userCount}`);
    
  } catch (error) {
    console.log('  ❌ Erreur de connexion MongoDB:', error.message);
  }

  // 3. Vérifier les URLs
  console.log('\n🌐 Vérification des URLs:');
  const clientUrl = process.env.CLIENT_URL;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  
  if (clientUrl) {
    console.log(`  CLIENT_URL: ${clientUrl}`);
    if (clientUrl.includes('5173')) {
      console.log('  ⚠️  Port 5173 détecté - Vérifiez que c\'est le bon port pour votre client');
    }
  }
  
  if (callbackUrl) {
    console.log(`  CALLBACK_URL: ${callbackUrl}`);
  }

  // 4. Vérifier la configuration Google OAuth
  console.log('\n🔐 Configuration Google OAuth:');
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('  ✅ Credentials Google configurés');
    
    // Vérifier le format du Client ID
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId.endsWith('.apps.googleusercontent.com')) {
      console.log('  ✅ Format Client ID valide');
    } else {
      console.log('  ⚠️  Format Client ID suspect - devrait se terminer par .apps.googleusercontent.com');
    }
    
  } else {
    console.log('  ❌ Credentials Google manquants');
  }

  // 5. Recommandations
  console.log('\n💡 Recommandations:');
  
  if (!process.env.CLIENT_URL || process.env.CLIENT_URL.includes('5173')) {
    console.log('  🔧 Mettre à jour CLIENT_URL vers http://localhost:3000 (ou le bon port)');
  }
  
  if (!process.env.GOOGLE_CALLBACK_URL) {
    console.log('  🔧 Ajouter GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback');
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('  🔧 Ajouter un JWT_SECRET sécurisé');
  }

  console.log('\n📝 Configuration recommandée pour .env:');
  console.log(`
CLIENT_URL=http://localhost:3000
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
  `);

  // Fermer la connexion
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  
  console.log('🏁 Diagnostic terminé');
}

// Exécuter le diagnostic
diagnoseOAuth().catch(console.error);
