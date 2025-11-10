import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <aside className="flex flex-col gap-3">
            <div className="flex items-center">
              <span className="text-xl font-bold">
                <span className="text-orange-500">Go</span>
                <span className="text-gray-900">Driver</span>
              </span>
            </div>
            <p className="text-sm text-gray-600">
              La plateforme qui connecte les chauffeurs professionnels avec les employeurs en Côte d'Ivoire.
            </p>
          </aside>

          {/* Entreprise */}
          <nav className="flex flex-col gap-2">
            <h6 className="text-gray-900 mb-2">Entreprise</h6>
            <Link to="/a-propos" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">À propos</Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          </nav>

          {/* Légal */}
          <nav className="flex flex-col gap-2">
            <h6 className="text-gray-900 mb-2">Légal</h6>
            <Link to="/conditions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Conditions d'utilisation</Link>
            <Link to="/confidentialite" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Politique de confidentialité</Link>
          </nav>

          {/* Support */}
          <nav className="flex flex-col gap-2">
            <h6 className="text-gray-900 mb-2">Support</h6>
            <Link to="/aide" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Centre d'aide</Link>
            <a href="mailto:contact@godriver.ci" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Email</a>
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
