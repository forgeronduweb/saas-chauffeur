import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('❌ Erreur d\'authentification Google:', error);
        navigate('/auth?mode=login&error=' + error);
        return;
      }

      if (!token) {
        console.error('❌ Aucun token reçu');
        navigate('/auth?mode=login&error=no_token');
        return;
      }

      try {
        // Sauvegarder le token temporairement
        localStorage.setItem('token', token);

        // Récupérer le profil utilisateur
        const response = await authService.getProfile();
        const user = response.data.user || response.data;

        console.log('✅ Authentification Google réussie:', user);
        console.log('🔍 Response complète:', response.data);
        console.log('🔍 needsRoleSelection:', user.needsRoleSelection);
        console.log('🔍 role:', user.role);

        // Si l'utilisateur doit choisir son rôle
        if (user.needsRoleSelection || user.role === 'client') {
          console.log('➡️ Redirection vers la sélection de rôle');
          // Rediriger vers la page de sélection de rôle avec le token
          navigate(`/role-selection?token=${token}`);
          return;
        }

        console.log('➡️ Redirection vers le dashboard:', user.role);

        // Sinon, sauvegarder l'utilisateur et rediriger selon le rôle
        localStorage.setItem('user', JSON.stringify(user));

        // Rediriger vers la page d'accueil
        navigate('/');
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du profil:', error);
        localStorage.removeItem('token');
        navigate('/auth?mode=login&error=profile_fetch_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
