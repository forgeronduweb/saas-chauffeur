/**
 * Système de logging professionnel pour l'application
 * Remplace les console.log dispersés dans le code
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// Niveaux de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Configuration par environnement
const LOG_CONFIG = {
  development: {
    level: LOG_LEVELS.DEBUG,
    enableConsole: true,
    enableRemote: false
  },
  production: {
    level: LOG_LEVELS.ERROR,
    enableConsole: false,
    enableRemote: true // Pour un service comme Sentry
  }
};

const currentConfig = isDevelopment ? LOG_CONFIG.development : LOG_CONFIG.production;

/**
 * Formate un message de log avec timestamp et contexte
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';
  return `[${timestamp}] ${level}: ${message} ${contextStr}`;
};

/**
 * Envoie les logs vers un service externe en production
 */
const sendToRemoteService = async (level, message, context) => {
  if (!isProduction || !currentConfig.enableRemote) return;
  
  try {
    // Ici on pourrait intégrer Sentry, LogRocket, etc.
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ level, message, context, timestamp: new Date().toISOString() })
    // });
  } catch (error) {
    // Éviter les boucles infinies de logs
    if (isDevelopment) {
      console.error('Erreur envoi log distant:', error);
    }
  }
};

/**
 * Logger principal
 */
class Logger {
  /**
   * Log d'erreur - toujours affiché
   */
  error(message, context = {}) {
    if (currentConfig.level >= LOG_LEVELS.ERROR) {
      const formattedMessage = formatMessage('ERROR', message, context);
      
      if (currentConfig.enableConsole) {
        console.error(formattedMessage);
        if (context.error instanceof Error) {
          console.error(context.error.stack);
        }
      }
      
      sendToRemoteService('ERROR', message, context);
    }
  }

  /**
   * Log d'avertissement
   */
  warn(message, context = {}) {
    if (currentConfig.level >= LOG_LEVELS.WARN) {
      const formattedMessage = formatMessage('WARN', message, context);
      
      if (currentConfig.enableConsole) {
        console.warn(formattedMessage);
      }
      
      sendToRemoteService('WARN', message, context);
    }
  }

  /**
   * Log d'information
   */
  info(message, context = {}) {
    if (currentConfig.level >= LOG_LEVELS.INFO) {
      const formattedMessage = formatMessage('INFO', message, context);
      
      if (currentConfig.enableConsole) {
        console.log(formattedMessage);
      }
      
      sendToRemoteService('INFO', message, context);
    }
  }

  /**
   * Log de debug - uniquement en développement
   */
  debug(message, context = {}) {
    if (currentConfig.level >= LOG_LEVELS.DEBUG) {
      const formattedMessage = formatMessage('DEBUG', message, context);
      
      if (currentConfig.enableConsole) {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Log spécialisé pour les requêtes API
   */
  api(method, url, status, duration, data = {}) {
    const message = `${method.toUpperCase()} ${url} - ${status} (${duration}ms)`;
    
    if (status >= 400) {
      this.error(`API Error: ${message}`, { method, url, status, duration, ...data });
    } else {
      this.debug(`API Success: ${message}`, { method, url, status, duration });
    }
  }

  /**
   * Log spécialisé pour les actions utilisateur
   */
  userAction(action, context = {}) {
    this.info(`User Action: ${action}`, context);
  }

  /**
   * Log spécialisé pour les erreurs de validation
   */
  validation(field, error, value) {
    this.warn(`Validation Error: ${field}`, { error, value });
  }

  /**
   * Log spécialisé pour les performances
   */
  performance(operation, duration, context = {}) {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(message, context);
    } else {
      this.debug(message, context);
    }
  }
}

// Instance singleton
const logger = new Logger();

// Export par défaut
export default logger;

// Exports nommés pour plus de flexibilité
export { logger, LOG_LEVELS };

// Helper pour mesurer les performances
export const measurePerformance = (operation) => {
  const start = performance.now();
  
  return {
    end: (context = {}) => {
      const duration = Math.round(performance.now() - start);
      logger.performance(operation, duration, context);
      return duration;
    }
  };
};

// Helper pour wrapper les fonctions async avec logging
export const withLogging = (fn, operationName) => {
  return async (...args) => {
    const perf = measurePerformance(operationName);
    
    try {
      logger.debug(`Starting: ${operationName}`);
      const result = await fn(...args);
      perf.end({ success: true });
      return result;
    } catch (error) {
      perf.end({ success: false, error: error.message });
      logger.error(`Failed: ${operationName}`, { error, args });
      throw error;
    }
  };
};
