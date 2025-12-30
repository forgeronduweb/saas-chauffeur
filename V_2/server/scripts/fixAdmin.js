const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://forgeronduweb:MS2J5nSAFune9BcZ@cluster0.drfeiye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const ADMIN_EMAIL = 'bahophilomeevrard@gmail.com';
const ADMIN_PASSWORD = 'Philome98@';

async function fixAdmin() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connecté!');
    
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    console.log('Hash généré:', hash);
    
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: ADMIN_EMAIL },
      { 
        $set: { 
          passwordHash: hash, 
          role: 'admin', 
          isEmailVerified: true, 
          isActive: true 
        } 
      }
    );
    
    console.log('Résultat:', result);
    
    // Vérifier
    const user = await mongoose.connection.db.collection('users').findOne({ email: ADMIN_EMAIL });
    console.log('User trouvé:', user ? 'Oui' : 'Non');
    console.log('passwordHash existe:', user?.passwordHash ? 'Oui' : 'Non');
    
    await mongoose.disconnect();
    console.log('Terminé!');
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

fixAdmin();
