import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function CentreAidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(null);

  const categories = [
    { id: 'all', name: 'Toutes' },
    { id: 'account', name: 'Compte' },
    { id: 'offers', name: 'Offres' },
    { id: 'payment', name: 'Paiements' },
    { id: 'security', name: 'Sécurité' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Comment créer un compte sur GoDriver ?',
      answer: 'Cliquez sur "S\'inscrire", choisissez votre type de compte (Chauffeur ou Employeur), puis remplissez le formulaire. Vous recevrez un email de confirmation.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Comment modifier mes informations de profil ?',
      answer: 'Connectez-vous, accédez à "Mon Profil", puis cliquez sur "Modifier". Sauvegardez vos modifications.'
    },
    {
      id: 3,
      category: 'account',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre email et suivez les instructions.'
    },
    {
      id: 4,
      category: 'offers',
      question: 'Comment postuler à une offre ?',
      answer: 'Parcourez les offres, cliquez sur celle qui vous intéresse, puis sur "Postuler". Vous pouvez ajouter un message personnalisé.'
    },
    {
      id: 5,
      category: 'offers',
      question: 'Comment publier une offre d\'emploi ?',
      answer: 'En tant qu\'employeur, accédez à votre tableau de bord et cliquez sur "Créer une offre". Remplissez les détails et publiez.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Comment sont effectués les paiements ?',
      answer: 'Les paiements sont traités de manière sécurisée via notre plateforme. Plusieurs modes de paiement sont acceptés.'
    },
    {
      id: 7,
      category: 'payment',
      question: 'Y a-t-il des frais de service ?',
      answer: 'GoDriver prélève une commission de 10% sur chaque transaction. Ce pourcentage est clairement indiqué avant toute transaction.'
    },
    {
      id: 8,
      category: 'security',
      question: 'Comment GoDriver vérifie-t-il les chauffeurs ?',
      answer: 'Tous les chauffeurs doivent soumettre des documents officiels. Notre équipe vérifie manuellement chaque document.'
    },
    {
      id: 9,
      category: 'security',
      question: 'Mes données personnelles sont-elles sécurisées ?',
      answer: 'Oui, nous utilisons un cryptage SSL pour protéger toutes vos données. Consultez notre politique de confidentialité.'
    }
  ];

  const quickLinks = [
    { title: 'Devenir partenaire', link: '/partenaire' },
    { title: 'Formations', link: '/formations' },
    { title: 'Certifications', link: '/certifications' },
    { title: 'Tarifs', link: '/tarifs' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <PublicPageLayout activeTab="aide">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl text-gray-900 mb-3">
            Centre d'aide
          </h1>
          <p className="text-gray-600 mb-6">
            Trouvez rapidement des réponses à vos questions
          </p>

          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-4">
            Liens rapides
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.link}
                className="bg-white border border-gray-200 p-4 hover:border-orange-500 transition-colors"
              >
                <h3 className="text-gray-900">{link.title}</h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-gray-900 mb-6">
            Questions fréquentes
          </h2>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-gray-600">
                Aucune question trouvée. Essayez une autre recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-900 pr-4">{faq.question}</span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        openFaqId === faq.id ? 'transform rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaqId === faq.id && (
                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-200 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <h2 className="text-xl text-gray-900 mb-3">
            Besoin d'aide supplémentaire ?
          </h2>
          <p className="text-gray-600 mb-6">
            Contactez notre équipe de support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@godriver.ci"
              className="inline-block bg-orange-500 text-white px-8 py-3 hover:bg-orange-600 transition-colors"
            >
              Envoyer un email
            </a>
            <a 
              href="tel:+22507000000"
              className="inline-block border-2 border-gray-300 text-gray-700 px-8 py-3 hover:bg-gray-50 transition-colors"
            >
              Appeler
            </a>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
