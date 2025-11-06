import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Users, CheckCircle, Award, TrendingUp, Star, Clock } from 'lucide-react';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function CertificationsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&h=400&fit=crop',
      title: 'Certifications professionnelles',
      link: '/register',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&h=400&fit=crop',
      title: 'Devenez chauffeur certifié',
      link: '/register',
    },
  ];

  const certifications = [
    {
      id: 1,
      name: 'GoDriver Certifié',
      level: 'Bronze',
      description: 'Certification de base',
      price: 'Gratuit',
      icon: '🥉',
      duration: '1 semaine',
      requirements: ['Avoir un permis de conduire valide', 'Avoir 21 ans minimum'],
      benefits: ['Accès aux offres locales', 'Profil vérifié sur la plateforme'],
      color: 'orange',
    },
    {
      id: 2,
      name: 'GoDriver Professionnel',
      level: 'Argent',
      description: 'Niveau intermédiaire',
      price: '25,000 FCFA',
      icon: '🥈',
      duration: '2 semaines',
      requirements: ['Avoir la certification Bronze', 'Avoir un bon historique de conduite'],
      benefits: ['Plus de visibilité', 'Accès aux missions premium'],
      color: 'gray',
    },
    {
      id: 3,
      name: 'GoDriver Expert',
      level: 'Or',
      description: 'Excellence professionnelle',
      price: '50,000 FCFA',
      icon: '🥇',
      duration: '1 mois',
      requirements: ['Avoir la certification Argent', 'Avoir plus de 1 an d’expérience'],
      benefits: ['Badge Expert', 'Priorité sur les offres haut de gamme'],
      color: 'yellow',
    },
  ];

  const certificationProcess = [
    {
      step: 1,
      title: 'Inscription',
      description: 'Choisissez votre certification et inscrivez-vous en ligne',
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      step: 2,
      title: 'Formation',
      description: 'Suivez les modules de formation à votre rythme',
      icon: <Users className="w-6 h-6" />,
    },
    {
      step: 3,
      title: 'Évaluation',
      description: 'Passez les tests théoriques et pratiques',
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      step: 4,
      title: 'Certification',
      description: 'Recevez votre badge et certificat officiel',
      icon: <Award className="w-6 h-6" />,
    },
  ];

  const stats = [
    { value: '850+', label: 'Chauffeurs certifiés', icon: <Award className="w-8 h-8" /> },
    { value: '95%', label: 'Taux de réussite', icon: <TrendingUp className="w-8 h-8" /> },
    { value: '4.9/5', label: 'Satisfaction', icon: <Star className="w-8 h-8" /> },
    { value: '24/7', label: 'Support', icon: <Clock className="w-8 h-8" /> },
  ];

  const getColorClasses = (color) => {
    const colors = {
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', gradient: 'from-gray-400 to-gray-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', gradient: 'from-yellow-500 to-yellow-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600', gradient: 'from-red-500 to-red-600' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
    };
    return colors[color] || colors.blue;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <PublicPageLayout activeTab="certifications">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Devenez un chauffeur certifié GoDriver
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            Obtenez des certifications reconnues et démarquez-vous auprès des employeurs
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Commencer ma certification
          </Link>
        </div>
      </section>

      {/* Carrousel */}
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-8">
        <div className="relative bg-gray-200 rounded-xl overflow-hidden h-64 lg:h-96">
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
        </div>
      </div>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-md">
              <div className="text-blue-600 mb-3 flex justify-center">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {certifications.map((cert) => {
            const colors = getColorClasses(cert.color);
            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all transform hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-r ${colors.gradient} text-white p-8 text-center`}>
                  <div className="text-5xl mb-4">{cert.icon}</div>
                  <h3 className="text-2xl font-bold">{cert.name}</h3>
                  <p>{cert.level}</p>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{cert.description}</p>
                  <div className="flex justify-between mb-4 text-sm text-gray-600">
                    <span>Durée : {cert.duration}</span>
                    <span>Prix : {cert.price}</span>
                  </div>
                  <Link
                    to="/register"
                    className={`block w-full text-center bg-gradient-to-r ${colors.gradient} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition`}
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Processus de certification</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {certificationProcess.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
