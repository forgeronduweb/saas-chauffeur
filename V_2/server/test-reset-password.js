require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { forgotPassword } = require('./controllers/passwordResetController');

console.log('🧪 Test de réinitialisation de mot de passe\n');

async function testResetPassword() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chauffeurs';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Email à tester (changez par votre email)
    const testEmail = process.env.TEST_EMAIL || 'forgeronduweb@gmail.com';
    
    console.log(`📧 Test avec l'email: ${testEmail}\n`);

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé avec cet email');
      console.log('💡 Créez d\'abord un compte avec cet email\n');
      return;
    }

    console.log('✅ Utilisateur trouvé:', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    console.log('');

    // Simuler une requête HTTP pour forgotPassword
    const req = {
      body: { email: testEmail }
    };

    const res = {
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (data) => {
        console.log(`📤 Réponse HTTP ${res.statusCode || 200}:`, data);
        console.log('');
      }
    };

    console.log('📤 Envoi de la demande de réinitialisation...\n');
    
    // Appeler la fonction forgotPassword
    await forgotPassword(req, res);

    // Vérifier le token dans la base de données
    const updatedUser = await User.findOne({ email: testEmail });
    
    if (updatedUser.resetPasswordToken) {
      console.log('✅ Token de réinitialisation créé');
      console.log('⏱️  Expire le:', new Date(updatedUser.resetPasswordExpires).toLocaleString('fr-FR'));
      console.log('');
      console.log('🎯 Vérifiez votre boîte mail:', testEmail);
      console.log('📁 N\'oubliez pas de vérifier le dossier SPAM!');
      console.log('');
      console.log('💡 En développement, le lien est affiché dans la console ci-dessus');
    } else {
      console.log('❌ Aucun token créé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

testResetPassword();
