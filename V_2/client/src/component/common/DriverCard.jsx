import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DriverCard({ driver }) {
  const navigate = useNavigate();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Vérification de sécurité
  if (!driver || !driver._id) {
    console.error('DriverCard: chauffeur invalide', driver);
    return null;
  }

  // Initiales pour l'avatar
  const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`.toUpperCase();

  // Seuil pour l'effet de tilt
  const threshold = 8;

  const handleMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTilt({ x: y * -threshold, y: x * threshold });
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-xl overflow-hidden transition-transform duration-200 ease-out cursor-pointer"
      onClick={() => navigate(`/driver/${driver._id}`)}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      {/* Image de couverture / Photo de profil */}
      {driver.profilePhotoUrl ? (
        <img 
          src={driver.profilePhotoUrl} 
          alt={`${driver.firstName} ${driver.lastName}`}
          className="w-full h-32 lg:h-40 object-cover"
        />
      ) : (
        <div className="w-full h-32 lg:h-40 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <div className="text-white text-3xl lg:text-4xl font-bold">
            {initials}
          </div>
        </div>
      )}

      <div className="p-2 lg:p-3">
        {/* Nom et expérience */}
        <h3 className="text-sm lg:text-base font-semibold text-gray-800 mb-0.5">
          {driver.firstName} {driver.lastName}
        </h3>
        <p className="text-xs text-gray-600 mb-1 lg:mb-2">
          {driver.experience || 'Expérience non spécifiée'}
        </p>

        {/* Localité - affichée uniquement si renseignée */}
        {driver.workZone && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            <span className="truncate">
              {driver.workZone}
            </span>
          </div>
        )}

        {/* Badge Disponibilité */}
        {driver.isAvailable && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Disponible
          </span>
        )}
      </div>
    </div>
  );
}
