import { Link } from 'react-router-dom';

// Fonction pour calculer l'expérience totale en années
const calculateTotalExperience = (workExperiences) => {
  if (!workExperiences || workExperiences.length === 0) return 0;
  
  let totalMonths = 0;
  const now = new Date();
  
  workExperiences.forEach(exp => {
    if (!exp.startDate) return;
    
    const startDate = new Date(exp.startDate + '-01');
    const endDate = exp.endDate ? new Date(exp.endDate + '-01') : now;
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
};

export default function SearchResults({ results, query, onClose }) {
  if (!results) return null;

  const drivers = results.drivers || [];
  const offers = results.offers || [];
  const products = results.products || [];
  const totalResults = drivers.length + offers.length + products.length;

  // Message d'erreur si le serveur ne répond pas
  if (results.error) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-red-200 rounded-lg shadow-lg p-6 z-50">
        <div className="text-center text-red-600">
          <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-base font-medium">Erreur de recherche</p>
          <p className="text-sm mt-1">Le serveur ne répond pas. Vérifiez qu'il est démarré.</p>
        </div>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50 max-h-96 overflow-y-auto">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-base font-medium">Aucun résultat trouvé</p>
          <p className="text-sm mt-1">Essayez avec d'autres mots-clés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-3 lg:p-4 border-b border-gray-100 bg-gray-50">
        <p className="text-sm lg:text-base text-gray-600">
          <span className="font-semibold text-gray-900">{totalResults}</span> résultat{totalResults > 1 ? 's' : ''} pour "{query}"
        </p>
      </div>

      {/* Chauffeurs */}
      {drivers.length > 0 && (
        <div className="p-3 lg:p-4 border-b border-gray-100">
          <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase mb-2 lg:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Chauffeurs ({drivers.length})
          </h3>
          <div className="space-y-2">
            {drivers.map((driver) => (
              <Link
                key={driver._id}
                to={`/driver/${driver._id}`}
                onClick={onClose}
                className="block p-3 lg:p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                      {driver.userId?.firstName || ''} {driver.userId?.lastName || ''}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">
                      {driver.vehicleBrand || ''} {driver.vehicleModel || ''} • {driver.city || ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 text-xs lg:text-sm font-medium rounded-full bg-green-100 text-green-700">
                      {(() => {
                        const totalYears = calculateTotalExperience(driver.workExperience);
                        return totalYears > 0 
                          ? `${totalYears} ${totalYears === 1 ? 'an' : 'ans'}`
                          : 'Débutant';
                      })()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Offres d'emploi */}
      {offers.length > 0 && (
        <div className="p-3 lg:p-4 border-b border-gray-100">
          <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase mb-2 lg:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Offres d'emploi ({offers.length})
          </h3>
          <div className="space-y-2">
            {offers.map((offer) => (
              <Link
                key={offer._id}
                to={`/offre/${offer._id}`}
                onClick={onClose}
                className="block p-3 lg:p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                      {offer.title}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">
                      {offer.employer?.companyName || 'Employeur'} • {typeof offer.location === 'object' ? offer.location?.city || offer.location?.address || 'Non spécifié' : offer.location}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 text-xs lg:text-sm font-medium rounded-full bg-blue-100 text-blue-700">
                      {offer.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Offres marketing/produits */}
      {products.length > 0 && (
        <div className="p-3 lg:p-4">
          <h3 className="text-xs lg:text-sm font-semibold text-gray-500 uppercase mb-2 lg:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Produits & Services ({products.length})
          </h3>
          <div className="space-y-2">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/produit/${product._id}`}
                onClick={onClose}
                className="block p-3 lg:p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500 truncate">
                      {product.category} • {typeof product.location === 'object' ? product.location?.city || product.location?.address || 'Non spécifié' : product.location}
                    </p>
                  </div>
                  {product.price && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 text-xs lg:text-sm font-medium rounded-full bg-green-100 text-green-700">
                        {product.price} FCFA
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
