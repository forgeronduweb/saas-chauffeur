/**
 * Composant Toast pour remplacer les alert() et améliorer l'UX
 */

import { useState, useEffect } from 'react';
import errorHandler from '../../utils/errorHandler.js';

// Types de toast avec leurs styles
const TOAST_TYPES = {
  success: {
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    icon: '✓',
    borderColor: 'border-green-600'
  },
  error: {
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    icon: '✕',
    borderColor: 'border-red-600'
  },
  warning: {
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    icon: '⚠',
    borderColor: 'border-yellow-600'
  },
  info: {
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    icon: 'ℹ',
    borderColor: 'border-blue-600'
  }
};

const Toast = ({ toast, onClose }) => {
  const { message, type = 'info', duration = 5000 } = toast;
  const style = TOAST_TYPES[type] || TOAST_TYPES.info;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`
      ${style.bgColor} ${style.textColor} ${style.borderColor}
      flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl cursor-pointer
      max-w-md w-full
    `}
    onClick={onClose}
    >
      {/* Icône */}
      <div className="flex-shrink-0 text-lg font-bold">
        {style.icon}
      </div>

      {/* Message */}
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>

      {/* Bouton fermer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="flex-shrink-0 text-lg font-bold hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Fonction callback pour recevoir les toasts
    const handleToast = (toastData) => {
      const id = Date.now() + Math.random();
      const newToast = { ...toastData, id };
      
      setToasts(prev => [...prev, newToast]);

      // Auto-suppression après la durée spécifiée
      const duration = toastData.duration || 5000;
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    // Enregistrer le callback dans le gestionnaire d'erreur
    errorHandler.registerToastCallback(handleToast);

    // Nettoyage
    return () => {
      errorHandler.unregisterToastCallback(handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
