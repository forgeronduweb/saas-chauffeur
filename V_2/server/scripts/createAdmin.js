const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Modèle User simplifié pour le script
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['driver', 'employer', 'admin', 'client'], default: 'client' },
  firstName: String,
  lastName: String,
  phone: String,
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createOrUpdateAdmin() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://forgeronduweb:MS2J5nSAFune9BcZ@cluster0.drfeiye.mongodb.net/chauffeur_db';
    
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Données admin
    const adminEmail = 'bahophilomeevrard@gmail.com';
    const adminPassword = 'Philome98@';
    
    // Vérifier si l'admin existe déjà
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    
    if (admin) {
      console.log('👤 Compte admin existant trouvé');
      console.log('📧 Email:', admin.email);
      console.log('🎭 Rôle actuel:', admin.role);
      console.log('✉️ Email vérifié:', admin.isEmailVerified);
      console.log('🟢 Actif:', admin.isActive);
      console.log('\n🔄 Mise à jour du compte...');
      
      // Hasher le nouveau mot de passe
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      // Mettre à jour
      admin.passwordHash = passwordHash;
      admin.role = 'admin';
      admin.isEmailVerified = true;
      admin.isActive = true;
      admin.firstName = admin.firstName || 'Philomé';
      admin.lastName = admin.lastName || 'Baho';
      
      await admin.save();
      console.log('✅ Compte admin mis à jour avec succès!\n');
    } else {
      console.log('🆕 Création d\'un nouveau compte admin...\n');
      
      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      // Créer l'admin
      admin = await User.create({
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        firstName: 'Philomé',
        lastName: 'Baho',
        phone: '',
        isEmailVerified: true,
        isActive: true
      });
      
      console.log('✅ Compte admin créé avec succès!\n');
    }
    
    // Afficher les informations finales
    console.log('📋 INFORMATIONS DU COMPTE ADMIN:');
    console.log('================================');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log('🎭 Rôle:', admin.role);
    console.log('✉️ Email vérifié:', admin.isEmailVerified);
    console.log('🟢 Actif:', admin.isActive);
    console.log('👤 Nom:', admin.firstName, admin.lastName);
    console.log('🆔 ID:', admin._id);
    console.log('================================\n');
    
    console.log('✅ Vous pouvez maintenant vous connecter à l\'admin avec ces identifiants!\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
createOrUpdateAdmin();
