import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employerService, offersApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function EmployerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployer = async () => {
      try {
        setLoading(true);
        const response = await employerService.getById(id);
        if (response.data?.employer) {
          setEmployer(response.data.employer);
          setError(null);
          
          // Récupérer les offres de cet employeur
          try {
            const offersResponse = await offersApi.list({ employerId: id });
            setOffers(offersResponse.data?.offers || []);
          } catch (offersErr) {
            console.error('Erreur offres:', offersErr);
          }
        } else {
          setError('Entreprise non trouvée');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Entreprise non trouvée');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !employer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-gray-600 text-lg">{error || 'Entreprise non trouvée'}</p>
          <button 
            onClick={() => navigate('/partenaire')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retour aux partenaires
          </button>
        </div>
      </div>
    );
  }

  const companyName = employer.companyName || `${employer.firstName} ${employer.lastName}`;
  const profilePhoto = employer.companyLogo || employer.userId?.profilePhotoUrl;
  const memberSince = employer.userId?.createdAt 
    ? new Date(employer.userId.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <SimpleHeader />
      
      <main className="max-w-5xl mx-auto pb-8">
        {/* Banner + Logo Section */}
        <div className="relative">
          {/* Banner */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-orange-400 rounded-b-lg"></div>
          
          {/* Logo */}
          <div className="absolute -bottom-12 md:-bottom-16 left-4 md:left-8">
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt={companyName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white object-cover bg-white"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white bg-gray-900 flex items-center justify-center">
                <span className="text-3xl md:text-4xl text-white">
                  {companyName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Company Info Header */}
        <div className="bg-white rounded-b-lg pt-16 md:pt-20 pb-4 px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl text-gray-900">{companyName}</h1>
              {employer.sector && (
                <p className="text-gray-600 mt-1">{employer.sector}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                {employer.city && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {employer.city}
                  </span>
                )}
                {employer.employeeCount && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {employer.employeeCount} employés
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Membre depuis {memberSince}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 mt-4 md:mt-0">
              {employer.website && (
                <a 
                  href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Site web
                </a>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contacter
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 px-4 md:px-0">
          {/* Left Column - Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* À propos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  {employer.description || 'Partenaire de confiance pour vos besoins en transport professionnel.'}
                </p>
              </CardContent>
            </Card>

            {/* Informations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employer.sector && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Secteur</p>
                      <p className="text-sm text-gray-900">{employer.sector}</p>
                    </div>
                  </div>
                )}
                {employer.city && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Localisation</p>
                      <p className="text-sm text-gray-900">{employer.city}</p>
                    </div>
                  </div>
                )}
                {employer.foundedYear && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Fondée en</p>
                      <p className="text-sm text-gray-900">{employer.foundedYear}</p>
                    </div>
                  </div>
                )}
                {employer.employeeCount && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Taille</p>
                      <p className="text-sm text-gray-900">{employer.employeeCount} employés</p>
                    </div>
                  </div>
                )}
                {employer.website && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Site web</p>
                      <a 
                        href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {employer.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-4">
            {/* Activité récente */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder pour les offres d'emploi */}
                  <div className="border-l-2 border-orange-500 pl-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Offres d'emploi publiées</span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      Cette entreprise publie régulièrement des offres d'emploi pour des chauffeurs professionnels.
                    </p>
                  </div>

                  {/* Placeholder pour les produits */}
                  <div className="border-l-2 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Produits et services</span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      Découvrez les produits et services proposés par cette entreprise.
                    </p>
                  </div>

                  {/* Badge membre */}
                  <div className="border-l-2 border-green-500 pl-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Partenaire vérifié</span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      {companyName} est un partenaire vérifié de notre plateforme.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offres d'emploi */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Offres d'emploi</CardTitle>
              </CardHeader>
              <CardContent>
                {offers.length > 0 ? (
                  <div className="space-y-3">
                    {offers.slice(0, 5).map((offer) => (
                      <div 
                        key={offer._id} 
                        onClick={() => navigate(`/offre/${offer._id}`)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <h4 className="text-sm text-gray-900">{offer.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          {offer.location && <span>{offer.location}</span>}
                          {offer.contractType && <span>• {offer.contractType}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Aucune offre d'emploi active pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
