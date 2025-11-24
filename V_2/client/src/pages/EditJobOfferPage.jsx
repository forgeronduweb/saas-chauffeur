import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import JobOfferForm from '../component/forms/JobOfferForm';

export default function EditJobOfferPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const response = await offersApi.getById(id);
        console.log('Offre récupérée:', response.data);

        // Empêcher l'édition des offres d'emploi directes
        if (response.data.isDirect) {
          alert("Les offres d'emploi directes ne peuvent pas être modifiées.");
          navigate('/employer/offers');
          return;
        }

        setOffer(response.data);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Offre non trouvée');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    // Sécurité supplémentaire côté client : ne pas envoyer de mise à jour pour une offre directe
    if (offer?.isDirect) {
      alert("Les offres d'emploi directes ne peuvent pas être modifiées.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Données à mettre à jour:', formData);

      // Préparer les données pour l'API - Uniquement les champs qui ont changé
      const updateData = {};
      
      // Comparer et ajouter uniquement les champs modifiés
      if (formData.title !== offer.title) updateData.title = formData.title;
      if (formData.description !== offer.description) updateData.description = formData.description;
      if (formData.type !== offer.type) updateData.type = formData.type;
      if (formData.company !== offer.company) updateData.company = formData.company;
      
      // Vérifier si la localisation a changé
      if (formData.location?.city !== offer.location?.city || 
          formData.location?.address !== offer.location?.address) {
        updateData.location = {
          address: formData.location?.address || '',
          city: formData.location?.city || 'Abidjan'
        };
      }
      
      // Vérifier si les conditions ont changé
      if (JSON.stringify(formData.conditions) !== JSON.stringify(offer.conditions)) {
        updateData.conditions = formData.conditions;
      }
      
      // Vérifier si les exigences ont changé
      if (JSON.stringify(formData.requirements) !== JSON.stringify(offer.requirements)) {
        updateData.requirements = formData.requirements;
      }
      
      // Vérifier si les listes ont changé
      if (JSON.stringify(formData.requirementsList) !== JSON.stringify(offer.requirementsList)) {
        updateData.requirementsList = formData.requirementsList;
      }
      
      if (JSON.stringify(formData.benefits) !== JSON.stringify(offer.benefits)) {
        updateData.benefits = formData.benefits;
      }
      
      // Toujours définir le contact via la plateforme
      updateData.contactInfo = {
        preferredContact: 'platform'
      };

      console.log('Données formatées:', updateData);

      // Appel API pour mettre à jour l'offre
      console.log('🔄 Envoi de la mise à jour...');
      console.log('📊 ID:', id);
      console.log('📦 Données:', updateData);
      
      const response = await offersApi.update(id, updateData);
      console.log('✅ Offre mise à jour:', response.data);

      alert('Offre mise à jour avec succès !');
      navigate('/employer/offers');
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Response:', err.response);
      console.error('❌ Data:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Erreur lors de la mise à jour de l\'offre';
      
      setError(errorMessage);
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  // Transformer les données de l'offre pour le formulaire
  const initialFormData = {
    title: offer.title || '',
    description: offer.description || '',
    type: offer.type || 'Personnel',
    company: offer.company || '',
    
    requirements: {
      licenseType: offer.requirements?.licenseType || 'B',
      experience: offer.requirements?.experience || '1-3 ans',
      vehicleType: offer.requirements?.vehicleType || 'berline',
      zone: offer.requirements?.zone || ''
    },
    
    conditions: {
      salary: offer.conditions?.salary || '',
      salaryType: offer.conditions?.salaryType || 'mensuel',
      workType: offer.conditions?.workType || 'temps_plein',
      startDate: offer.conditions?.startDate || '',
      schedule: offer.conditions?.schedule || ''
    },
    
    location: {
      address: offer.location?.address || '',
      city: offer.location?.city || 'Abidjan'
    },
    
    contactInfo: {
      preferredContact: 'platform'
    },
    
    requirementsList: offer.requirementsList || [],
    benefits: offer.benefits || []
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <SimpleHeader />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 active:text-gray-900 mb-3 sm:mb-4 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base sm:text-lg">Retour</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Modifier l'offre d'emploi
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Modifiez les informations de votre offre d'emploi
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 lg:p-8">
          <JobOfferForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            initialData={initialFormData}
          />
        </div>
      </main>
    </div>
  );
}
