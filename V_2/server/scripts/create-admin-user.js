const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('🔐 Création du compte administrateur...');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'bahophilomeevrard@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  L\'utilisateur admin existe déjà');
      
      // Mettre à jour le mot de passe si nécessaire
      const hashedPassword = await bcrypt.hash('Philome98@', 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isEmailVerified = true;
      
      await existingAdmin.save();
      console.log('✅ Mot de passe admin mis à jour');
    } else {
      // Créer le nouvel utilisateur admin
      const hashedPassword = await bcrypt.hash('Philome98@', 12);
      
      const adminUser = new User({
        email: 'bahophilomeevrard@gmail.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Philomé',
        lastName: 'Evrard',
        phone: '+33123456789',
        isActive: true,
        isEmailVerified: true
      });

      await adminUser.save();
      console.log('✅ Compte administrateur créé avec succès');
    }

    console.log('\n📋 Informations de connexion admin :');
    console.log('   Email: bahophilomeevrard@gmail.com');
    console.log('   Mot de passe: Philome98@');
    console.log('   Rôle: admin');
    
    console.log('\n🌐 Vous pouvez maintenant vous connecter sur :');
    console.log('   http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 L\'email existe déjà. Tentative de mise à jour...');
      
      try {
        const hashedPassword = await bcrypt.hash('Philome98@', 12);
        await User.findOneAndUpdate(
          { email: 'bahophilomeevrard@gmail.com' },
          { 
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            isEmailVerified: true
          }
        );
        console.log('✅ Compte admin mis à jour avec succès');
      } catch (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message);
      }
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter la création de l'admin
createAdminUser();
