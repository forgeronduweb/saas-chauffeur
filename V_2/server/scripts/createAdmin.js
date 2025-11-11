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
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI n\'est pas défini dans le fichier .env');
      console.error('💡 Créez un fichier .env avec: MONGO_URI=votre_uri_mongodb');
      process.exit(1);
    }
    
    console.log('📡 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Données admin depuis les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
    
    if (!adminEmail || !adminPassword) {
      console.error('❌ ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans le fichier .env');
      console.error('💡 Ajoutez ces variables dans votre fichier .env:');
      console.error('   ADMIN_EMAIL=votre_email@example.com');
      console.error('   ADMIN_PASSWORD=votre_mot_de_passe_securise');
      process.exit(1);
    }
    
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
      admin.firstName = admin.firstName || adminFirstName;
      admin.lastName = admin.lastName || adminLastName;
      
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
        firstName: adminFirstName,
        lastName: adminLastName,
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
    console.log('🔑 Mot de passe: ******** (voir fichier .env)');
    console.log('🎭 Rôle:', admin.role);
    console.log('✉️ Email vérifié:', admin.isEmailVerified);
    console.log('🟢 Actif:', admin.isActive);
    console.log('👤 Nom:', admin.firstName, admin.lastName);
    console.log('🆔 ID:', admin._id);
    console.log('================================\n');
    
    console.log('✅ Vous pouvez maintenant vous connecter à l\'admin avec les identifiants du fichier .env!\n');
    
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
