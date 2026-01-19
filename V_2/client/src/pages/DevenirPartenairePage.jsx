import { Link } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function DevenirPartenairePage() {
  const benefits = [
    { title: 'Revenus attractifs', description: 'Gagnez jusqu\'à 500,000 FCFA par mois' },
    { title: 'Flexibilité totale', description: 'Choisissez vos horaires et votre zone' },
    { title: 'Sécurité garantie', description: 'Assurance professionnelle incluse' },
    { title: 'Réseau professionnel', description: 'Centaines d\'opportunités disponibles' },
    { title: 'Formations continues', description: 'Développez vos compétences' },
    { title: 'Reconnaissance', description: 'Système d\'évaluation transparent' }
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

  return (
    <PublicPageLayout activeTab="partenaire">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl text-gray-900 mb-3">
            Devenir partenaire
          </h1>
          <p className="text-gray-600">
            Rejoignez notre réseau de chauffeurs professionnels
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-6">
            Pourquoi devenir partenaire ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-gray-200 p-6">
                <div className="w-10 h-10 bg-orange-500 text-white flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-6">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="bg-white border border-gray-200 p-6">
                <div className="w-10 h-10 bg-orange-500 text-white flex items-center justify-center mb-4">
                  {step.number}
                </div>
                <h3 className="text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-6">
            Conditions requises
          </h2>
          <div className="bg-white border border-gray-200 p-6">
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <h2 className="text-xl text-gray-900 mb-3">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-600 mb-6">
            Inscrivez-vous dès maintenant et commencez à recevoir des offres
          </p>
          <Link
            to="/auth"
            className="inline-block bg-orange-500 text-white px-8 py-3  hover:bg-orange-600 transition-colors"
          >
            Créer mon profil
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
