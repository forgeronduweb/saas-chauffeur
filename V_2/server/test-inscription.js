require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendVerificationEmail } = require('./services/emailService');

console.log('🧪 Test d\'inscription avec envoi d\'email\n');

async function testInscription() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chauffeurs';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Email de test (changez ceci par votre email)
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    console.log(`📧 Email de test: ${testEmail}\n`);

    // Supprimer l'utilisateur de test s'il existe
    await User.deleteOne({ email: testEmail });
    console.log('🗑️  Ancien utilisateur de test supprimé (si existant)\n');

    // Créer un utilisateur de test
    const user = await User.create({
      email: testEmail,
      passwordHash: 'test_hash',
      role: 'driver',
      firstName: 'Test',
      lastName: 'User',
      phone: '0600000000',
      isEmailVerified: false
    });

    console.log('✅ Utilisateur créé:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      isEmailVerified: user.isEmailVerified
    });
    console.log('');

    // Générer un code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    console.log('🔢 Code de vérification généré:', verificationCode);
    console.log('⏱️  Expire dans: 10 minutes\n');

    // Envoyer l'email de vérification
    console.log('📤 Envoi de l\'email de vérification...\n');
    
    const result = await sendVerificationEmail(user, verificationCode);
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès!');
      console.log('📬 Message ID:', result.messageId);
      console.log('');
      console.log('🎯 Vérifiez votre boîte mail:', testEmail);
      console.log('📁 N\'oubliez pas de vérifier le dossier SPAM!');
    } else {
      console.log('❌ Échec de l\'envoi:', result.error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

testInscription();
