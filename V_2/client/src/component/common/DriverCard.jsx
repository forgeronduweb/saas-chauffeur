import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Fonction pour calculer l'expérience totale en années
const calculateTotalExperience = (workExperiences) => {
  if (!workExperiences || workExperiences.length === 0) return 0;
  
  let totalMonths = 0;
  const now = new Date();
  
  workExperiences.forEach(exp => {
    if (!exp.startDate) return;
    
    const startDate = new Date(exp.startDate + '-01');
    const endDate = exp.endDate ? new Date(exp.endDate + '-01') : now;
    
    // Calculer la différence en mois
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  // Convertir en années (arrondi à 1 décimale)
  return Math.round(totalMonths / 12 * 10) / 10;
};

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
  
  // Calculer l'expérience dynamiquement
  const totalYears = calculateTotalExperience(driver.workExperience);
  const experienceText = totalYears > 0 
    ? `${totalYears} ${totalYears === 1 ? 'an' : 'ans'} d'expérience`
    : 'Débutant';

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

      <div className="p-3 lg:p-4 flex flex-col">
        {/* Nom - toujours 2 lignes max avec truncate */}
        <h3 className="text-sm lg:text-base font-semibold text-gray-800 mb-1 line-clamp-2 h-10">
          {driver.firstName} {driver.lastName}
        </h3>
        
        {/* Expérience - toujours 1 ligne */}
        <p className="text-xs text-gray-600 mb-2 truncate h-4">
          {experienceText}
        </p>

        {/* Localité - toujours 1 ligne avec icône */}
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3 h-4">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          <span className="truncate">
            {driver.workZone || 'Non spécifié'}
          </span>
        </div>

        {/* Badge Disponibilité - toujours affiché */}
        {driver.isAvailable ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium w-fit">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md font-medium w-fit">
            Non disponible
          </span>
        )}
      </div>
    </div>
  );
}
