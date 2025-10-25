import React from 'react';
import EmployerSearch from '../component/driver/EmployerSearch';

export default function TestEmployerSearch() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test - Recherche d'Employeurs
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <EmployerSearch loading={false} />
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Fonctionnalités testées :
          </h2>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Chargement des employeurs depuis l'API</li>
            <li>Recherche en temps réel par nom, secteur, ville</li>
            <li>Design responsive mobile/desktop</li>
            <li>Cartes avec logo généré et informations</li>
            <li>Modal de contact avec formulaire complet</li>
            <li>Gestion d'erreurs et fallback</li>
            <li>Bouton de filtres mobile cohérent</li>
            <li>Notifications de succès/erreur personnalisées</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
