const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  try {
    // Connexion à la base de données
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Données de l'admin
    const adminData = {
      email: 'bahophilomeevrard@gmail.com',
      password: 'Philome98@',
      firstName: 'Philomé',
      lastName: 'Evrard',
      role: 'admin'
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà');
      console.log(`   Rôle actuel: ${existingUser.role}`);
      
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ Rôle mis à jour vers admin');
      }
      
      // Mettre à jour le mot de passe
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
      existingUser.passwordHash = passwordHash;
      existingUser.isActive = true;
      existingUser.isEmailVerified = true;
      await existingUser.save();
      console.log('✅ Mot de passe mis à jour');
      
      console.log('\n🎉 Compte admin prêt !');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔑 Mot de passe: ${adminData.password}`);
      console.log(`👤 Rôle: admin`);
      
    } else {
      // Créer un nouvel utilisateur admin
      console.log('👤 Création du compte admin...');
      
      // Hasher le mot de passe
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(adminData.password, saltRounds);
      
      // Créer l'utilisateur
      const admin = new User({
        email: adminData.email,
        passwordHash: passwordHash,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      
      await admin.save();
      
      console.log('✅ Compte admin créé avec succès !');
      console.log('\n🎉 Détails du compte :');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔑 Mot de passe: ${adminData.password}`);
      console.log(`👤 Nom: ${adminData.firstName} ${adminData.lastName}`);
      console.log(`🛡️  Rôle: admin`);
      console.log(`📅 Créé le: ${admin.createdAt}`);
    }
    
    console.log('\n🌐 Vous pouvez maintenant vous connecter sur:');
    console.log('   http://localhost:3001/login');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    if (error.code === 11000) {
      console.error('   → Un utilisateur avec cet email existe déjà');
    }
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter le script
console.log('🚀 Script de création d\'admin');
console.log('================================\n');
createAdmin();
