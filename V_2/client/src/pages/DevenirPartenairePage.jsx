import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function DevenirPartenairePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Devenez chauffeur partenaire',
      subtitle: 'Rejoignez notre réseau professionnel',
      link: '/register'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Revenus attractifs',
      subtitle: 'Jusqu\'à 500 000 FCFA par mois',
      link: '/register'
    }
  ];

  const benefits = [
    {
      title: 'Revenus attractifs',
      description: 'Gagnez jusqu\'à 500 000 FCFA par mois',
      icon: '💵'
    },
    {
      title: 'Flexibilité totale',
      description: 'Choisissez vos horaires et zone',
      icon: '🕐'
    },
    {
      title: 'Sécurité garantie',
      description: 'Assurance professionnelle incluse',
      icon: '🔒'
    },
    {
      title: 'Réseau professionnel',
      description: 'Centaines d\'opportunités',
      icon: '👤'
    },
    {
      title: 'Formations continues',
      description: 'Développez vos compétences',
      icon: '📖'
    },
    {
      title: 'Reconnaissance',
      description: 'Système d\'évaluation transparent',
      icon: '⭐'
    }
  ];

  const steps = [
    { number: '1', title: 'Inscription', description: 'Créez votre compte en 5 minutes' },
    { number: '2', title: 'Vérification', description: 'Soumettez vos documents' },
    { number: '3', title: 'Formation', description: 'Formation en ligne gratuite' },
    { number: '4', title: 'Activation', description: 'Commencez à recevoir des offres' }
  ];

  const requirements = [
    'Permis de conduire valide (catégorie B minimum)',
    'Au moins 2 ans d\'expérience de conduite',
    'Casier judiciaire vierge',
    'Certificat médical de moins de 3 mois',
    'Carte d\'identité ou passeport valide'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <PublicPageLayout activeTab="partenaire">
      {/* Section publicitaire - Carrousel */}
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-4 lg:py-8">
        <div className="relative bg-gray-200 rounded-lg lg:rounded-xl overflow-hidden h-48 sm:h-64 lg:h-96">
          {/* Images du carrousel */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={banner.image} 
                alt={banner.title}
                onClick={() => navigate(banner.link)}
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
          ))}

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 lg:gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 lg:h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-6 lg:w-8' 
                    : 'bg-white/50 w-1.5 lg:w-2'
                }`}
              />
            ))}
          </div>

          {/* Boutons de navigation - masqués sur mobile */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 pb-8">
        {/* Avantages */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900 mb-6">
            Pourquoi devenir partenaire ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Étapes */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900 mb-6">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prérequis */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-normal text-gray-900 mb-6">
            Conditions requises
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 lg:p-8 text-center">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-600 mb-6">
            Inscrivez-vous dès maintenant et commencez à recevoir des offres
          </p>
          <Link
            to="/register"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Créer mon profil chauffeur
          </Link>
        </div>
      </main>
    </PublicPageLayout>
  );
}
