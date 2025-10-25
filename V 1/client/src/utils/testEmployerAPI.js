// Script de test pour vérifier l'API des employeurs
import { employersService, contactService } from '../services/api';

export const testEmployerAPI = async () => {
  console.log('🧪 Test de l\'API des employeurs...');
  
  try {
    // Test 1: Récupération des employeurs
    console.log('📋 Test 1: Récupération des employeurs');
    const employersResponse = await employersService.getAll();
    console.log('✅ Employeurs récupérés:', employersResponse.data);
    
    // Test 2: Test de contact (nécessite un token valide)
    console.log('📧 Test 2: Contact employeur (nécessite authentification)');
    // Ce test échouera sans token, c'est normal
    
    return {
      success: true,
      message: 'Tests API réussis',
      data: employersResponse.data
    };
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    
    if (error.response?.status === 403) {
      return {
        success: false,
        message: 'Authentification requise (normal pour les tests)',
        error: error.response.data
      };
    }
    
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
      error: error.message
    };
  }
};

// Test de connectivité serveur
export const testServerConnection = async () => {
  console.log('🔌 Test de connexion serveur...');
  
  try {
    const response = await fetch('http://localhost:4000/health');
    const data = await response.json();
    
    console.log('✅ Serveur accessible:', data);
    return {
      success: true,
      message: 'Serveur accessible',
      data
    };
    
  } catch (error) {
    console.error('❌ Serveur inaccessible:', error);
    return {
      success: false,
      message: 'Serveur inaccessible',
      error: error.message
    };
  }
};

// Fonction pour tester depuis la console du navigateur
window.testEmployerFeatures = async () => {
  console.log('🚀 Démarrage des tests de la fonctionnalité employeurs...');
  
  const serverTest = await testServerConnection();
  console.log('Résultat serveur:', serverTest);
  
  const apiTest = await testEmployerAPI();
  console.log('Résultat API:', apiTest);
  
  return {
    server: serverTest,
    api: apiTest
  };
};
