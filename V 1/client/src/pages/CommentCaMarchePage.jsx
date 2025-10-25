import { Link } from "react-router-dom";

export default function CommentCaMarchePage() {
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
          <Link to="/employeurs" className="hover:text-slate-500 transition">
            Employeurs
          </Link>
          <Link to="/comment-ca-marche" className="text-indigo-600 font-medium">
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
            Comment ça marche
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            GoDriver met en relation les entreprises qui ont besoin de chauffeurs 
            avec des professionnels du transport qualifiés.
          </p>
        </div>
      </section>

      {/* Le processus */}
      <section className="py-12 px-4 md:px-16 lg:px-24 xl:px-32 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Pour les Employeurs */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Pour les Employeurs</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">1. Inscription</h3>
                  <p className="text-slate-600">Créez votre compte entreprise gratuitement.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">2. Publication</h3>
                  <p className="text-slate-600">Décrivez votre besoin de transport et publiez votre offre.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">3. Candidatures</h3>
                  <p className="text-slate-600">Recevez des candidatures de chauffeurs qualifiés.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">4. Recrutement</h3>
                  <p className="text-slate-600">Choisissez le chauffeur qui correspond à vos besoins.</p>
                </div>
              </div>
            </div>
            
            {/* Pour les Chauffeurs */}
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Pour les Chauffeurs</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">1. Profil</h3>
                  <p className="text-slate-600">Créez votre profil avec vos informations et expériences.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">2. Recherche</h3>
                  <p className="text-slate-600">Parcourez les offres de missions dans votre zone.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">3. Candidature</h3>
                  <p className="text-slate-600">Postulez aux offres qui vous intéressent.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">4. Mission</h3>
                  <p className="text-slate-600">Commencez votre nouvelle mission de transport.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Questions fréquentes */}
      <section className="py-12 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">Questions fréquentes</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Est-ce gratuit ?</h3>
              <p className="text-slate-600">
                Oui, GoDriver est entièrement gratuit. Aucune commission n'est prélevée sur les recrutements.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Comment sont vérifiés les chauffeurs ?</h3>
              <p className="text-slate-600">
                Chaque chauffeur fournit son permis de conduire et ses références professionnelles avant d'être accepté.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Comment se font les paiements ?</h3>
              <p className="text-slate-600">
                Les paiements se font directement entre employeur et chauffeur via Mobile Money, Orange Money ou virement bancaire.
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
                <li><Link to="/employeurs" className="hover:text-white transition">Employeurs</Link></li>
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
