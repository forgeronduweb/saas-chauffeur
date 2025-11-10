import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function FormationsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Formations professionnelles',
      link: '/register'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Certifications reconnues',
      link: '/register'
    }
  ];

  const formations = [
    { title: 'Conduite défensive', description: 'Sécurité routière et anticipation', duration: '4h', icon: '🚗' },
    { title: 'Service client', description: 'Excellence relationnelle', duration: '3h', icon: '👥' },
    { title: 'Mécanique de base', description: 'Entretien véhicule', duration: '5h', icon: '🔧' },
    { title: 'Conduite VIP', description: 'Protocole haut de gamme', duration: '3h', icon: '⭐' },
    { title: 'Gestion administrative', description: 'Fiscalité et comptabilité', duration: '2h', icon: '📊' },
    { title: 'Premiers secours', description: 'Gestes d\'urgence', duration: '4h', icon: '🏥' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);


  return (
    <PublicPageLayout activeTab="formations">
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
        {/* Formations */}
        <div className="mb-6">
          <h2 className="text-lg lg:text-2xl font-normal text-gray-900 mb-6">
            Formations disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {formations.map((formation, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">{index + 1}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{formation.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{formation.description}</p>
                <p className="text-xs text-gray-500">Durée : {formation.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 lg:p-8 text-center">
          <h2 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-3">
            Commencez votre formation
          </h2>
          <p className="text-gray-600 mb-6">
            Inscrivez-vous pour accéder à toutes nos formations
          </p>
          <Link
            to="/register"
            className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            S'inscrire maintenant
          </Link>
        </div>
      </main>
    </PublicPageLayout>
  );
}
