// Utilitaire pour déboguer la configuration API
export const debugConfig = () => {
  console.log('=== DEBUG API CONFIG ===');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Prod:', import.meta.env.PROD);
  console.log('Dev:', import.meta.env.DEV);
  console.log('========================');
};

// Fonction pour tester la connexion API
export const testApiConnection = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
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
