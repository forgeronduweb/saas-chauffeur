import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <aside className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#F97316"/>
                <path d="M12 16L20 12L28 16V28L20 32L12 28V16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16L20 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 32V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">GoDriver</span>
            </div>
            <p className="text-sm text-gray-600">
              La plateforme qui connecte les chauffeurs professionnels avec les employeurs en Côte d'Ivoire.
            </p>
          </aside>

          {/* Services */}
          <nav className="flex flex-col gap-2">
            <h6 className="font-semibold text-gray-900 mb-2">Pour les chauffeurs</h6>
            <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Créer un compte</Link>
            <Link to="/drivers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Trouver un emploi</Link>
            <Link to="/formations" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Formations</Link>
            <Link to="/certifications" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Certifications</Link>
          </nav>

          {/* Employeurs */}
          <nav className="flex flex-col gap-2">
            <h6 className="font-semibold text-gray-900 mb-2">Pour les employeurs</h6>
            <Link to="/auth" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Publier une offre</Link>
            <Link to="/drivers" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Trouver un chauffeur</Link>
            <Link to="/tarifs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Tarifs</Link>
            <Link to="/partenaire" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Devenir partenaire</Link>
          </nav>

          {/* À propos */}
          <nav className="flex flex-col gap-2">
            <h6 className="font-semibold text-gray-900 mb-2">À propos</h6>
            <Link to="/aide" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Centre d'aide</Link>
            <a href="mailto:contact@godriver.ci" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            <Link to="/conditions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Conditions d'utilisation</Link>
            <Link to="/confidentialite" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Politique de confidentialité</Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} GoDriver. Tous droits réservés. | Abidjan, Côte d'Ivoire</p>
        </div>
      </div>
    </footer>
  );
}
