import { Briefcase, Target, Eye, MessageCircle } from 'lucide-react';

/**
 * Composant d'information sur le système d'offres directes
 */
export default function DirectOfferInfo() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🎯 Système d'Offres Directes
          </h3>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Offres personnalisées</p>
                <p className="text-blue-700">Créez des offres d'emploi spécifiquement pour un chauffeur que vous avez repéré.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Visibilité exclusive</p>
                <p className="text-blue-700">Seul le chauffeur ciblé verra votre offre dans sa liste d'offres disponibles.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Processus de candidature</p>
                <p className="text-blue-700">Le chauffeur peut postuler normalement et le système intelligent gérera la suite.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Astuce :</strong> Utilisez ce système pour recruter des chauffeurs spécifiques dont le profil vous intéresse, 
              plutôt que de publier une offre générale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
