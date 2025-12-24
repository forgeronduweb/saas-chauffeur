import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState('chauffeur'); // 'chauffeur' ou 'employeur'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginIdentifier: '', // Pour connexion (téléphone ou email)
    email: '', // Pour inscription
    password: '',
    confirmPassword: '', // Pour confirmation mot de passe inscription
    firstName: '',
    lastName: '',
    phone: '',
    // Champs spécifiques chauffeur
    licenseNumber: '',
    experience: '',
    zone: '',
    availability: '',
    // Champs spécifiques employeur
    companyName: '',
    sector: ''
  });

  // Détecter le mode depuis l'URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login') {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Connexion
        const result = await login(formData.loginIdentifier, formData.password);
        
        if (result.success) {
          setSuccess(`Bienvenue ${result.user.firstName || result.user.email}`);
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          // Vérifier si l'erreur est liée à la vérification d'email
          if (result.requiresEmailVerification) {
            setError('Veuillez vérifier votre email avant de vous connecter');
            setTimeout(() => {
              navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
            }, 2000);
          } else {
            setError(result.error || 'Identifiants incorrects');
          }
        }
      } else {
        // Inscription
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        const userData = {
          email: formData.email,
          password: formData.password,
          role: userType === 'chauffeur' ? 'driver' : 'employer', // Rôle basé sur la sélection
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || '', // Téléphone optionnel
        };

        const result = await register(userData);
        
        if (result.success) {
          setSuccess('Compte créé avec succès ! Vérifiez votre email.');
          setTimeout(() => {
            // Rediriger vers la page de vérification d'email
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          }, 2000);
        } else {
          setError(result.error || 'Une erreur est survenue');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl border border-gray-300">
          <div className="p-8">
            {/* Titre simple */}
            <h2 className="text-2xl font-normal text-gray-900 mb-2 text-center">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center">
              {isLogin ? 'Accédez à votre espace personnel' : 'Rejoignez notre communauté de chauffeurs et employeurs'}
            </p>

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 font-normal">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700 font-normal">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Champs communs */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-normal text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Jean"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-normal text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Dupont"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Sélection du rôle */}
                  <div>
                    <label htmlFor="userType" className="block text-sm font-normal text-gray-700 mb-2">Je suis</label>
                    <select
                      id="userType"
                      name="userType"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all bg-white cursor-pointer"
                      required
                    >
                      <option value="chauffeur">Chauffeur</option>
                      <option value="employeur">Employeur</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-normal text-gray-700 mb-2">Adresse email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        placeholder="exemple@email.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Champs pour connexion */}
              {isLogin && (
                <>
                  <div>
                    <label htmlFor="loginIdentifier" className="block text-sm font-normal text-gray-700 mb-2">Email ou Téléphone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="loginIdentifier"
                        name="loginIdentifier"
                        value={formData.loginIdentifier || ''}
                        onChange={handleInputChange}
                        placeholder="exemple@email.com ou +225 XX XX XX XX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-normal text-gray-700 mb-2">Mot de passe</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Champs pour inscription */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-normal text-gray-700 mb-2">Mot de passe</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min. 6 caractères"
                          autoComplete="new-password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-normal text-gray-700 mb-2">Confirmation</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirmer"
                          autoComplete="new-password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}


              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Se souvenir de moi</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-normal">Mot de passe oublié ?</Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-500 text-white font-normal rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Connexion en cours...' : 'Création en cours...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Se connecter' : 'Créer mon compte'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLogin ? "M14 5l7 7m0 0l-7 7m7-7H3" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Réseaux sociaux pour connexion seulement */}
            {isLogin && (
              <>
                {/* Séparateur */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-normal">Ou continuer avec</span>
                  </div>
                </div>

                {/* Bouton social */}
                <button
                  type="button"
                  onClick={() => {
                    import('../config/env').then(({ config }) => {
                      window.location.href = `${config.api.url}/api/auth/google`;
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-normal text-gray-700">Google</span>
                </button>
              </>
            )}

            {/* Basculer entre connexion et inscription */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
                {' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-orange-500 font-normal hover:text-orange-600"
                >
                  {isLogin ? "Créer un compte gratuitement" : "Se connecter"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-normal">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
