import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Veuillez sélectionner un rôle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = searchParams.get('token');
      if (!token) {
        navigate('/auth?mode=login&error=no_token');
        return;
      }

      // Sauvegarder le token
      localStorage.setItem('token', token);

      // Mettre à jour le rôle
      console.log('📤 Envoi du rôle:', selectedRole);
      const updateResponse = await authService.updateRole(selectedRole);
      console.log('📥 Réponse updateRole:', updateResponse.data);

      // Récupérer le profil mis à jour
      const response = await authService.getProfile();
      console.log('📥 Réponse getProfile complète:', response.data);
      
      const user = response.data.user || response.data;
      console.log('👤 User extrait:', user);
      console.log('🔍 Role du user:', user.role);
      
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 User sauvegardé dans localStorage');

      console.log('✅ Rôle sélectionné:', user);

      // Rediriger vers la page d'accueil après la sélection de rôle
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du rôle:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Titre simple */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl text-gray-900 mb-2">
            Bienvenue sur GoDriver !
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Choisissez votre profil pour continuer
          </p>
        </div>

        <div className="">
            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

          {/* Sélection de rôle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            {/* Carte Chauffeur */}
            <button
              onClick={() => setSelectedRole('driver')}
              className={`p-6 md:p-8 border-2 rounded-lg transition-colors ${
                selectedRole === 'driver'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-500'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icône Chauffeur */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 md:mb-4 ${
                  selectedRole === 'driver' ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-8 h-8 md:w-10 md:h-10 ${selectedRole === 'driver' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className={`text-lg md:text-xl mb-1 md:mb-2 ${
                  selectedRole === 'driver' ? 'text-orange-500' : 'text-gray-900'
                }`}>
                  Je suis Chauffeur
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Trouvez des missions et développez votre activité
                </p>
              </div>
            </button>

            {/* Carte Employeur */}
            <button
              onClick={() => setSelectedRole('employer')}
              className={`p-6 md:p-8 border-2 rounded-lg transition-colors ${
                selectedRole === 'employer'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-500'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icône Employeur */}
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 md:mb-4 ${
                  selectedRole === 'employer' ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <svg className={`w-8 h-8 md:w-10 md:h-10 ${selectedRole === 'employer' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-lg md:text-xl mb-1 md:mb-2 ${
                  selectedRole === 'employer' ? 'text-orange-500' : 'text-gray-900'
                }`}>
                  Je suis Employeur
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Recrutez des chauffeurs qualifiés pour votre entreprise
                </p>
              </div>
            </button>
          </div>

          {/* Bouton de confirmation */}
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="w-full py-3 md:py-3.5 bg-orange-500 text-white text-sm md:text-base rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm md:text-base">Confirmation en cours...</span>
              </>
            ) : (
              <>
                <span className="text-sm md:text-base">Continuer</span>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
