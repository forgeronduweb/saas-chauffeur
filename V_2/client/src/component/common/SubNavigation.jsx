import { Link } from 'react-router-dom';

export default function SubNavigation({ activeTab = '' }) {
  return (
    <div className="border-t border-gray-200">
      <div className="max-w-[1600px] mx-auto">
        <nav className="flex items-center lg:justify-center gap-6 lg:gap-12 overflow-x-auto scrollbar-hide px-8 lg:px-16">
          <Link 
            to="/chauffeurs" 
            className={`py-2.5 lg:py-4 text-sm lg:text-lg whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
              activeTab === 'chauffeurs'
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Chauffeurs
          </Link>
          <Link 
            to="/offres" 
            className={`py-2.5 lg:py-4 text-sm lg:text-lg whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
              activeTab === 'offres'
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Offres d'emploi
          </Link>
          <Link 
            to="/marketing-vente" 
            className={`py-2.5 lg:py-4 text-sm lg:text-lg whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
              activeTab === 'marketing'
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Marketing & Vente
          </Link>
          <Link 
            to="/partenaire" 
            className={`py-2.5 lg:py-4 text-sm lg:text-lg whitespace-nowrap flex-shrink-0 transition-colors border-b-2 ${
              activeTab === 'partenaire'
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-500 hover:text-gray-900 border-transparent'
            }`}
          >
            Partenaire
          </Link>
          <span 
            className={`py-2.5 lg:py-4 text-sm lg:text-base whitespace-nowrap flex-shrink-0 border-b-2 cursor-not-allowed opacity-50 ${
              activeTab === 'formations'
                ? 'text-orange-600 border-orange-500'
                : 'text-gray-400 border-transparent'
            }`}
          >
            Formations
          </span>
        </nav>
      </div>
    </div>
  );
}
