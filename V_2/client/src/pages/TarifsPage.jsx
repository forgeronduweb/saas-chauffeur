import { Link } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function TarifsPage() {
  const plans = [
    { name: 'Gratuit', price: '0 FCFA', description: 'Pour découvrir la plateforme', features: ['2 offres par mois', 'Accès aux profils', 'Support par email'] },
    { name: 'Professionnel', price: '15,000 FCFA/mois', description: 'Pour les entreprises', features: ['Offres illimitées', 'Accès prioritaire aux chauffeurs', 'Support prioritaire', 'Statistiques avancées'], popular: true },
    { name: 'Entreprise', price: '35,000 FCFA/mois', description: 'Pour les grandes entreprises', features: ['Tout inclus', 'API personnalisée', 'Manager dédié', 'Formation équipe', 'Facturation mensuelle'] }
  ];

  return (
    <PublicPageLayout activeTab="tarifs">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        <div className="mb-8">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
            Tarifs
          </h1>
          <p className="text-gray-600">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white border-2 ${
                plan.popular ? 'border-orange-500' : 'border-gray-200'
              } p-6`}
            >
              {plan.popular && (
                <div className="bg-orange-500 text-white text-center py-1 px-3 text-sm  mb-4 inline-block">
                  POPULAIRE
                </div>
              )}
              
              <h3 className="text-base font-medium text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <div className="text-3xl text-gray-900 mb-1">
                  {plan.price}
                </div>
              </div>

              <Link
                to="/auth"
                className={`block w-full text-center py-3 px-6  transition-colors ${
                  plan.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.price === '0 FCFA' ? 'Commencer' : 'Choisir ce plan'}
              </Link>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6">
          <h2 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className=" text-gray-900 mb-1">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-sm text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment.
              </p>
            </div>
            <div>
              <h3 className=" text-gray-900 mb-1">
                Y a-t-il des frais cachés ?
              </h3>
              <p className="text-sm text-gray-600">
                Non, nos tarifs sont transparents. Le prix affiché est le prix final.
              </p>
            </div>
            <div>
              <h3 className=" text-gray-900 mb-1">
                Comment annuler mon abonnement ?
              </h3>
              <p className="text-sm text-gray-600">
                Vous pouvez annuler à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
