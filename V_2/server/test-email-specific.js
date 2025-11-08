require('dotenv').config();
const { sendVerificationEmail } = require('./services/emailService');

console.log('🧪 Test d\'envoi d\'email à une adresse spécifique\n');

async function testSpecificEmail() {
  try {
    // Créer un objet utilisateur de test
    const testUser = {
      email: 'oyokasamuel301@gmail.com', // ✅ Votre email
      firstName: 'Samuel',
      _id: 'test123'
    };

    const testCode = '123456';

    console.log('📧 Envoi d\'email de test à:', testUser.email);
    console.log('🔢 Code:', testCode);
    console.log('');

    // Envoyer l'email
    const result = await sendVerificationEmail(testUser, testCode);

    if (result.success) {
      console.log('✅ Email envoyé avec succès!');
      console.log('📬 Message ID:', result.messageId);
      console.log('');
      console.log('🎯 Vérifiez votre boîte mail:', testUser.email);
      console.log('📁 IMPORTANT: Vérifiez le dossier SPAM!');
    } else {
      console.log('❌ Échec de l\'envoi:', result.error);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

testSpecificEmail();
