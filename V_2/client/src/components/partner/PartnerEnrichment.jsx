import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import partnerService from '../../services/partnerService';

const PartnerEnrichment = ({ partner, onEnrichmentComplete, className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const enrichmentStatus = partnerService.getEnrichmentStatus(partner);
  const completenessScore = partnerService.calculateCompletenessScore(partner);
  const canBeEnriched = partnerService.canBeEnriched(partner);

  const handleEnrichPartner = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await partnerService.enrichPartnerFromWeb(partner._id);
      
      setSuccess(`Partenaire enrichi avec succès ! ${result.updates?.length || 0} champs mis à jour`);
      
      // Notifier le composant parent
      if (onEnrichmentComplete) {
        onEnrichmentComplete(result);
      }

    } catch (err) {
      console.error('Erreur lors de l\'enrichissement:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'enrichissement du partenaire');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Enrichissement des données</span>
          <span className={`text-sm font-normal text-${enrichmentStatus.color}-600`}>
            {enrichmentStatus.icon} {enrichmentStatus.label}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score de complétude */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Complétude du profil</span>
            <span className={`text-sm font-medium text-${completenessScore.color}-600`}>
              {completenessScore.score}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${completenessScore.color}-500 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${completenessScore.score}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Niveau: {completenessScore.level}
          </p>
        </div>

        {/* Données d'enrichissement */}
        {partner.webEnrichment && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Données enrichies</h4>
            
            {/* Informations web */}
            <div className="space-y-2 text-sm">
              {partner.webEnrichment.data?.description && (
                <div>
                  <span className="text-gray-500">Description:</span>
                  <p className="text-gray-700 mt-1">{partner.webEnrichment.data.description}</p>
                </div>
              )}
              
              {partner.webEnrichment.data?.website && (
                <div>
                  <span className="text-gray-500">Site web:</span>
                  <a 
                    href={partner.webEnrichment.data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-orange-600 hover:text-orange-700 underline"
                  >
                    {partner.webEnrichment.data.website}
                  </a>
                </div>
              )}
              
              {partner.webEnrichment.data?.logo && (
                <div>
                  <span className="text-gray-500">Logo:</span>
                  <img 
                    src={partner.webEnrichment.data.logo} 
                    alt="Logo de l'entreprise"
                    className="w-12 h-12 object-contain ml-2 inline-block"
                  />
                </div>
              )}
              
              {partner.webEnrichment.reviews?.rating > 0 && (
                <div>
                  <span className="text-gray-500">Note:</span>
                  <span className="ml-2">
                    ⭐ {partner.webEnrichment.reviews.rating}/5 
                    ({partner.webEnrichment.reviews.count} avis)
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    via {partner.webEnrichment.reviews.source}
                  </span>
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            {(partner.webEnrichment.socialMedia?.linkedin || 
              partner.webEnrichment.socialMedia?.twitter || 
              partner.webEnrichment.socialMedia?.facebook) && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Réseaux sociaux</h5>
                <div className="flex gap-2">
                  {partner.webEnrichment.socialMedia.linkedin && (
                    <a 
                      href={partner.webEnrichment.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {partner.webEnrichment.socialMedia.twitter && (
                    <a 
                      href={partner.webEnrichment.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                      title="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {partner.webEnrichment.socialMedia.facebook && (
                    <a 
                      href={partner.webEnrichment.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800"
                      title="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actualités */}
            {partner.webEnrichment.news && partner.webEnrichment.news.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Actualités récentes</h5>
                <div className="space-y-2">
                  {partner.webEnrichment.news.slice(0, 3).map((article, index) => (
                    <div key={index} className="text-sm">
                      <a 
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 underline line-clamp-2"
                      >
                        {article.title}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">
                        {article.source} • {formatDate(article.pubDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date de dernière mise à jour */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Dernière mise à jour: {formatDate(partner.webEnrichment.lastUpdated)}
              </p>
              <p className="text-xs text-gray-500">
                Source: {partner.webEnrichment.source}
              </p>
            </div>
          </div>
        )}

        {/* Bouton d'enrichissement */}
        {canBeEnriched && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleEnrichPartner}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enrichissement en cours...
                </span>
              ) : (
                'Enrichir avec les données du web'
              )}
            </button>
          </div>
        )}

        {/* Messages de feedback */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* Informations sur l'enrichissement */}
        {!partner.webEnrichment && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">🔍 Enrichissement automatique</p>
            <p>Cette fonctionnalité récupère des informations depuis le web pour compléter le profil du partenaire :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Description et site web</li>
              <li>Logo et réseaux sociaux</li>
              <li>Avis et notes clients</li>
              <li>Actualités récentes</li>
              <li>Informations de contact</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerEnrichment;
