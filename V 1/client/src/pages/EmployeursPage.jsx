import { Link } from "react-router-dom";

export default function EmployeursPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur text-slate-800 text-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#4F39F6"/>
            <path d="M12 16L20 12L28 16V28L20 32L12 28V16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16L20 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 32V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold text-slate-800">GoDriver</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 transition duration-500">
          <Link to="/" className="hover:text-slate-500 transition">
            Accueil
          </Link>
          <Link to="/chauffeurs" className="hover:text-slate-500 transition">
            Chauffeurs
          </Link>
          <Link to="/employeurs" className="text-indigo-600 font-medium">
            Employeurs
          </Link>
          <Link to="/comment-ca-marche" className="hover:text-slate-500 transition">
            Comment ça marche
          </Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth?mode=login" className="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-full">
            Se connecter
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Pour les Entreprises
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Trouvez des chauffeurs professionnels pour vos besoins de transport. 
            Publiez vos offres et recevez des candidatures de chauffeurs qualifiés dans votre région.
          </p>
        </div>
      </section>

      {/* Fonctionnement */}
      <section className="py-12 px-4 md:px-16 lg:px-24 xl:px-32 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Fonctionnement</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Chauffeurs vérifiés</h3>
              <p className="text-slate-600">
                Tous les chauffeurs ont un permis valide et une expérience confirmée.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Publication gratuite</h3>
              <p className="text-slate-600">
                Publiez vos offres sans frais et recevez des candidatures rapidement.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Service gratuit</h3>
              <p className="text-slate-600">
                Aucune commission prélevée. Le service est entièrement gratuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-12 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Comment publier une offre</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">1. Créez votre compte</h3>
              <p className="text-slate-600 mb-6">
                Inscrivez-vous avec les informations de votre entreprise.
              </p>
              
              <h3 className="text-lg font-medium text-slate-900 mb-4">2. Décrivez vos besoins</h3>
              <p className="text-slate-600">
                Type de mission, zone, horaires, salaire proposé.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">3. Recevez des candidatures</h3>
              <p className="text-slate-600 mb-6">
                Les chauffeurs intéressés postulent à votre offre.
              </p>
              
              <h3 className="text-lg font-medium text-slate-900 mb-4">4. Choisissez votre chauffeur</h3>
              <p className="text-slate-600">
                Consultez les profils et sélectionnez le candidat qui vous convient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="#4F39F6"/>
                  <path d="M12 16L20 12L28 16V28L20 32L12 28V16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16L20 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 32V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg font-bold">GoDriver</span>
              </div>
              <p className="text-slate-400">
                La plateforme de référence pour connecter chauffeurs et employeurs en Afrique.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/" className="hover:text-white transition">Accueil</Link></li>
                <li><Link to="/chauffeurs" className="hover:text-white transition">Chauffeurs</Link></li>
                <li><Link to="/comment-ca-marche" className="hover:text-white transition">Comment ça marche</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 GoDriver. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
