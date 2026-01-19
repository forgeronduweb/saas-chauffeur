import { useNavigate } from 'react-router-dom';

export default function OfferCard({ offer }) {
  const navigate = useNavigate();

  // Vérification de sécurité
  if (!offer || !offer._id) {
    console.error('OfferCard: offre invalide', offer);
    return null;
  }

  const employerName = offer.employer
    ? (offer.employer.companyName || `${(offer.employer.firstName || '').trim()} ${(offer.employer.lastName || '').trim()}`.trim())
    : null;

  const companyLabel = offer.isDirect && employerName
    ? `Offre directe de ${employerName}`
    : (offer.company || employerName || 'Entreprise');

  return (
    <div 
      className="bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/offre/${offer._id}`)}
    >
      <div className="p-2 lg:p-4">
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {offer.title}
        </h3>
        <p className="text-xs lg:text-sm text-gray-600 mb-3 truncate">
          {companyLabel}
        </p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs lg:text-sm text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            <span className="truncate">
              {offer.location?.address && offer.location?.city 
                ? `${offer.location.address}, ${offer.location.city}`
                : offer.location?.city || offer.location || 'Lieu non spécifié'}
            </span>
          </div>
          
          <div className="text-sm lg:text-base font-semibold text-gray-900 truncate">
            {offer.salaryRange || (offer.conditions?.salary ? `${offer.conditions.salary.toLocaleString()} FCFA` : offer.salary || 'Salaire à négocier')}
          </div>
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
            {offer.contractType || 'CDI'}
          </span>
          {offer.type && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
              {offer.type}
            </span>
          )}
          {offer.isDirect && (
            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded font-medium">
              Offre directe
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
