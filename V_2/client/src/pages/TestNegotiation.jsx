import { useState } from 'react';
import negotiationDetector from '../services/negotiationDetector';

export default function TestNegotiation() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);

  const testMessages = [
    "Bonjour, je vous soumets ma candidature pour ce poste.",
    "Je suis intéressé mais j'aimerais discuter du salaire proposé.",
    "Pouvez-vous me donner plus d'informations sur les horaires de travail ?",
    "Je postule pour ce poste de chauffeur.",
    "Le salaire me convient-il ? Pouvons-nous négocier les conditions ?",
    "Quels sont les avantages sociaux offerts par l'entreprise ?",
    "Je suis disponible immédiatement pour commencer.",
    "Y a-t-il une possibilité d'augmentation après la période d'essai ?"
  ];

  const analyzeMessage = () => {
    if (message.trim()) {
      const analysis = negotiationDetector.analyzeMessage(message);
      setResult(analysis);
    }
  };

  const testPredefinedMessage = (testMessage) => {
    setMessage(testMessage);
    const analysis = negotiationDetector.analyzeMessage(testMessage);
    setResult(analysis);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🤖 Test du Détecteur de Négociation
        </h1>

        {/* Zone de test personnalisé */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test personnalisé</h2>
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message de candidature ici..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={analyzeMessage}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Analyser le message
            </button>
          </div>
        </div>

        {/* Messages prédéfinis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Messages de test prédéfinis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testMessages.map((testMessage, index) => (
              <button
                key={index}
                onClick={() => testPredefinedMessage(testMessage)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                "{testMessage}"
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats de l'analyse</h2>
            
            <div className={`p-4 rounded-lg border-2 ${
              result.needsConversation 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  result.needsConversation ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {result.needsConversation ? '💬' : '📋'}
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    result.needsConversation ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {result.needsConversation ? 'Discussion détectée' : 'Candidature simple'}
                  </h3>
                  <p className={`text-sm ${
                    result.needsConversation ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {result.needsConversation 
                      ? 'Une conversation sera créée automatiquement'
                      : 'Candidature directe sans conversation'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Score de confiance :</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          result.confidence > 0.7 ? 'bg-red-500' :
                          result.confidence > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {result.detectedKeywords.length > 0 && (
                  <div>
                    <span className="font-medium">Mots-clés détectés :</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.detectedKeywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="font-medium">Raison :</span>
                  <p className="text-sm text-gray-600 mt-1">{result.reason}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Comment ça marche ?</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>• <strong>Score de confiance élevé (&gt;60%)</strong> : Le système détecte des mots-clés de négociation</p>
            <p>• <strong>Conversation créée</strong> : Messagerie automatique pour discuter avec l'employeur</p>
            <p>• <strong>Candidature simple</strong> : Envoi direct sans créer de conversation</p>
            <p>• <strong>Mots-clés détectés</strong> : Termes qui indiquent une volonté de négociation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
