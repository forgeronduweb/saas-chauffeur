import { Link } from 'react-router-dom';
import PublicPageLayout from '../component/common/PublicPageLayout';

export default function FormationsPage() {
  const formations = [
    { title: 'Conduite défensive', description: 'Sécurité routière et anticipation des dangers', duration: '4 heures' },
    { title: 'Service client', description: 'Excellence relationnelle et communication', duration: '3 heures' },
    { title: 'Mécanique de base', description: 'Entretien et maintenance du véhicule', duration: '5 heures' },
    { title: 'Conduite VIP', description: 'Protocole et service haut de gamme', duration: '3 heures' },
    { title: 'Gestion administrative', description: 'Fiscalité et comptabilité pour chauffeurs', duration: '2 heures' },
    { title: 'Premiers secours', description: 'Gestes d\'urgence et sécurité', duration: '4 heures' }
  ];


  return (
    <PublicPageLayout activeTab="formations">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl text-gray-900 mb-3">
            Formations
          </h1>
          <p className="text-gray-600">
            Développez vos compétences professionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {formations.map((formation, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6">
              <div className="w-10 h-10 bg-orange-500 text-white flex items-center justify-center mb-4">{index + 1}</div>
              <h3 className="text-lg text-gray-900 mb-2">{formation.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{formation.description}</p>
              <p className="text-sm text-gray-500">Durée : {formation.duration}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 p-6 text-center">
          <h2 className="text-xl text-gray-900 mb-3">
            Commencez votre formation
          </h2>
          <p className="text-gray-600 mb-6">
            Inscrivez-vous pour accéder à toutes nos formations
          </p>
          <Link
            to="/auth"
            className="inline-block bg-orange-500 text-white px-8 py-3  hover:bg-orange-600 transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
