/**
 * Configuration centralisée des variables d'environnement
 * Toutes les URLs et configurations doivent passer par ce fichier
 * 
 * IMPORTANT: Ne jamais mettre de valeurs en dur ici
 * Toutes les valeurs doivent venir du fichier .env
 */

// Vérification que les variables obligatoires sont définies
const requiredEnvVars = ['VITE_API_BASE_URL', 'VITE_API_URL'];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars);
  console.error('📝 Veuillez créer un fichier .env à la racine du projet client avec:');
  missingVars.forEach(varName => {
    console.error(`   ${varName}=...`);
  });
  throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
}

// Export des configurations
export const config = {
  // URLs de l'API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL, // URL avec /api
    url: import.meta.env.VITE_API_URL,           // URL sans /api
  },
  
  // Mode de l'application
  app: {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
};

// Fonction utilitaire pour logger la config (uniquement en dev)
export const logConfig = () => {
  if (config.app.isDev || config.app.enableDebug) {
    console.log('=== Configuration de l\'application ===');
    console.log('API Base URL:', config.api.baseUrl);
    console.log('API URL:', config.api.url);
    console.log('Mode:', config.app.mode);
    console.log('Debug:', config.app.enableDebug);
    console.log('=====================================');
  }
};

export default config;
