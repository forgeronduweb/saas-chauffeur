import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, rediriger vers son dashboard
  if (user) {
    if (user.role === 'client') {
      return <Navigate to="/employer-dashboard" replace />;
    } else if (user.role === 'driver') {
      return <Navigate to="/driver-dashboard" replace />;
    }
  }

  // Si pas connecté, afficher la page publique
  return children;
}
