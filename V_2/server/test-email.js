/**
 * Script de test pour vérifier la configuration Nodemailer
 * 
 * Usage: node test-email.js
 */

require('dotenv').config();
const { sendDriverValidationEmail, sendDriverRejectionEmail, sendWelcomeEmail } = require('./services/emailService');

// Données de test
const testDriver = {
  firstName: 'Jean',
  lastName: 'Kouassi',
  email: process.env.TEST_EMAIL || 'test@example.com', // Remplacez par votre email de test
  phone: '+225 07 12 34 56 78',
  experience: 5
};

const testUser = {
  firstName: 'Marie',
  lastName: 'Koné',
  email: process.env.TEST_EMAIL || 'test@example.com',
  role: 'driver'
};

async function testEmails() {
  console.log('🧪 Début des tests d\'envoi d\'emails...\n');

  try {
    // Test 1 : Email de validation
    console.log('📧 Test 1 : Email de validation de compte chauffeur');
    const result1 = await sendDriverValidationEmail(testDriver);
    if (result1.success) {
      console.log('✅ Email de validation envoyé avec succès');
      console.log(`   Message ID: ${result1.messageId}\n`);
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de validation');
      console.log(`   Erreur: ${result1.error}\n`);
    }

    // Attendre 2 secondes entre chaque email
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2 : Email de rejet
    console.log('📧 Test 2 : Email de rejet de compte chauffeur');
    const result2 = await sendDriverRejectionEmail(testDriver, 'Documents non valides ou illisibles. Veuillez soumettre des documents de meilleure qualité.');
    if (result2.success) {
      console.log('✅ Email de rejet envoyé avec succès');
      console.log(`   Message ID: ${result2.messageId}\n`);
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de rejet');
      console.log(`   Erreur: ${result2.error}\n`);
    }

    // Attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3 : Email de bienvenue
    console.log('📧 Test 3 : Email de bienvenue');
    const result3 = await sendWelcomeEmail(testUser);
    if (result3.success) {
      console.log('✅ Email de bienvenue envoyé avec succès');
      console.log(`   Message ID: ${result3.messageId}\n`);
    } else {
      console.log('❌ Échec de l\'envoi de l\'email de bienvenue');
      console.log(`   Erreur: ${result3.error}\n`);
    }

    console.log('✅ Tests terminés !');
    console.log('\n📬 Vérifiez votre boîte mail (et le dossier spam) pour voir les emails.');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }

  process.exit(0);
}

// Vérifier la configuration avant de lancer les tests
console.log('🔧 Configuration actuelle:');
console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'NON CONFIGURÉ'}`);
console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'NON CONFIGURÉ'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NON CONFIGURÉ'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***configuré***' : 'NON CONFIGURÉ'}`);
console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'NON CONFIGURÉ'}`);
console.log(`   TEST_EMAIL: ${process.env.TEST_EMAIL || 'test@example.com'}`);
console.log('');

// Vérifier que les variables essentielles sont configurées
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERREUR: Les variables EMAIL_USER et EMAIL_PASSWORD doivent être configurées dans .env');
  console.log('\nAjoutez ces lignes dans votre fichier .env :');
  console.log('EMAIL_HOST=smtp.gmail.com');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_USER=votre.email@gmail.com');
  console.log('EMAIL_PASSWORD=votre_mot_de_passe_application');
  console.log('TEST_EMAIL=votre.email@gmail.com');
  process.exit(1);
}

// Lancer les tests
testEmails();
