import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import partnerService from '../../services/partnerService';

const PartnersStats = ({ filters = {}, className = '' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getPartnersStats(filters);
      const formattedStats = partnerService.formatStatsData(response.stats);
      setStats(formattedStats);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error || 'Statistiques non disponibles'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des partenaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.overview.totalPartners}</div>
              <div className="text-sm text-gray-500">Total partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.overview.activePartners}</div>
              <div className="text-sm text-gray-500">Partenaires actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{stats.overview.inactivePartners}</div>
              <div className="text-sm text-gray-500">Partenaires inactifs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par secteur */}
      {stats.distribution.sectors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par secteur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribution.sectors.map((sector, index) => (
                <div key={sector._id || index} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">
                    {sector._id || 'Non spécifié'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(sector.count / stats.overview.totalPartners) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {sector.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Répartition par ville */}
      {stats.distribution.cities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par ville</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.distribution.cities.slice(0, 5).map((city, index) => (
                <div key={city._id || index} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {city._id || 'Non spécifié'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(city.count / stats.overview.totalPartners) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {city.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top partenaires */}
      {stats.topPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partenaires les plus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPartners.map((partner, index) => (
                <div key={partner._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{partner.companyName}</div>
                      <div className="text-sm text-gray-500">
                        {partner.city} • {partner.sector}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{partner.totalHires}</div>
                    <div className="text-sm text-gray-500">recrutements</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques des offres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offres d'emploi */}
        {stats.offers.jobOffers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Offres d'emploi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.offers.jobOffers.map((offer, index) => (
                  <div key={offer._id || index} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">
                      {offer._id === 'active' ? 'Actives' : offer._id === 'expired' ? 'Expirées' : offer._id}
                    </span>
                    <span className="font-medium text-gray-900">{offer.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offres produits */}
        {stats.offers.productOffers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Offres produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.offers.productOffers.map((offer, index) => (
                  <div key={offer._id || index} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">
                      {offer._id === 'active' ? 'Actives' : offer._id === 'expired' ? 'Expirées' : offer._id}
                    </span>
                    <span className="font-medium text-gray-900">{offer.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PartnersStats;
