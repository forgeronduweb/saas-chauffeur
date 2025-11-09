import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function TarifsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Tarifs transparents',
      link: '/register'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Plans adaptés à vos besoins',
      link: '/register'
    }
  ];

  const plans = [
    { name: 'Gratuit', price: '0 FCFA', description: 'Pour découvrir la plateforme', features: ['2 offres', 'Accès profils', 'Support email'] },
    { name: 'Professionnel', price: '15,000 FCFA/mois', description: 'Pour les entreprises', features: ['Offres illimitées', 'Accès prioritaire', 'Support prioritaire'], popular: true },
    { name: 'Entreprise', price: '35,000 FCFA/mois', description: 'Pour les grandes entreprises', features: ['Tout inclus', 'API personnalisée', 'Manager dédié'] }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <PublicPageLayout activeTab="tarifs">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Des tarifs transparents pour tous
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Choisissez le plan qui correspond à vos besoins. Sans engagement, sans surprise.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-2 max-w-xs mx-auto">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Annuel
              </button>
            </div>
            {billingPeriod === 'yearly' && (
              <p className="text-sm text-green-300 mt-3 font-medium">
                🎉 Économisez 2 mois avec le plan annuel !
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-blue-500 relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 font-semibold text-sm">
                    ⭐ PLUS POPULAIRE
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {formatPrice(plan.price[billingPeriod])}
                      </span>
                      <span className="text-gray-600 font-medium">FCFA</span>
                    </div>
                    <p className="text-gray-500 mt-2">
                      {billingPeriod === 'monthly' ? 'par mois' : 'par an'}
                    </p>
                  </div>

                  <Link
                    to="/auth"
                    className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                        : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plan.price[billingPeriod] === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  </Link>

                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Pourquoi choisir GoDriver ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Chauffeurs actifs</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">98%</h3>
                <p className="text-gray-600">Taux de satisfaction</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
                <p className="text-gray-600">Profils vérifiés</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
                <p className="text-gray-600">Support disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Y a-t-il des frais cachés ?
                </h3>
                <p className="text-gray-600">
                  Non, nos tarifs sont 100% transparents. Le prix affiché est le prix que vous payez, sans surprise.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Proposez-vous un essai gratuit ?
                </h3>
                <p className="text-gray-600">
                  Le plan Gratuit vous permet de tester la plateforme sans engagement. Pour les plans payants, contactez-nous pour un essai de 14 jours.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  Comment puis-je annuler mon abonnement ?
                </h3>
                <p className="text-gray-600">
                  Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucune pénalité n'est appliquée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'entreprises qui font confiance à GoDriver pour leurs besoins en chauffeurs professionnels.
          </p>
          <Link
            to="/auth"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>
    </PublicPageLayout>
  );
}
