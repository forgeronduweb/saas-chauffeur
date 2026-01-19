import { Link } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function CertificationsPage() {
  const certifications = [
    {
      name: 'GoDriver Certifié',
      level: 'Bronze',
      description: 'Certification de base pour débuter',
      price: 'Gratuit',
      duration: '1 semaine',
      requirements: ['Permis de conduire valide', '21 ans minimum'],
      benefits: ['Accès aux offres locales', 'Profil vérifié']
    },
    {
      name: 'GoDriver Professionnel',
      level: 'Argent',
      description: 'Niveau intermédiaire',
      price: '25,000 FCFA',
      duration: '2 semaines',
      requirements: ['Certification Bronze', 'Bon historique de conduite'],
      benefits: ['Plus de visibilité', 'Accès missions premium'],
      popular: true
    },
    {
      name: 'GoDriver Expert',
      level: 'Or',
      description: 'Excellence professionnelle',
      price: '50,000 FCFA',
      duration: '1 mois',
      requirements: ['Certification Argent', 'Plus d\'1 an d\'expérience'],
      benefits: ['Badge Expert', 'Priorité offres haut de gamme']
    }
  ];

  const steps = [
    { number: '1', title: 'Inscription', description: 'Choisissez votre certification' },
    { number: '2', title: 'Formation', description: 'Suivez les modules en ligne' },
    { number: '3', title: 'Évaluation', description: 'Passez les tests' },
    { number: '4', title: 'Certification', description: 'Recevez votre badge' }
  ];

  return (
    <PublicPageLayout activeTab="certifications">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl text-gray-900 mb-3">
            Certifications
          </h1>
          <p className="text-gray-600">
            Obtenez des certifications reconnues et démarquez-vous
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className={`bg-white border-2 ${
                cert.popular ? 'border-orange-500' : 'border-gray-200'
              } p-6`}
            >
              {cert.popular && (
                <div className="bg-orange-500 text-white text-center py-1 px-3 text-sm  mb-4 inline-block">
                  POPULAIRE
                </div>
              )}
              
              <h3 className="text-xl text-gray-900 mb-1">{cert.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{cert.level}</p>
              <p className="text-gray-600 mb-4">{cert.description}</p>
              
              <div className="mb-4">
                <div className="text-2xl text-gray-900 mb-1">
                  {cert.price}
                </div>
                <p className="text-sm text-gray-500">Durée : {cert.duration}</p>
              </div>

              <Link
                to="/auth"
                className={`block w-full text-center py-3 px-6  transition-colors mb-6 ${
                  cert.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                S'inscrire
              </Link>

              <div className="space-y-3">
                <div>
                  <h4 className="text-gray-900 mb-2 text-sm">Prérequis:</h4>
                  <ul className="space-y-1">
                    {cert.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-gray-900 mb-2 text-sm">Avantages:</h4>
                  <ul className="space-y-1">
                    {cert.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-6">
            Processus de certification
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

        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <h2 className="text-xl text-gray-900 mb-3">
            Prêt à vous certifier ?
          </h2>
          <p className="text-gray-600 mb-6">
            Commencez votre parcours de certification dès aujourd'hui
          </p>
          <Link
            to="/auth"
            className="inline-block bg-orange-500 text-white px-8 py-3  hover:bg-orange-600 transition-colors"
          >
            Commencer
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
