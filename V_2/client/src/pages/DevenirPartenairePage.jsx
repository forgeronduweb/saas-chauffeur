import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleHeader from '../component/common/SimpleHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export default function DevenirPartenairePage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employer/partners');
      setPartners(response.data.partners || []);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des partenaires:', err);
      setError('Impossible de charger les partenaires');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader activeTab="partenaire" />
      
      <main className="max-w-[1600px] mx-auto px-4 lg:px-16 pb-8 pt-6">
        {/* Liste des partenaires */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-12 text-center rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Aucune entreprise partenaire</h3>
            <p className="text-gray-600">
              Soyez le premier à rejoindre notre réseau de partenaires
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <Link key={partner._id} to={`/entreprise/${partner._id}`}>
              <Card className="max-w-[280px] cursor-pointer">
                <CardHeader className="text-center p-2 relative flex flex-col items-center justify-center w-full">
                  {/* Logo et Member en haut à gauche */}
                  <div className="absolute -top-3 left-3 flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span className="text-xs">Premier Partner</span>
                  </div>

                  {/* Logo */}
                  <div className="mb-1 mt-6 w-full">
                    {partner.companyLogo ? (
                      <img 
                        src={partner.companyLogo} 
                        alt={partner.companyName || 'Logo'}
                        className="w-14 h-14 md:w-16 md:h-16 object-contain mx-auto"
                      />
                    ) : partner.userId?.profilePhotoUrl ? (
                      <img 
                        src={partner.userId.profilePhotoUrl} 
                        alt={partner.companyName || `${partner.firstName} ${partner.lastName}` || 'Photo'}
                        className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl mx-auto"
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
                        <span className="text-lg md:text-2xl text-white">
                          {(partner.companyName || partner.firstName || 'E')?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-2 pl-4 pt-0 pb-0">
                  <CardTitle className="text-sm">
                    {partner.companyName || `${partner.firstName} ${partner.lastName}` || partner.email}
                  </CardTitle>
                  <CardDescription className="hidden md:block text-sm">
                    {partner.description || 'Partenaire de confiance pour vos besoins en transport professionnel.'}
                  </CardDescription>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
