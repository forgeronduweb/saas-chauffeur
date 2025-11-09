// Utilitaire pour déboguer la configuration API
import { config, logConfig } from '../config/env';

// Fonction de debug pour afficher les variables d'environnement
export const debugConfig = () => {
  logConfig();
};

// Fonction pour tester la connexion API
export const testApiConnection = async () => {
  const apiUrl = config.api.url;
  
  try {
    console.log('Testing connection to:', `${apiUrl}/health`);
    const response = await fetch(`${apiUrl}/health`);
    const data = await response.json();
    console.log('API Health Check:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API Connection Error:', error);
    return { success: false, error: error.message };
  }
};
