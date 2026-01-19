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
      className="bg-white rounded-xl transition-transform duration-200 ease-out cursor-pointer border border-gray-300 p-1.5"
      onClick={() => navigate(`/driver/${driver._id}`)}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      {/* Photo de profil */}
      {driver.profilePhotoUrl ? (
        <img 
          src={driver.profilePhotoUrl} 
          alt={`${driver.firstName} ${driver.lastName}`}
          className="w-full h-32 lg:h-52 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-32 lg:h-52 bg-gray-100 flex items-center justify-center rounded-lg">
          <span className="text-gray-400 text-3xl lg:text-5xl font-medium">
            {initials}
          </span>
        </div>
      )}

      <div className="p-1.5 lg:p-3 flex flex-col">
        {/* Nom - toujours 2 lignes max avec truncate */}
        <h3 className="text-sm lg:text-base font-semibold text-gray-800 mb-1 line-clamp-2 h-8">
          {driver.firstName} {driver.lastName}
        </h3>
        
        {/* Expérience - toujours 1 ligne */}
        <p className="text-sm lg:text-sm text-gray-600 mb-1 truncate h-4">
          {experienceText}
        </p>

        {/* Localité */}
        <div className="flex items-center gap-1 text-sm lg:text-sm text-gray-600">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          <span className="truncate">
            {driver.workZone || 'Non spécifié'}
          </span>
        </div>
      </div>
    </div>
  );
}
