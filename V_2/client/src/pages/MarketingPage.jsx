import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
  Award,
  Zap,
  Heart,
  Target
} from 'lucide-react'
import SimpleHeader from '../component/common/SimpleHeader'

const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState('chauffeurs')

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
      color: 'bg-blue-50 text-blue-600 border-blue-200'
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
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      icon: MapPin,
      title: 'Couverture Nationale',
      description: 'Présent dans toutes les grandes villes de Côte d\'Ivoire.',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
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
    <div className="min-h-screen bg-white">
      <SimpleHeader activeTab="marketing" readOnly={true} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Trouvez le Chauffeur Parfait en Quelques Clics
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-orange-100">
                La plateforme #1 en Côte d'Ivoire pour connecter employeurs et chauffeurs professionnels
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-orange-600 font-bold text-lg hover:bg-orange-50 transition-colors text-center"
                >
                  Commencer Gratuitement
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-orange-600 transition-colors flex items-center justify-center space-x-2">
                  <Play className="w-6 h-6" />
                  <span>Voir la Démo</span>
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 border-2 border-white/20 p-8">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop"
                  alt="Chauffeur professionnel"
                  className="w-full h-auto border-4 border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 p-6 text-center">
                <stat.icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm lg:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir GoDriver ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui simplifie la recherche et la gestion de chauffeurs professionnels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 p-8 hover:border-orange-500 transition-colors">
                <div className={`w-16 h-16 ${feature.color} border-2 flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comment Ça Marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Simple, rapide et efficace en 3 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Créez Votre Compte
              </h3>
              <p className="text-gray-600 text-lg">
                Inscription gratuite en moins de 2 minutes. Remplissez votre profil et vos besoins.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trouvez Votre Chauffeur
              </h3>
              <p className="text-gray-600 text-lg">
                Parcourez les profils, consultez les avis et sélectionnez le chauffeur idéal.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Démarrez Votre Mission
              </h3>
              <p className="text-gray-600 text-lg">
                Contactez directement le chauffeur et commencez votre collaboration en toute sérénité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Ce Que Disent Nos Utilisateurs
            </h2>
            <p className="text-xl text-gray-600">
              Des milliers de personnes nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 border-2 border-gray-200"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tarifs Transparents
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white border-2 p-8 ${
                  plan.highlighted
                    ? 'border-orange-500 relative'
                    : 'border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-2 text-sm font-bold">
                    POPULAIRE
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price}
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-4 font-bold text-lg transition-colors ${
                    plan.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur GoDriver
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border-2 border-gray-200">
                <button className="w-full p-6 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900 pr-8">
                      {faq.question}
                    </h3>
                    <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-gray-600 mt-3 leading-relaxed">
                    {faq.answer}
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Prêt à Commencer ?
          </h2>
          <p className="text-xl lg:text-2xl mb-10 text-orange-100">
            Rejoignez des milliers d'utilisateurs satisfaits et trouvez votre chauffeur idéal dès aujourd'hui
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-5 bg-white text-orange-600 font-bold text-xl hover:bg-orange-50 transition-colors"
            >
              Créer un Compte Gratuit
            </Link>
            <Link
              to="/drivers"
              className="px-10 py-5 border-2 border-white text-white font-bold text-xl hover:bg-white hover:text-orange-600 transition-colors"
            >
              Parcourir les Chauffeurs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
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
              <h3 className="font-bold text-lg mb-4">Liens Rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/drivers" className="hover:text-white">Chauffeurs</Link></li>
                <li><Link to="/offers" className="hover:text-white">Offres d'emploi</Link></li>
                <li><Link to="/about" className="hover:text-white">À propos</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Centre d'aide</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-white">Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Confidentialité</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
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
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoDriver. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MarketingPage
