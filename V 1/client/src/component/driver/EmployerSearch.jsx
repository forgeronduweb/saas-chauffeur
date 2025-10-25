import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import EmployerContactModal from './EmployerContactModal';
import { employersService } from '../../services/api';

export default function EmployerSearch({ loading }) {
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [loadingEmployers, setLoadingEmployers] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les employeurs depuis l'API
  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    setLoadingEmployers(true);
    try {
      console.log('🔄 Chargement des employeurs...');
      const response = await employersService.getAll();
      console.log('✅ Réponse API employeurs:', response.data);
      const employersData = response.data.data || [];
      console.log('📋 Employeurs récupérés:', employersData.length);
      setEmployers(employersData);
      setFilteredEmployers(employersData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des employeurs:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      // En cas d'erreur, utiliser des données de fallback
      const fallbackEmployers = [
        {
          _id: 'fallback-1',
          companyName: 'TransportCorp',
          sector: 'Logistique',
          location: 'Paris',
          description: 'Entreprise de transport et logistique leader en France',
          activeOffers: 5,
          totalEmployees: 150,
          website: 'www.transportcorp.fr',
          contactEmail: 'recrutement@transportcorp.fr',
          logo: null,
          isActive: true,
          createdAt: '2024-01-15'
        }
      ];
      setEmployers(fallbackEmployers);
      setFilteredEmployers(fallbackEmployers);
    } finally {
      setLoadingEmployers(false);
    }
  };

  // Filtrage des employeurs
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployers(employers);
    } else {
      const filtered = employers.filter(employer =>
        employer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employer.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employer.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployers(filtered);
    }
  }, [searchQuery, employers]);

  const handleContactEmployer = (employer) => {
    setSelectedEmployer(employer);
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    setSelectedEmployer(null);
  };

  if (loadingEmployers) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center justify-between lg:block">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rechercher des employeurs</h1>
            <p className="text-gray-600 mt-1 hidden lg:block">Contactez directement les employeurs qui vous intéressent</p>
          </div>
          
          {/* Bouton filtres mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21v-6.586a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z" />
            </svg>
          </button>
        </div>
        
        {/* Barre de recherche - Desktop seulement */}
        <div className="relative lg:w-96 hidden lg:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, secteur, ville..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filtres mobiles conditionnels */}
      {showFilters && (
        <div className="lg:hidden sticky top-16 z-10 bg-white border-b border-gray-200 pb-4">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, secteur, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={loadEmployers}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Employeurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{employers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total des offres</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employers.reduce((total, emp) => total + emp.activeOffers, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.196m0 0A3 3 0 0112 15.464m0 0V9a3 3 0 116 0v6.464m0 0a3 3 0 01-5.196 2.196M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Résultats</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredEmployers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des employeurs */}
      {filteredEmployers.length > 0 ? (
        <>
          {/* Version mobile */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            {filteredEmployers.map(employer => (
              <div key={employer._id} className="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
                {/* Figure - Logo de l'entreprise en haut */}
                <figure className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {employer.companyName.charAt(0)}
                  </span>
                  {employer.activeOffers > 0 && (
                    <div className="absolute top-2 right-2 badge badge-success badge-sm">
                      {employer.activeOffers}
                    </div>
                  )}
                </figure>

                {/* Card Body */}
                <div className="card-body p-3">
                  {/* Nom de l'entreprise */}
                  <h3 className="card-title text-sm font-bold text-gray-900 mb-2 leading-tight">
                    {employer.companyName}
                  </h3>

                  {/* Informations */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Secteur:</span>
                      <span className="font-medium text-gray-900 truncate ml-1">{employer.sector}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Lieu:</span>
                      <span className="font-medium text-gray-900 truncate ml-1">{employer.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Employés:</span>
                      <span className="font-medium text-gray-900">{employer.totalEmployees}</span>
                    </div>
                  </div>

                  {/* Bouton contact */}
                  <button 
                    onClick={() => handleContactEmployer(employer)}
                    className="btn btn-primary btn-xs w-full"
                  >
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Version desktop */}
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEmployers.map(employer => (
              <div 
                key={employer._id} 
                className="card bg-base-100 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden"
              >
                {/* Figure - Logo de l'entreprise en haut */}
                <figure className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-6xl">
                    {employer.companyName.charAt(0)}
                  </span>
                  {employer.activeOffers > 0 && (
                    <div className="absolute top-3 right-3 badge badge-success">
                      {employer.activeOffers} offre{employer.activeOffers > 1 ? 's' : ''}
                    </div>
                  )}
                </figure>

                {/* Card Body */}
                <div className="card-body p-4">
                  {/* Nom de l'entreprise */}
                  <h3 className="card-title text-base font-bold text-gray-900 mb-3">
                    {employer.companyName}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {employer.description}
                  </p>

                  {/* Informations */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Secteur:</span>
                      <span className="font-medium text-gray-900">{employer.sector}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Localisation:</span>
                      <span className="font-medium text-gray-900">{employer.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Employés:</span>
                      <span className="font-medium text-gray-900">{employer.totalEmployees}</span>
                    </div>

                    {employer.website && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Site web:</span>
                        <span className="font-medium text-blue-600 truncate ml-2">{employer.website}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton contact */}
                  <button 
                    onClick={() => handleContactEmployer(employer)}
                    className="btn btn-primary w-full"
                  >
                    Contacter cet employeur
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="Aucun employeur trouvé"
          description="Aucun employeur ne correspond à votre recherche. Essayez de modifier vos critères de recherche."
        />
      )}

      {/* Modal de contact */}
      <EmployerContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseModal}
        employer={selectedEmployer}
      />
    </div>
  );
}
