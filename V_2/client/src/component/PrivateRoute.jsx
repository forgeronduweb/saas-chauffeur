import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('PrivateRoute - Loading:', loading);
  console.log('PrivateRoute - User:', user);

  // Pendant le chargement, afficher un spinner
  if (loading) {
    console.log('PrivateRoute - Affichage du spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Si non connecté, rediriger vers la page d'authentification
  if (!user) {
    console.log('PrivateRoute - Redirection vers /auth');
    return <Navigate to="/auth" replace />;
  }

  // Si connecté, afficher le contenu
  console.log('PrivateRoute - Utilisateur connecté, affichage du contenu');
  return children;
}
