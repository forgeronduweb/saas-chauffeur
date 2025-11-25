import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import JobOfferForm from '../component/forms/JobOfferForm';
import ProductOfferForm from '../component/forms/ProductOfferForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [offerType, setOfferType] = useState(null); // 'job' ou 'product'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMobileFab, setShowMobileFab] = useState(false);
  const [cameFromUrl, setCameFromUrl] = useState(false); // Pour savoir si on vient d'une URL avec paramètre
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOffer, setCreatedOffer] = useState(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      // Rediriger vers la page d'authentification avec l'URL de retour
      const currentPath = `/publier-offre${window.location.search}`;
      navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, navigate]);

  // Détecter le type depuis l'URL et gérer les permissions
  useEffect(() => {
    if (!user) return; // Attendre que l'utilisateur soit chargé
    
    const typeFromUrl = searchParams.get('type');
    
    // Si c'est un chauffeur, TOUJOURS le rediriger vers offre marketing
    if (user.role === 'driver') {
      if (typeFromUrl === 'job') {
        setError('Seuls les employeurs peuvent créer des offres d\'emploi');
      }
      setOfferType('product');
      setCameFromUrl(false);
      return;
    }
    
    // Pour les employeurs, gérer normalement
    if (typeFromUrl === 'job' || typeFromUrl === 'product') {
      setOfferType(typeFromUrl);
      setCameFromUrl(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, user]);

  // Afficher un loader pendant la vérification
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  const handleJobSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      console.log('Données de l\'offre d\'emploi à envoyer:', formData);
      
      // Préparer les données pour l'API
      const jobData = {
        title: formData.title,
        description: formData.description,
        type: formData.type, // Personnel, Livraison, VTC, Transport, etc.
        requirements: {
          licenseType: formData.requirements.licenseType,
          experience: formData.requirements.experience,
          vehicleType: formData.requirements.vehicleType,
          zone: formData.requirements.zone
        },
        conditions: {
          salary: parseFloat(formData.conditions.salary),
          salaryType: formData.conditions.salaryType,
          workType: formData.conditions.workType,
          startDate: new Date(formData.conditions.startDate),
          schedule: formData.conditions.schedule
        },
        location: {
          address: formData.location.address,
          city: formData.location.city
        },
        contactInfo: {
          preferredContact: 'platform' // Contact via la plateforme uniquement
        },
        requirementsList: formData.requirementsList || [],
        benefits: formData.benefits || [],
        status: 'active'
      };

      console.log('Données formatées:', jobData);

      // Appel API pour créer l'offre d'emploi
      const response = await offersApi.create(jobData);
      console.log('Offre d\'emploi créée avec succès:', response.data);
      
      // Afficher la modal de succès
      setCreatedOffer({ ...response.data, type: 'job' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Erreur lors de la création de l\'offre:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      console.log('Données du produit à envoyer:', formData);
      
      // Préparer les données pour l'API
      const productData = {
        title: formData.title,
        description: formData.description,
        type: 'Autre', // Type pour les produits
        category: formData.category,
        price: formData.price ? Number(formData.price) : 0,
        brand: formData.brand,
        condition: formData.condition,
        deliveryOptions: formData.deliveryOptions,
        location: {
          address: formData.location?.address || '',
          city: formData.location?.city || 'Abidjan'
        },
        contactInfo: formData.contactInfo,
        requirementsList: formData.requirementsList || [],
        benefits: formData.benefits || [],
        images: formData.images || [],
        mainImage: formData.mainImage || '',
        additionalImages: formData.additionalImages || [],
        tags: [formData.category?.toLowerCase(), formData.brand?.toLowerCase()].filter(Boolean),
        status: 'active',
        // Champs requis par le modèle Offer
        requirements: {
          licenseType: 'B',
          experience: '1-3 ans',
          vehicleType: 'autre',
          zone: formData.location?.city || 'Abidjan'
        },
        conditions: {
          salary: formData.price ? Number(formData.price) : 0,
          salaryType: 'mensuel',
          workType: 'temps_plein',
          startDate: new Date(),
          schedule: 'Disponible immédiatement'
        }
      };

      console.log('Données formatées:', productData);

      // Appel API pour créer l'offre produit
      const response = await offersApi.create(productData);
      console.log('Produit créé avec succès:', response.data);
      
      // Afficher la modal de succès
      setCreatedOffer({ ...response.data, type: 'product' });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Erreur lors de la création du produit:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    if (createdOffer?.type === 'job') {
      navigate('/offres');
    } else {
      navigate('/marketing-vente');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header complet sans sous-navigation */}
      <SimpleHeader hideSubNav={true} />

      <main className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {!offerType 
              ? (user?.role === 'driver' ? 'Publier une offre marketing' : 'Publier une offre')
              : offerType === 'job' 
                ? 'Offre d\'emploi' 
                : 'Produit Marketing & Vente'
            }
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {!offerType 
              ? (user?.role === 'driver' 
                  ? 'Vendez vos produits et services à la communauté' 
                  : 'Choisissez le type d\'offre à publier')
              : offerType === 'job' 
                ? 'Trouvez le chauffeur idéal pour votre entreprise' 
                : 'Vendez vos produits et services'
            }
          </p>
        </div>

        {/* Sélection du type d'offre */}
        {!offerType ? (
          <div className={`grid gap-6 ${user?.role === 'employer' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
            {console.log('User role:', user?.role, 'Is employer:', user?.role === 'employer')}
            {/* Offre d'emploi - UNIQUEMENT pour les employeurs */}
            {user?.role === 'employer' && (
              <button
                onClick={() => setOfferType('job')}
                className="group bg-white rounded-lg border border-gray-200 hover:border-orange-500 p-8 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                    <svg className="w-10 h-10 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Offre d'emploi</h3>
                  <p className="text-gray-600">Recrutez un chauffeur professionnel pour votre entreprise</p>
                </div>
              </button>
            )}

            {/* Marketing & Vente - Pour TOUS les utilisateurs connectés */}
            <button
              onClick={() => setOfferType('product')}
              className="group bg-white rounded-lg border border-gray-200 hover:border-orange-500 p-8 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                  <svg className="w-10 h-10 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing & Vente</h3>
                <p className="text-gray-600">Vendez vos produits et services {user?.role === 'driver' ? 'à la communauté' : 'aux chauffeurs'}</p>
              </div>
            </button>
          </div>
        ) : (
          /* Card avec formulaire - Padding adapté mobile */
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            {console.log('Affichage du formulaire pour:', offerType)}
            {offerType === 'job' ? (
              <JobOfferForm 
                onSubmit={handleJobSubmit}
                loading={loading}
                error={error}
              />
            ) : (
              <ProductOfferForm 
                onSubmit={handleProductSubmit}
                loading={loading}
                error={error}
              />
            )}
          </div>
        )}
      </main>

      {/* Bouton FAB mobile - Masqué car remplacé par le bouton dans le header */}
      {false && !offerType && user?.role === 'employer' && (
        <>
          {/* Bouton principal */}
          <button
            onClick={() => setShowMobileFab(!showMobileFab)}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
          >
            {showMobileFab ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
            )}
          </button>

          {/* Menu FAB */}
          {showMobileFab && (
            <>
              {/* Overlay */}
              <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowMobileFab(false)}
              />
              
              {/* Options du menu - Du bas vers le haut */}
              <div className="lg:hidden fixed bottom-24 right-6 z-50 space-y-3 flex flex-col-reverse">
                {/* Offre d'emploi - Affiché en haut */}
                <button
                  onClick={() => {
                    setOfferType('job');
                    setShowMobileFab(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 pr-2">Offre d'emploi</span>
                </button>

                {/* Marketing & Vente - Affiché en bas */}
                <button
                  onClick={() => {
                    setOfferType('product');
                    setShowMobileFab(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 pr-2">Marketing/Vente</span>
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Modal de succès */}
      <ConfirmDialog
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        onConfirm={handleSuccessConfirm}
        title={createdOffer?.type === 'job' ? "Offre d'emploi créée !" : "Produit publié !"}
        subtitle="Votre annonce est maintenant en ligne"
        message={`${createdOffer?.type === 'job' ? "Votre offre d'emploi" : "Votre produit"} "${createdOffer?.title}" a été ${createdOffer?.type === 'job' ? "créée" : "publié"} avec succès. ${createdOffer?.type === 'job' ? "Les chauffeurs peuvent maintenant postuler." : "Les acheteurs peuvent maintenant le voir."}`}
        confirmText="Voir mes annonces"
        cancelText=""
        type="success"
        loading={false}
      />
    </div>
  );
}
