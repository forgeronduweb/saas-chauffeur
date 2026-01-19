import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SimpleHeader from '../../component/common/SimpleHeader';
import ApplicationCard from '../../components/applications/ApplicationCard';
import { applicationsApi, messagesApi } from '../../services/api';

export default function MyApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/auth');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.myApplications();
      console.log('📋 Mes candidatures:', response.data);
      
      // Les données sont déjà dans le bon format grâce au nouveau contrôleur
      setApplications(response.data || []);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des candidatures:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des mises à jour de candidatures
  const handleApplicationUpdate = (updatedApplication) => {
    setApplications(prev => 
      prev.map(app => 
        app._id === updatedApplication._id ? updatedApplication : app
      )
    );
  };

  // Ouvrir la messagerie
  const handleOpenConversation = (conversationId) => {
    navigate(`/messages?conversation=${conversationId}`);
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <main className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base lg:text-lg text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 text-sm">Suivez l'état de vos candidatures aux offres d'emploi</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                userRole="driver"
                onUpdate={handleApplicationUpdate}
                onOpenConversation={handleOpenConversation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune candidature à afficher pour le moment</p>
          </div>
        )}

      </main>
    </div>
  );
}
