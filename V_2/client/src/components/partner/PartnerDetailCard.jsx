import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import partnerService from '../../services/partnerService';

const PartnerDetailCard = ({ partnerId, className = '' }) => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (partnerId) {
      fetchPartnerDetails();
    }
  }, [partnerId]);

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getPartnerDetails(partnerId);
      const formattedPartner = partnerService.formatPartnerData(response.partner);
      setPartner(formattedPartner);
    } catch (err) {
      console.error('Erreur lors du chargement des détails du partenaire:', err);
      setError('Impossible de charger les détails du partenaire');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !partner) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error || 'Partenaire non trouvé'}</p>
        </CardContent>
      </Card>
    );
  }

  const reputationScore = partnerService.calculateReputationScore(partner);
  const reputationLevel = partnerService.getReputationLevel(reputationScore);
  const recentOffers = partnerService.formatRecentOffers(partner.recentActivity);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {partner.logo ? (
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-gray-200">
                <span className="text-xl text-white font-bold">
                  {(partner.name || 'E')[0]}
                </span>
              </div>
            )}
          </div>
          
          {/* Informations principales */}
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{partner.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="capitalize">{partner.sector}</span>
              <span>•</span>
              <span>{partner.city}</span>
              <span>•</span>
              <span className={`text-${reputationLevel.color}-600 font-medium`}>
                {reputationLevel.icon} {reputationLevel.level}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Description */}
        {partner.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 text-sm">{partner.description}</p>
          </div>
        )}

        {/* Statistiques */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{partner.stats.totalJobOffers}</div>
              <div className="text-xs text-gray-500">Offres d'emploi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{partner.stats.totalProductOffers}</div>
              <div className="text-xs text-gray-500">Offres produits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{partner.stats.totalHires}</div>
              <div className="text-xs text-gray-500">Recrutements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reputationScore}</div>
              <div className="text-xs text-gray-500">Score réputation</div>
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Informations professionnelles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {partner.professional.sector && (
              <div>
                <span className="text-gray-500">Secteur:</span>
                <span className="ml-2 capitalize">{partner.professional.sector}</span>
              </div>
            )}
            {partner.professional.employeeCount && (
              <div>
                <span className="text-gray-500">Effectif:</span>
                <span className="ml-2">{partner.professional.employeeCount}</span>
              </div>
            )}
            {partner.professional.foundedYear && (
              <div>
                <span className="text-gray-500">Créée en:</span>
                <span className="ml-2">{partner.professional.foundedYear}</span>
              </div>
            )}
            {partner.professional.companyType && (
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 capitalize">
                  {partner.professional.companyType === 'sarl' && 'SARL'}
                  {partner.professional.companyType === 'sa' && 'SA'}
                  {partner.professional.companyType === 'entreprise_individuelle' && 'Entreprise individuelle'}
                  {partner.professional.companyType === 'association' && 'Association'}
                  {partner.professional.companyType === 'autre' && 'Autre'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {partner.contact.email && (
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2">{partner.contact.email}</span>
              </div>
            )}
            {partner.contact.companyEmail && (
              <div>
                <span className="text-gray-500">Email entreprise:</span>
                <span className="ml-2">{partner.contact.companyEmail}</span>
              </div>
            )}
            {partner.contact.phone && (
              <div>
                <span className="text-gray-500">Téléphone:</span>
                <span className="ml-2">{partner.contact.phone}</span>
              </div>
            )}
            {partner.contact.city && (
              <div>
                <span className="text-gray-500">Ville:</span>
                <span className="ml-2">{partner.contact.city}</span>
              </div>
            )}
            {partner.contact.website && (
              <div className="md:col-span-2">
                <span className="text-gray-500">Site web:</span>
                <a 
                  href={partner.contact.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-orange-600 hover:text-orange-700 underline"
                >
                  {partner.contact.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        {recentOffers.recent.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Activité récente</h4>
            <div className="space-y-2">
              {recentOffers.recent.map((offer, index) => (
                <div key={offer.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      offer.type === 'job' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></span>
                    <span className="font-medium">{offer.title}</span>
                  </div>
                  <div className="text-gray-500">
                    {offer.type === 'job' ? offer.contractType : `${offer.price} FCFA`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton d'action */}
        <div className="pt-4 border-t border-gray-200">
          <Link 
            to={`/entreprise/${partnerId}`}
            className="block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Voir le profil complet
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerDetailCard;
