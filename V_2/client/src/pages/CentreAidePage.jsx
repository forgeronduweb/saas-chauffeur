import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, HelpCircle, Book, MessageCircle, Phone, Mail, 
  ChevronDown, ChevronUp, User, Briefcase, CreditCard, 
  Shield, Settings, FileText, Clock, CheckCircle 
} from 'lucide-react';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function CentreAidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(null);

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: <Book className="w-5 h-5" /> },
    { id: 'account', name: 'Compte & Profil', icon: <User className="w-5 h-5" /> },
    { id: 'offers', name: 'Offres & Missions', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'payment', name: 'Paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', name: 'Sécurité', icon: <Shield className="w-5 h-5" /> },
    { id: 'settings', name: 'Paramètres', icon: <Settings className="w-5 h-5" /> }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Comment créer un compte sur GoDriver ?',
      answer: 'Pour créer un compte, cliquez sur "S\'inscrire" en haut de la page, choisissez votre type de compte (Chauffeur ou Employeur), puis remplissez le formulaire avec vos informations. Vous recevrez un email de confirmation pour activer votre compte.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Comment modifier mes informations de profil ?',
      answer: 'Connectez-vous à votre compte, accédez à "Mon Profil" depuis le menu, puis cliquez sur "Modifier". Vous pouvez mettre à jour vos informations personnelles, votre photo de profil, et vos documents. N\'oubliez pas de sauvegarder vos modifications.'
    },
    {
      id: 3,
      category: 'account',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Entrez votre adresse email et vous recevrez un lien pour réinitialiser votre mot de passe. Le lien est valable pendant 24 heures.'
    },
    {
      id: 4,
      category: 'offers',
      question: 'Comment postuler à une offre ?',
      answer: 'Parcourez les offres disponibles, cliquez sur celle qui vous intéresse, puis sur "Postuler". Vous pouvez ajouter un message personnalisé pour l\'employeur. Vous serez notifié par email et sur la plateforme de la réponse de l\'employeur.'
    },
    {
      id: 5,
      category: 'offers',
      question: 'Comment publier une offre d\'emploi ?',
      answer: 'En tant qu\'employeur, accédez à votre tableau de bord et cliquez sur "Créer une offre". Remplissez les détails de l\'offre (type de mission, lieu, salaire, etc.) et publiez. Votre offre sera visible par tous les chauffeurs qualifiés.'
    },
    {
      id: 6,
      category: 'offers',
      question: 'Puis-je annuler une candidature ?',
      answer: 'Oui, vous pouvez retirer votre candidature tant que l\'employeur ne l\'a pas encore acceptée. Allez dans "Mes Candidatures", trouvez l\'offre concernée et cliquez sur "Retirer la candidature".'
    },
    {
      id: 7,
      category: 'payment',
      question: 'Comment sont effectués les paiements ?',
      answer: 'Les paiements sont traités de manière sécurisée via notre plateforme. Pour les chauffeurs, les paiements sont effectués après validation de la mission. Pour les employeurs, plusieurs modes de paiement sont acceptés : carte bancaire, Mobile Money, et virement bancaire.'
    },
    {
      id: 8,
      category: 'payment',
      question: 'Quand vais-je recevoir mon paiement ?',
      answer: 'Les paiements sont généralement traités dans les 48-72 heures après la fin de la mission et la validation par l\'employeur. Vous recevrez une notification dès que le paiement est effectué.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Y a-t-il des frais de service ?',
      answer: 'GoDriver prélève une commission de 10% sur chaque transaction pour maintenir et améliorer la plateforme. Ce pourcentage est clairement indiqué avant toute transaction.'
    },
    {
      id: 10,
      category: 'security',
      question: 'Comment GoDriver vérifie-t-il les chauffeurs ?',
      answer: 'Tous les chauffeurs doivent soumettre des documents officiels (permis de conduire, carte d\'identité, casier judiciaire). Notre équipe vérifie manuellement chaque document avant d\'activer le compte. Les profils vérifiés reçoivent un badge.'
    },
    {
      id: 11,
      category: 'security',
      question: 'Mes données personnelles sont-elles sécurisées ?',
      answer: 'Oui, nous utilisons un cryptage SSL pour protéger toutes vos données. Vos informations personnelles ne sont jamais partagées avec des tiers sans votre consentement. Consultez notre politique de confidentialité pour plus de détails.'
    },
    {
      id: 12,
      category: 'security',
      question: 'Que faire en cas de problème avec un employeur/chauffeur ?',
      answer: 'Contactez immédiatement notre support via le chat ou par email. Nous avons une équipe dédiée pour résoudre les conflits. Vous pouvez également signaler un utilisateur directement depuis son profil.'
    },
    {
      id: 13,
      category: 'settings',
      question: 'Comment gérer mes notifications ?',
      answer: 'Allez dans "Paramètres" > "Notifications". Vous pouvez choisir de recevoir des notifications par email, SMS ou sur la plateforme. Personnalisez les types de notifications que vous souhaitez recevoir.'
    },
    {
      id: 14,
      category: 'settings',
      question: 'Comment supprimer mon compte ?',
      answer: 'Pour supprimer votre compte, allez dans "Paramètres" > "Compte" > "Supprimer mon compte". Cette action est irréversible et toutes vos données seront définitivement supprimées après 30 jours.'
    },
    {
      id: 15,
      category: 'settings',
      question: 'Puis-je avoir plusieurs comptes ?',
      answer: 'Non, chaque utilisateur ne peut avoir qu\'un seul compte par type (chauffeur ou employeur). Cependant, vous pouvez avoir un compte chauffeur et un compte employeur avec des emails différents.'
    }
  ];

  const quickLinks = [
    {
      title: 'Guide de démarrage',
      description: 'Tout ce qu\'il faut savoir pour commencer',
      icon: <Book className="w-8 h-8" />,
      link: '/comment-ca-marche',
      color: 'blue'
    },
    {
      title: 'Devenir partenaire',
      description: 'Rejoignez notre réseau de chauffeurs',
      icon: <User className="w-8 h-8" />,
      link: '/devenir-partenaire',
      color: 'green'
    },
    {
      title: 'Formations',
      description: 'Développez vos compétences',
      icon: <FileText className="w-8 h-8" />,
      link: '/formations',
      color: 'purple'
    },
    {
      title: 'Certifications',
      description: 'Obtenez votre badge professionnel',
      icon: <CheckCircle className="w-8 h-8" />,
      link: '/certifications',
      color: 'orange'
    }
  ];

  const contactMethods = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Chat en direct',
      description: 'Réponse en moins de 5 minutes',
      action: 'Démarrer le chat',
      color: 'blue'
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email',
      description: 'support@godriver.ci',
      action: 'Envoyer un email',
      color: 'green'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Téléphone',
      description: '+225 07 XX XX XX XX',
      action: 'Appeler',
      color: 'purple'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Horaires',
      description: 'Lun-Ven: 8h-18h, Sam: 9h-13h',
      action: 'Voir les horaires',
      color: 'orange'
    }
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

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <PublicPageLayout activeTab="aide">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-2xl md:text-5xl font-bold mb-6">
              Centre d'aide GoDriver
            </h1>
            <p className="text-base md:text-2xl text-blue-100 mb-8">
              Trouvez rapidement des réponses à vos questions
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.link}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 rounded-full ${getColorClasses(link.color)} flex items-center justify-center mb-4`}>
                    {link.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Questions fréquentes
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Aucune question trouvée. Essayez une autre recherche ou contactez notre support.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                      {openFaqId === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {openFaqId === faq.id && (
                      <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">
                Besoin d'aide supplémentaire ?
              </h2>
              <p className="text-base text-gray-600">
                Notre équipe est là pour vous aider
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`w-16 h-16 rounded-full ${getColorClasses(method.color)} flex items-center justify-center mx-auto mb-4`}>
                    {method.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{method.description}</p>
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-all">
                    {method.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-xl md:text-4xl font-bold mb-6">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-base text-blue-100 mb-8 max-w-2xl mx-auto">
            Notre équipe de support est disponible pour répondre à toutes vos questions
          </p>
          <button className="inline-block bg-white text-blue-600 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
            Contacter le support
          </button>
          <p className="mt-6 text-blue-200 text-sm">
            Temps de réponse moyen : moins de 2 heures
          </p>
        </div>
      </section>
    </PublicPageLayout>
  );
}
