require('dotenv').config();

console.log('🔍 Vérification de la configuration Google OAuth\n');

console.log('Variables d\'environnement:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configuré' : '❌ Manquant');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '❌ Manquant');
console.log('');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth est configuré !');
  console.log('');
  console.log('📋 Configuration:');
  console.log('Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
  console.log('');
  console.log('🚀 Vous pouvez maintenant tester la connexion Google');
} else {
  console.log('❌ Google OAuth n\'est PAS configuré');
  console.log('');
  console.log('💡 Ajoutez ces variables dans server/.env:');
  console.log('GOOGLE_CLIENT_ID=votre_client_id');
  console.log('GOOGLE_CLIENT_SECRET=votre_client_secret');
  console.log('GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback');
}
