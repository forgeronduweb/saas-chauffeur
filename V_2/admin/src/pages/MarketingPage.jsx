import React from 'react'
import { 
  Car, 
  Users, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Play,
  Zap,
  ExternalLink
} from 'lucide-react'

const MarketingPage = () => {
  const stats = [
    { icon: Users, value: '2,847+', label: 'Chauffeurs Actifs', color: 'text-orange-600' },
    { icon: Car, value: '15,000+', label: 'Courses Réalisées', color: 'text-blue-600' },
    { icon: Star, value: '4.8/5', label: 'Note Moyenne', color: 'text-yellow-600' },
    { icon: Shield, value: '100%', label: 'Paiements Sécurisés', color: 'text-green-600' }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Sécurité Garantie',
      description: 'Tous nos chauffeurs sont vérifiés et certifiés. Vos trajets en toute confiance.',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: Clock,
      title: 'Disponibilité 24/7',
      description: 'Service disponible à toute heure. Réservez quand vous voulez, où vous voulez.',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: Star,
      title: 'Chauffeurs Qualifiés',
      description: 'Des professionnels expérimentés avec d\'excellentes évaluations clients.',
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    },
    {
      icon: TrendingUp,
      title: 'Tarifs Compétitifs',
      description: 'Prix transparents et compétitifs. Pas de frais cachés, paiement sécurisé.',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: MapPin,
      title: 'Couverture Nationale',
      description: 'Présent dans toutes les grandes villes de Côte d\'Ivoire.',
      color: 'bg-orange-50 text-orange-600 border-orange-200'
    },
    {
      icon: Zap,
      title: 'Réservation Rapide',
      description: 'Trouvez un chauffeur en quelques clics. Interface simple et intuitive.',
      color: 'bg-pink-50 text-pink-600 border-pink-200'
    }
  ]

  const testimonials = [
    {
      name: 'Kouassi Jean',
      role: 'Directeur Commercial',
      avatar: 'https://ui-avatars.com/api/?name=Kouassi+Jean&background=f97316&color=fff',
      rating: 5,
      text: 'Service exceptionnel ! J\'ai trouvé un chauffeur professionnel en moins de 24h. GoDriver a transformé mes déplacements professionnels.'
    },
    {
      name: 'Aya Traoré',
      role: 'Entrepreneuse',
      avatar: 'https://ui-avatars.com/api/?name=Aya+Traore&background=3b82f6&color=fff',
      rating: 5,
      text: 'Plateforme fiable et sécurisée. Les chauffeurs sont tous vérifiés et très professionnels. Je recommande vivement !'
    },
    {
      name: 'Mamadou Koné',
      role: 'Chauffeur Partenaire',
      avatar: 'https://ui-avatars.com/api/?name=Mamadou+Kone&background=10b981&color=fff',
      rating: 5,
      text: 'Grâce à GoDriver, j\'ai multiplié mes revenus par 3. La plateforme est simple à utiliser et les paiements sont toujours à temps.'
    }
  ]

  const pricingPlans = [
    {
      name: 'Basique',
      price: 'Gratuit',
      description: 'Pour les particuliers',
      features: [
        'Accès à tous les chauffeurs',
        'Recherche illimitée',
        'Support par email',
        'Profil de base'
      ],
      buttonText: 'Commencer',
      highlighted: false
    },
    {
      name: 'Professionnel',
      price: '15,000 FCFA/mois',
      description: 'Pour les entreprises',
      features: [
        'Tout du plan Basique',
        'Chauffeurs prioritaires',
        'Support téléphonique',
        'Facturation mensuelle',
        'Statistiques avancées'
      ],
      buttonText: 'Essayer gratuitement',
      highlighted: true
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      description: 'Pour les grandes structures',
      features: [
        'Tout du plan Pro',
        'Gestionnaire de compte dédié',
        'API personnalisée',
        'Formation sur site',
        'Contrat personnalisé'
      ],
      buttonText: 'Nous contacter',
      highlighted: false
    }
  ]

  const faqs = [
    {
      question: 'Comment devenir chauffeur sur GoDriver ?',
      answer: 'Inscrivez-vous sur notre plateforme, soumettez vos documents (permis, assurance, carte grise), passez notre vérification et commencez à recevoir des offres.'
    },
    {
      question: 'Les paiements sont-ils sécurisés ?',
      answer: 'Oui, tous les paiements sont sécurisés via des plateformes de paiement certifiées. Vos informations bancaires sont protégées.'
    },
    {
      question: 'Puis-je annuler une réservation ?',
      answer: 'Oui, vous pouvez annuler gratuitement jusqu\'à 24h avant la date prévue. Des frais peuvent s\'appliquer pour les annulations tardives.'
    },
    {
      question: 'Comment sont vérifiés les chauffeurs ?',
      answer: 'Chaque chauffeur passe par une vérification complète : documents, antécédents, test de conduite et formation à nos standards de service.'
    },
    {
      question: 'Quelles villes sont couvertes ?',
      answer: 'Nous sommes présents à Abidjan, Yamoussoukro, Bouaké, San-Pédro, Daloa et dans toutes les grandes villes de Côte d\'Ivoire.'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header avec lien vers la page publique */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Page Marketing</h1>
            <p className="text-gray-600 mt-2">Prévisualisation de la page marketing publique</p>
          </div>
          <a
            href="http://localhost:5173/marketing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Voir la Page Publique</span>
          </a>
        </div>
      </div>

      {/* Hero Section Preview */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-12 border-2 border-gray-200">
        <div className="max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Trouvez le Chauffeur Parfait en Quelques Clics
          </h2>
          <p className="text-xl mb-6 text-orange-100">
            La plateforme #1 en Côte d'Ivoire pour connecter employeurs et chauffeurs professionnels
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-orange-600 font-bold hover:bg-orange-50 transition-colors">
              Commencer Gratuitement
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold hover:bg-white hover:text-orange-600 transition-colors flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Voir la Démo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="border-2 border-gray-200 p-6 text-center">
              <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Fonctionnalités</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border-2 border-gray-200 p-6">
              <div className={`w-16 h-16 ${feature.color} border-2 flex items-center justify-center mb-4`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Témoignages</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border-2 border-gray-200 p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center space-x-3">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 border-2 border-gray-200" />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tarifs</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`border-2 p-6 ${plan.highlighted ? 'border-orange-500 relative' : 'border-gray-200'}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 text-sm font-bold">
                  POPULAIRE
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-gray-600 mb-3">{plan.description}</p>
                <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 font-bold transition-colors ${
                  plan.highlighted
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-orange-500'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Questions Fréquentes</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-2 border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-bold text-gray-900 pr-8">{faq.question}</h4>
                <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-gray-600 mt-3">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 text-white border-2 border-gray-200 p-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">GoDriver</span>
            </div>
            <p className="text-gray-400">
              La plateforme de référence pour trouver des chauffeurs professionnels en Côte d'Ivoire.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>+225 07 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>contact@godriver.ci</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Abidjan, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Chauffeurs</li>
              <li>Offres d'emploi</li>
              <li>À propos</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketingPage
