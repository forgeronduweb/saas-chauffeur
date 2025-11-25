/**
 * Script pour corriger automatiquement la configuration OAuth
 */

const fs = require('fs');
const path = require('path');

function fixOAuthConfig() {
  console.log('🔧 Correction de la configuration OAuth\n');

  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env non trouvé');
    return;
  }

  // Lire le fichier .env
  let envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📖 Lecture du fichier .env...');

  // Corrections à appliquer
  const corrections = [
    {
      pattern: /CLIENT_URL=http:\/\/localhost:5173/g,
      replacement: 'CLIENT_URL=http://localhost:3000',
      description: 'Correction du port CLIENT_URL (5173 → 3000)'
    },
    {
      pattern: /CLIENT_URL=http:\/\/localhost:5174/g,
      replacement: 'CLIENT_URL=http://localhost:3000',
      description: 'Correction du port CLIENT_URL (5174 → 3000)'
    }
  ];

  let hasChanges = false;
  
  corrections.forEach(correction => {
    if (correction.pattern.test(envContent)) {
      envContent = envContent.replace(correction.pattern, correction.replacement);
      console.log(`✅ ${correction.description}`);
      hasChanges = true;
    }
  });

  // Ajouter des variables manquantes si nécessaire
  const requiredVars = [
    'GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback'
  ];

  requiredVars.forEach(varLine => {
    const [varName] = varLine.split('=');
    const regex = new RegExp(`^${varName}=`, 'm');
    
    if (!regex.test(envContent)) {
      envContent += `\n${varLine}`;
      console.log(`✅ Ajout de ${varName}`);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    // Créer une sauvegarde
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`💾 Sauvegarde créée: ${backupPath}`);

    // Écrire le nouveau fichier
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env mis à jour');
    
    console.log('\n🔄 Redémarrez le serveur pour appliquer les changements:');
    console.log('   npm run dev');
    
  } else {
    console.log('ℹ️  Aucune correction nécessaire');
  }

  console.log('\n📋 Configuration actuelle:');
  const lines = envContent.split('\n').filter(line => 
    line.includes('CLIENT_URL') || 
    line.includes('GOOGLE_CALLBACK_URL')
  );
  lines.forEach(line => console.log(`  ${line}`));
}

fixOAuthConfig();
