/**
 * Système de gestion d'erreur centralisé
 * Remplace les alert() et console.error() dispersés
 */

import logger from './logger.js';

// Types d'erreurs
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

// Messages d'erreur par défaut
const DEFAULT_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Problème de connexion. Vérifiez votre connexion internet.',
  [ERROR_TYPES.VALIDATION]: 'Les données saisies ne sont pas valides.',
  [ERROR_TYPES.AUTHENTICATION]: 'Vous devez vous connecter pour accéder à cette fonctionnalité.',
  [ERROR_TYPES.AUTHORIZATION]: 'Vous n\'avez pas les permissions nécessaires.',
  [ERROR_TYPES.NOT_FOUND]: 'La ressource demandée n\'a pas été trouvée.',
  [ERROR_TYPES.SERVER]: 'Une erreur serveur est survenue. Veuillez réessayer.',
  [ERROR_TYPES.UNKNOWN]: 'Une erreur inattendue est survenue.'
};

/**
 * Détermine le type d'erreur basé sur le code de statut HTTP
 */
const getErrorType = (status, error) => {
  if (!status) {
    if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
      return ERROR_TYPES.NETWORK;
    }
    return ERROR_TYPES.UNKNOWN;
  }

  switch (true) {
    case status === 400:
      return ERROR_TYPES.VALIDATION;
    case status === 401:
      return ERROR_TYPES.AUTHENTICATION;
    case status === 403:
      return ERROR_TYPES.AUTHORIZATION;
    case status === 404:
      return ERROR_TYPES.NOT_FOUND;
    case status >= 500:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Extrait un message d'erreur lisible
 */
const extractErrorMessage = (error) => {
  // Message depuis la réponse API
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Message d'erreur direct
  if (error?.message) {
    return error.message;
  }

  // String directe
  if (typeof error === 'string') {
    return error;
  }

  return null;
};

/**
 * Classe principale de gestion d'erreur
 */
class ErrorHandler {
  constructor() {
    this.toastCallbacks = [];
  }

  /**
   * Enregistre un callback pour afficher les toasts
   * (sera utilisé par le composant Toast)
   */
  registerToastCallback(callback) {
    this.toastCallbacks.push(callback);
  }

  /**
   * Supprime un callback toast
   */
  unregisterToastCallback(callback) {
    this.toastCallbacks = this.toastCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Affiche un toast d'erreur
   */
  showToast(message, type = 'error') {
    this.toastCallbacks.forEach(callback => {
      try {
        callback({ message, type });
      } catch (err) {
        logger.error('Erreur dans callback toast', { error: err });
      }
    });
  }

  /**
   * Gère une erreur de manière centralisée
   */
  handle(error, context = {}) {
    const status = error?.response?.status;
    const errorType = getErrorType(status, error);
    const customMessage = extractErrorMessage(error);
    const message = customMessage || DEFAULT_MESSAGES[errorType];

    // Log l'erreur
    logger.error('Error handled', {
      type: errorType,
      status,
      message,
      context,
      error
    });

    // Affiche le toast
    this.showToast(message, 'error');

    return {
      type: errorType,
      message,
      status,
      handled: true
    };
  }

  /**
   * Gère spécifiquement les erreurs d'API
   */
  handleApiError(error, operation = 'API call') {
    return this.handle(error, { operation, api: true });
  }

  /**
   * Gère les erreurs de validation de formulaire
   */
  handleValidationError(errors, form = 'form') {
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        this.showToast(error, 'warning');
      });
    } else if (typeof errors === 'object') {
      Object.entries(errors).forEach(([field, message]) => {
        this.showToast(`${field}: ${message}`, 'warning');
      });
    } else {
      this.showToast(errors || 'Erreur de validation', 'warning');
    }

    logger.validation('Form validation failed', { form, errors });
  }

  /**
   * Affiche un message de succès
   */
  showSuccess(message) {
    this.showToast(message, 'success');
    logger.info('Success message shown', { message });
  }

  /**
   * Affiche un message d'information
   */
  showInfo(message) {
    this.showToast(message, 'info');
    logger.info('Info message shown', { message });
  }

  /**
   * Affiche un avertissement
   */
  showWarning(message) {
    this.showToast(message, 'warning');
    logger.warn('Warning message shown', { message });
  }
}

// Instance singleton
const errorHandler = new ErrorHandler();

export default errorHandler;

// Hook React pour utiliser le gestionnaire d'erreur
export const useErrorHandler = () => {
  return {
    handleError: (error, context) => errorHandler.handle(error, context),
    handleApiError: (error, operation) => errorHandler.handleApiError(error, operation),
    handleValidationError: (errors, form) => errorHandler.handleValidationError(errors, form),
    showSuccess: (message) => errorHandler.showSuccess(message),
    showInfo: (message) => errorHandler.showInfo(message),
    showWarning: (message) => errorHandler.showWarning(message),
    showError: (message) => errorHandler.showToast(message, 'error')
  };
};

// Helper pour wrapper les fonctions async avec gestion d'erreur
export const withErrorHandling = (fn, operation = 'Operation') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleApiError(error, operation);
      throw error; // Re-throw pour permettre une gestion spécifique si nécessaire
    }
  };
};
