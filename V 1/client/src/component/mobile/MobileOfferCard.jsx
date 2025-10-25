import { ResponsiveCard } from './ResponsiveGrid';

export default function MobileOfferCard({ offer, onApply, onView, userRole = 'driver' }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ResponsiveCard className="mobile-card">
      {/* Header avec titre et statut */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
            {offer.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {offer.location || 'Localisation non spécifiée'}
          </p>
        </div>
        
        {offer.status && (
          <span className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${getStatusColor(offer.status)}
          `}>
            {offer.status}
          </span>
        )}
      </div>

      {/* Description */}
      {offer.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {offer.description}
        </p>
      )}

      {/* Informations clés */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {offer.price && (
          <div className="flex items-center text-sm">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="font-medium text-green-600">
              {formatPrice(offer.price)}
            </span>
          </div>
        )}

        {offer.date && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(offer.date)}</span>
          </div>
        )}

        {offer.vehicleType && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{offer.vehicleType}</span>
          </div>
        )}

        {offer.duration && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{offer.duration}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onView(offer)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mobile-touch-target"
        >
          Voir détails
        </button>
        
        {userRole === 'driver' && onApply && (
          <button
            onClick={() => onApply(offer)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors mobile-touch-target"
          >
            Postuler
          </button>
        )}
        
        {userRole === 'client' && (
          <button
            onClick={() => onView(offer)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors mobile-touch-target"
          >
            Gérer
          </button>
        )}
      </div>
    </ResponsiveCard>
  );
}

// Composant pour une liste d'offres mobile
export function MobileOfferList({ offers, onApply, onView, userRole, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mobile-card p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="mobile-empty-state">
        <svg className="mobile-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mobile-empty-title">Aucune offre disponible</h3>
        <p className="mobile-empty-description">
          {userRole === 'driver' 
            ? 'Il n\'y a pas d\'offres disponibles pour le moment. Revenez plus tard !'
            : 'Vous n\'avez pas encore créé d\'offres. Commencez par en créer une !'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <MobileOfferCard
          key={offer._id || offer.id}
          offer={offer}
          onApply={onApply}
          onView={onView}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
