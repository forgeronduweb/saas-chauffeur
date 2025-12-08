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
    { id: 'driver', name: 'Chauffeurs' },
    { id: 'employer', name: 'Employeurs' },
    { id: 'offers', name: 'Offres d\'emploi' },
    { id: 'marketplace', name: 'Marketplace' },
    { id: 'payment', name: 'Paiements' },
    { id: 'security', name: 'Sécurité' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Comment créer un compte sur GoDriver ?',
      answer: 'Cliquez sur "S\'inscrire" en haut à droite de la page. Choisissez votre type de compte : "Chauffeur" si vous cherchez un emploi, ou "Employeur" si vous recrutez. Remplissez le formulaire avec vos informations (nom, email, téléphone, mot de passe). Vous pouvez aussi vous inscrire rapidement avec votre compte Google. Une fois inscrit, vous accédez immédiatement à votre tableau de bord.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Comment modifier mes informations de profil ?',
      answer: 'Connectez-vous à votre compte, puis cliquez sur votre nom en haut à droite et sélectionnez "Mon Profil". Cliquez sur le bouton "Modifier" (en haut à droite sur PC, en bas sur mobile). Vous pouvez modifier vos informations personnelles, votre photo de profil, vos documents (pour les chauffeurs), ou les informations de votre entreprise (pour les employeurs). N\'oubliez pas de cliquer sur "Enregistrer" pour sauvegarder vos modifications.'
    },
    {
      id: 3,
      category: 'account',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié ?". Entrez l\'adresse email associée à votre compte. Vous recevrez un email avec un lien pour réinitialiser votre mot de passe. Suivez les instructions dans l\'email pour créer un nouveau mot de passe sécurisé.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Quelle est la différence entre un compte Chauffeur et Employeur ?',
      answer: 'Un compte Chauffeur vous permet de créer votre profil professionnel, postuler aux offres d\'emploi, recevoir des notifications pour les nouvelles opportunités, et communiquer avec les employeurs via la messagerie interne. Un compte Employeur vous permet de publier des offres d\'emploi, rechercher des chauffeurs qualifiés, consulter les candidatures reçues, et gérer vos recrutements. Vous pouvez aussi publier des annonces sur la marketplace (vente de véhicules, pièces, etc.).'
    },
    {
      id: 5,
      category: 'offers',
      question: 'Comment postuler à une offre d\'emploi ?',
      answer: 'Connectez-vous avec votre compte Chauffeur, puis allez dans "Offres d\'emploi" ou "Offres disponibles" dans votre tableau de bord. Parcourez les offres et utilisez les filtres (ville, type de contrat, horaire) pour affiner votre recherche. Cliquez sur une offre pour voir les détails complets. Si elle vous intéresse, cliquez sur "Postuler". Vous pouvez ajouter un message personnalisé pour vous présenter. L\'employeur recevra votre candidature et pourra consulter votre profil complet.'
    },
    {
      id: 6,
      category: 'offers',
      question: 'Comment publier une offre d\'emploi ?',
      answer: 'Connectez-vous avec votre compte Employeur. Cliquez sur "Publier une offre" (bouton orange en haut) ou accédez à votre tableau de bord. Choisissez "Offre d\'emploi" puis remplissez le formulaire : titre du poste, type de transport (chauffeur personnel, livraison, VIP, etc.), localisation, type de contrat (CDI, CDD, Indépendant), horaires, salaire, description détaillée, et exigences (permis, expérience, type de véhicule). Vous pouvez aussi cibler un chauffeur spécifique si vous avez déjà quelqu\'un en vue. Une fois publiée, votre offre est visible par tous les chauffeurs correspondant aux critères.'
    },
    {
      id: 7,
      category: 'offers',
      question: 'Puis-je modifier ou supprimer une offre après publication ?',
      answer: 'Oui, absolument. Depuis votre tableau de bord Employeur, accédez à "Mes offres". Vous pouvez modifier les détails d\'une offre à tout moment (description, salaire, exigences, etc.). Vous pouvez également désactiver temporairement une offre si vous avez trouvé un candidat, ou la supprimer définitivement. Les modifications sont prises en compte immédiatement.'
    },
    {
      id: 8,
      category: 'offers',
      question: 'Comment fonctionne la marketplace (Marketing & Vente) ?',
      answer: 'La marketplace GoDriver est un espace dédié à l\'écosystème des chauffeurs professionnels. Vous pouvez y vendre ou acheter : véhicules professionnels, pièces détachées, services d\'entretien, assurances spécialisées, formations, certifications, et équipements professionnels (GPS, dashcam, uniformes). Pour publier une annonce, cliquez sur "Publier une offre" et choisissez "Produit/Service". Remplissez les détails (titre, catégorie, prix, description, photos) et publiez. Les acheteurs intéressés peuvent vous contacter directement via la messagerie interne.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Quels sont les tarifs de GoDriver ?',
      answer: 'GoDriver propose 3 formules : Plan Gratuit (0 FCFA) avec 2 offres par mois et accès aux profils de base ; Plan Professionnel (15,000 FCFA/mois) avec offres illimitées, accès prioritaire aux chauffeurs, support prioritaire et statistiques avancées ; Plan Entreprise (35,000 FCFA/mois) avec tout inclus, API personnalisée, manager dédié, formation équipe et facturation mensuelle. Consultez la page "Tarifs" pour plus de détails. Aucun frais caché, les prix affichés sont les prix finaux.'
    },
    {
      id: 10,
      category: 'payment',
      question: 'Comment effectuer le paiement de mon abonnement ?',
      answer: 'Les paiements sont traités de manière sécurisée via notre plateforme. Nous acceptons plusieurs modes de paiement adaptés au marché ivoirien : Mobile Money (Orange Money, MTN Money, Moov Money), cartes bancaires (Visa, Mastercard), et virements bancaires. Vous pouvez gérer votre abonnement et vos paiements depuis votre tableau de bord. Des reçus sont automatiquement générés pour chaque transaction.'
    },
    {
      id: 11,
      category: 'payment',
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre tableau de bord. Si vous passez à un plan supérieur, la différence sera calculée au prorata. Si vous passez à un plan inférieur, le crédit restant sera appliqué sur votre prochaine facture. Aucune pénalité n\'est appliquée pour les changements de plan.'
    },
    {
      id: 12,
      category: 'payment',
      question: 'Comment annuler mon abonnement ?',
      answer: 'Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord, section "Paramètres" > "Abonnement". L\'annulation prend effet à la fin de votre période de facturation en cours. Vous conservez l\'accès à toutes les fonctionnalités jusqu\'à cette date. Aucun remboursement n\'est effectué pour la période déjà payée, mais vous ne serez plus facturé par la suite.'
    },
    {
      id: 13,
      category: 'security',
      question: 'Comment GoDriver vérifie-t-il les chauffeurs ?',
      answer: 'La sécurité est notre priorité. Tous les chauffeurs doivent soumettre des documents officiels lors de leur inscription : permis de conduire (recto-verso), carte d\'identité nationale, et éventuellement certificat de bonne conduite. Notre équipe vérifie manuellement chaque document pour s\'assurer de leur authenticité. Les profils vérifiés reçoivent un badge de validation. Nous vérifions également l\'expérience professionnelle déclarée lorsque c\'est possible.'
    },
    {
      id: 14,
      category: 'security',
      question: 'Mes données personnelles sont-elles sécurisées ?',
      answer: 'Oui, la protection de vos données est essentielle pour nous. Nous utilisons un cryptage SSL/TLS pour toutes les communications entre votre navigateur et nos serveurs. Vos informations personnelles (email, téléphone) ne sont jamais partagées publiquement. Les employeurs ne peuvent voir vos coordonnées qu\'après acceptation de votre candidature. Nous respectons le RGPD et les lois ivoiriennes sur la protection des données. Consultez notre politique de confidentialité pour plus de détails.'
    },
    {
      id: 15,
      category: 'security',
      question: 'Comment fonctionne la messagerie interne ?',
      answer: 'GoDriver dispose d\'une messagerie interne sécurisée pour faciliter la communication entre chauffeurs et employeurs. Toutes les conversations sont privées et protégées. Vous recevez des notifications pour les nouveaux messages. La messagerie permet de discuter des détails d\'une offre, organiser un entretien, ou demander des informations complémentaires sans partager vos coordonnées personnelles. Accédez à vos messages via l\'icône en haut à droite ou depuis votre tableau de bord.'
    },
    {
      id: 16,
      category: 'security',
      question: 'Que faire en cas de problème avec un utilisateur ?',
      answer: 'Si vous rencontrez un problème avec un utilisateur (comportement inapproprié, fausse information, arnaque), vous pouvez le signaler à notre équipe. Utilisez le bouton "Signaler" sur le profil concerné ou contactez-nous directement à support@godriver.ci. Notre équipe examine chaque signalement et prend les mesures appropriées (avertissement, suspension, bannissement). Nous prenons la sécurité de notre communauté très au sérieux.'
    },
    {
      id: 17,
      category: 'driver',
      question: 'Quels documents sont requis pour les chauffeurs ?',
      answer: 'Pour créer un profil chauffeur complet, vous devez fournir : Permis de conduire valide (recto-verso), Carte d\'identité nationale, Photo de profil professionnelle, et éventuellement : Certificat de bonne conduite, Attestation d\'assurance, Références professionnelles. Ces documents garantissent votre crédibilité et augmentent vos chances d\'être recruté.'
    },
    {
      id: 18,
      category: 'driver',
      question: 'Comment optimiser mon profil chauffeur ?',
      answer: 'Un profil complet attire plus d\'employeurs. Ajoutez une photo professionnelle, décrivez votre expérience détaillée, mentionnez vos spécialités (transport VIP, livraison, tourisme), indiquez vos disponibilités, et ajoutez vos références. Mettez à jour régulièrement votre statut et répondez rapidement aux messages pour montrer votre sérieux.'
    },
    {
      id: 19,
      category: 'driver',
      question: 'Puis-je postuler à plusieurs offres simultanément ?',
      answer: 'Oui, vous pouvez postuler à autant d\'offres que vous le souhaitez. Cependant, nous vous recommandons de cibler les offres qui correspondent réellement à votre profil et à vos attentes. Personnalisez chaque message de candidature pour augmenter vos chances. Vous pouvez suivre toutes vos candidatures depuis "Mes candidatures" dans votre tableau de bord.'
    },
    {
      id: 20,
      category: 'employer',
      question: 'Comment trouver le chauffeur idéal ?',
      answer: 'Utilisez notre recherche avancée avec filtres : localisation, type de transport, expérience, disponibilités, et évaluations. Consultez les profils vérifiés (badge vert). Lisez les avis précédents et vérifiez les documents. Vous pouvez aussi publier une offre ciblée pour attirer les meilleurs candidats.'
    },
    {
      id: 21,
      category: 'employer',
      question: 'Comment évaluer un chauffeur après un service ?',
      answer: 'Après la fin d\'une mission, vous recevrez une notification pour évaluer le chauffeur. Vous pouvez noter sur 5 étoiles et laisser un commentaire détaillé. Votre évaluation aide la communauté et permet au chauffeur d\'améliorer ses services. Soyez honnête et constructif dans vos commentaires.'
    },
    {
      id: 22,
      category: 'employer',
      question: 'Puis-je contacter directement un chauffeur ?',
      answer: 'Oui, vous pouvez contacter les chauffeurs directement via leur profil. Utilisez la messagerie interne pour discuter des détails avant de publier une offre ou pour proposer une mission directe. Les coordonnées personnelles ne sont partagées qu\'après accord mutuel pour protéger la vie privée de chacun.'
    },
    {
      id: 23,
      category: 'marketplace',
      question: 'Comment vendre sur la marketplace GoDriver ?',
      answer: 'Connectez-vous et cliquez sur "Publier une offre". Choisissez "Produit/Service" et sélectionnez la catégorie appropriée (véhicules, pièces, services, etc.). Remplissez tous les champs : titre, description détaillée, prix, photos de bonne qualité, et conditions de vente. Les acheteurs pourront vous contacter via la messagerie interne.'
    },
    {
      id: 24,
      category: 'marketplace',
      question: 'Quels types de produits puis-je vendre ?',
      answer: 'Vous pouvez vendre : véhicules professionnels (berlines, SUV, utilitaires), pièces détachées (moteurs, pneus, batteries), équipements (GPS, dashcam, systèmes de communication), services (entretien, réparation, detailing), formations (permis, sécurité routière), et assurances spécialisées pour chauffeurs.'
    },
    {
      id: 25,
      category: 'marketplace',
      question: 'Comment sécuriser une transaction sur la marketplace ?',
      answer: 'Rencontrez toujours l\'acheteur/vendeur dans un lieu public. Vérifiez l\'état du produit avant paiement. Utilisez des méthodes de paiement sécurisées. Conservez tous les documents de transaction. GoDriver propose un service d\'escrow pour les transactions importantes (contactez-nous pour en savoir plus). Signalez tout comportement suspect.'
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
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-12">
        <h1 className="text-3xl lg:text-4xl text-gray-900 mb-8">
          Centre d'aide
        </h1>
        <p className="text-gray-600 mb-6">
          Trouvez rapidement des réponses à vos questions
        </p>

        <div className="relative max-w-2xl mb-8">
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-orange-500 transition-colors"
          />
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
