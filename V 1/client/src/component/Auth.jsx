import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Notification from "./common/Notification";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState('chauffeur'); // 'chauffeur' ou 'employeur'
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginIdentifier: '', // Pour connexion (téléphone ou email)
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
    setNotification(null);

    try {
      if (isLogin) {
        // Connexion
        const result = await login(formData.loginIdentifier, formData.password);
        
        if (result.success) {
          setNotification({
            type: 'success',
            title: 'Connexion réussie !',
            message: `Bienvenue ${result.user.firstName || result.user.email}`
          });
          
          // Rediriger selon le rôle
          setTimeout(() => {
            if (result.user.role === 'driver') {
              navigate('/driver-dashboard');
            } else if (result.user.role === 'client') {
              navigate('/employer-dashboard');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          setNotification({
            type: 'error',
            title: 'Erreur de connexion',
            message: result.error || 'Identifiants incorrects'
          });
        }
      } else {
        // Inscription
        if (formData.password !== formData.confirmPassword) {
          setNotification({
            type: 'error',
            title: 'Erreur de validation',
            message: 'Les mots de passe ne correspondent pas'
          });
          setLoading(false);
          return;
        }

        const userData = {
          email: formData.email,
          password: formData.password,
          role: userType === 'chauffeur' ? 'driver' : 'client',
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || '', // Téléphone optionnel
        };

        // Ajouter les champs spécifiques aux chauffeurs
        if (userType === 'chauffeur') {
          userData.licenseNumber = formData.licenseNumber;
          userData.licenseType = 'B'; // Par défaut
          userData.licenseDate = new Date().toISOString().split('T')[0]; // Date actuelle par défaut
          userData.experience = formData.experience || '1-3';
          userData.vehicleType = 'berline'; // Par défaut
          userData.workZone = formData.zone || 'Paris';
          userData.specialties = ['transport_personnel'];
        }

        const result = await register(userData);
        
        if (result.success) {
          setNotification({
            type: 'success',
            title: 'Compte créé avec succès !',
            message: userType === 'chauffeur' 
              ? 'Votre profil chauffeur est en cours de validation'
              : 'Vous pouvez maintenant accéder à votre tableau de bord'
          });
          
          // Rediriger selon le rôle
          setTimeout(() => {
            if (result.user.role === 'driver') {
              navigate('/driver-dashboard');
            } else if (result.user.role === 'client') {
              navigate('/employer-dashboard');
            } else {
              navigate('/');
            }
          }, 2000);
        } else {
          setNotification({
            type: 'error',
            title: 'Erreur lors de la création du compte',
            message: result.error || 'Une erreur est survenue'
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setNotification({
        type: 'error',
        title: 'Erreur technique',
        message: 'Une erreur technique est survenue. Veuillez réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg bg-gray-50 border border-gray-200 p-6">
        {/* Logo */}
        <div className="py-4 flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#4F39F6"/>
              <path d="M12 16L20 12L28 16V28L20 32L12 28V16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16L20 20L28 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 32V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Titre */}
        <h1 className="mb-6 text-center text-2xl font-semibold">
          {isLogin ? 'Se connecter' : 'Créer un compte'}
        </h1>

        {/* Notification */}
        {notification && (
          <div className="mb-4">
            <Notification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </div>
        )}

        {/* Sélecteur de type d'utilisateur (uniquement pour l'inscription) */}
        {!isLogin && (
          <div className="mb-6">
            <label className="mb-2 block text-sm text-gray-600 font-medium">Je suis :</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserType('chauffeur')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'chauffeur'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Chauffeur
              </button>
              <button
                type="button"
                onClick={() => setUserType('employeur')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userType === 'employeur'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Employeur
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Champs communs */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm text-gray-600">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Prénom"
                    className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm text-gray-600">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Nom"
                    className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="mb-1 block text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="nom@exemple.ci"
                  className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </>
          )}

          {/* Champs pour connexion */}
          {isLogin && (
            <>
              <div className="mb-4">
                <label htmlFor="loginIdentifier" className="mb-1 block text-sm text-gray-600">Email ou Téléphone</label>
                <input
                  type="text"
                  id="loginIdentifier"
                  name="loginIdentifier"
                  value={formData.loginIdentifier || ''}
                  onChange={handleInputChange}
                  placeholder="nom@exemple.ci ou 07 12 34 56 78"
                  className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="mb-1 block text-sm text-gray-600">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </>
          )}

          {/* Champs pour inscription */}
          {!isLogin && (
            <>
              <div className="mb-4">
                <label htmlFor="password" className="mb-1 block text-sm text-gray-600">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  autoComplete="new-password"
                  className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="mb-1 block text-sm text-gray-600">Confirmer le mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmer le mot de passe"
                  autoComplete="new-password"
                  className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              
              {/* Champ spécifique pour les chauffeurs */}
              {userType === 'chauffeur' && (
                <div className="mb-4">
                  <label htmlFor="licenseNumber" className="mb-1 block text-sm text-gray-600">Numéro de permis de conduire</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="Ex: CI240001234"
                    className="py-2 w-full rounded border border-gray-300 bg-white px-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              )}
            </>
          )}


          {isLogin && (
            <div className="mb-2 text-right">
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-500">Mot de passe oublié ?</a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-2.5 font-medium w-full rounded bg-indigo-500 text-white transition-colors duration-300 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Connexion...' : 'Création...'}
              </>
            ) : (
              isLogin ? 'Se connecter' : 'Créer mon compte'
            )}
          </button>
        </form>

        {/* Réseaux sociaux pour connexion seulement */}
        {isLogin && (
          <>
            {/* Séparateur */}
            <div className="relative my-6 text-center">
              <span className="relative z-10 bg-gray-50 px-3 text-gray-500 text-sm">Ou se connecter avec</span>
              <div className="absolute top-1/2 left-0 h-px w-2/5 -translate-y-1/2 transform bg-gray-300"></div>
              <div className="absolute top-1/2 right-0 h-px w-2/5 -translate-y-1/2 transform bg-gray-300"></div>
            </div>

            {/* Bouton social */}
            <button type="button"
              className="flex py-2.5 w-full items-center justify-center gap-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                <path fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917">
                </path>
                <path fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691">
                </path>
                <path fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44">
                </path>
                <path fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917">
                </path>
              </svg>
              Google
            </button>
          </>
        )}

        {/* Basculer entre connexion et inscription */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-indigo-500 hover:text-indigo-600 font-medium"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>

        {/* Conditions d'utilisation */}
        <p className="mt-6 text-center text-xs text-gray-500">
          En {isLogin ? 'vous connectant' : 'créant un compte'}, vous acceptez nos
          <a href="#" className="underline hover:text-indigo-500"> Conditions d'utilisation</a> et notre 
          <a href="#" className="underline hover:text-indigo-500"> Politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
