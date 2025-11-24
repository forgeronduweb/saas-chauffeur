/**
 * Service de détection automatique de négociation dans les messages de candidature
 * Analyse le contenu du message pour déterminer si une conversation est nécessaire
 */

class NegotiationDetector {
  constructor() {
    // Mots-clés pour détecter une demande de négociation/discussion
    this.negotiationKeywords = [
      // Négociation directe
      'négocier', 'négociation', 'discuter', 'discussion', 'parler', 'échanger',
      'arrangement', 'accord', 'entente', 'convenir',
      
      // Salaire et conditions financières
      'salaire', 'prix', 'tarif', 'rémunération', 'paiement', 'montant',
      'augmenter', 'diminuer', 'ajuster', 'revoir',
      
      // Conditions de travail
      'horaires', 'planning', 'emploi du temps', 'heures',
      'conditions', 'modalités', 'organisation', 'flexibilité', 'flexible',
      'temps partiel', 'temps plein', 'mi-temps',
      
      // Questions et demandes de précision
      'question', 'questions', 'préciser', 'clarifier', 'expliquer', 'détailler',
      'information', 'informations', 'renseignement', 'renseignements',
      'savoir', 'connaître', 'comprendre',
      
      // Demandes de modification
      'modifier', 'changer', 'adapter', 'ajuster', 'personnaliser',
      'différent', 'autrement', 'alternative',
      
      // Expressions interrogatives
      'pouvez-vous', 'pourriez-vous', 'serait-il possible', 'est-ce que',
      'j\'aimerais savoir', 'j\'aimerais connaître', 'puis-je',
      
      // Mots interrogatifs
      'comment', 'quand', 'où', 'pourquoi', 'combien', 'quel', 'quelle',
      'qui', 'quoi',
      
      // Expressions de doute ou condition
      'mais', 'cependant', 'toutefois', 'néanmoins', 'si', 'à condition',
      'sous réserve', 'en fonction de', 'selon', 'dépend'
    ];

    // Expressions qui indiquent clairement une candidature simple
    this.simpleApplicationPhrases = [
      'je vous soumets ma candidature',
      'je postule pour ce poste',
      'je suis intéressé par cette offre',
      'je souhaite postuler',
      'candidature pour le poste',
      'je me porte candidat',
      'veuillez trouver ma candidature',
      'ci-joint ma candidature'
    ];
  }

  /**
   * Analyse un message pour détecter si une négociation est nécessaire
   * @param {string} message - Le message à analyser
   * @returns {object} Résultat de l'analyse
   */
  analyzeMessage(message) {
    if (!message || typeof message !== 'string') {
      return {
        needsConversation: false,
        confidence: 0,
        detectedKeywords: [],
        reason: 'Message vide ou invalide'
      };
    }

    const normalizedMessage = this.normalizeText(message);
    
    // Vérifier d'abord si c'est une candidature simple explicite
    const isSimpleApplication = this.isSimpleApplication(normalizedMessage);
    if (isSimpleApplication) {
      return {
        needsConversation: false,
        confidence: 0.9,
        detectedKeywords: [],
        reason: 'Candidature simple détectée'
      };
    }

    // Détecter les mots-clés de négociation
    const detectedKeywords = this.findNegotiationKeywords(normalizedMessage);
    
    // Détecter les signes de ponctuation interrogative
    const hasQuestionMarks = (message.match(/\?/g) || []).length;
    
    // Calculer le score de confiance
    let confidence = 0;
    
    // Points pour les mots-clés trouvés
    confidence += Math.min(detectedKeywords.length * 0.2, 0.8);
    
    // Points pour les points d'interrogation
    confidence += Math.min(hasQuestionMarks * 0.3, 0.6);
    
    // Bonus si le message est long (plus de détails = plus de chances de négociation)
    if (message.length > 100) {
      confidence += 0.1;
    }

    // Malus si le message est très court et générique
    if (message.length < 30 && detectedKeywords.length === 0) {
      confidence -= 0.2;
    }

    // Limiter la confiance entre 0 et 1
    confidence = Math.max(0, Math.min(1, confidence));

    const needsConversation = confidence >= 0.3; // Seuil de décision

    return {
      needsConversation,
      confidence: Math.round(confidence * 100) / 100,
      detectedKeywords,
      questionMarks: hasQuestionMarks,
      messageLength: message.length,
      reason: this.generateReason(needsConversation, detectedKeywords, hasQuestionMarks)
    };
  }

  /**
   * Normalise le texte pour l'analyse
   * @param {string} text - Texte à normaliser
   * @returns {string} Texte normalisé
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^\w\s\?]/g, ' ') // Garder seulement les mots, espaces et ?
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  /**
   * Vérifie si le message correspond à une candidature simple
   * @param {string} normalizedMessage - Message normalisé
   * @returns {boolean}
   */
  isSimpleApplication(normalizedMessage) {
    return this.simpleApplicationPhrases.some(phrase => 
      normalizedMessage.includes(phrase.toLowerCase())
    );
  }

  /**
   * Trouve les mots-clés de négociation dans le message
   * @param {string} normalizedMessage - Message normalisé
   * @returns {Array} Liste des mots-clés trouvés
   */
  findNegotiationKeywords(normalizedMessage) {
    const found = [];
    
    this.negotiationKeywords.forEach(keyword => {
      if (normalizedMessage.includes(keyword)) {
        found.push(keyword);
      }
    });

    return found;
  }

  /**
   * Génère une raison explicative pour la décision
   * @param {boolean} needsConversation - Si une conversation est nécessaire
   * @param {Array} keywords - Mots-clés détectés
   * @param {number} questionMarks - Nombre de points d'interrogation
   * @returns {string} Raison explicative
   */
  generateReason(needsConversation, keywords, questionMarks) {
    if (!needsConversation) {
      return 'Candidature standard sans demande de négociation';
    }

    const reasons = [];
    
    if (keywords.length > 0) {
      reasons.push(`Mots-clés de négociation détectés: ${keywords.slice(0, 3).join(', ')}`);
    }
    
    if (questionMarks > 0) {
      reasons.push(`${questionMarks} question(s) posée(s)`);
    }

    return reasons.join(' • ');
  }

  /**
   * Teste le détecteur avec des exemples
   * @returns {Array} Résultats des tests
   */
  runTests() {
    const testCases = [
      {
        message: "Bonjour, je vous soumets ma candidature.",
        expected: false
      },
      {
        message: "Je suis intéressé par cette offre.",
        expected: false
      },
      {
        message: "Je suis intéressé mais j'aimerais discuter du salaire.",
        expected: true
      },
      {
        message: "Pouvez-vous préciser les horaires de travail ?",
        expected: true
      },
      {
        message: "Je souhaite négocier le prix proposé.",
        expected: true
      },
      {
        message: "Quand puis-je commencer ? Les conditions sont-elles flexibles ?",
        expected: true
      },
      {
        message: "Candidature",
        expected: false
      }
    ];

    return testCases.map(testCase => {
      const result = this.analyzeMessage(testCase.message);
      return {
        message: testCase.message,
        expected: testCase.expected,
        actual: result.needsConversation,
        confidence: result.confidence,
        keywords: result.detectedKeywords,
        reason: result.reason,
        success: result.needsConversation === testCase.expected
      };
    });
  }
}

// Instance singleton
const negotiationDetector = new NegotiationDetector();

export default negotiationDetector;

// Export pour les tests
export { NegotiationDetector };
