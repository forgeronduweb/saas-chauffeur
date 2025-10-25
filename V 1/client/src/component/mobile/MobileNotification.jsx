import { useState, useEffect } from 'react';

export default function MobileNotification({ 
  notification, 
  onClose, 
  onAction,
  autoClose = true,
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoClose) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getTypeStyles = () => {
    const styles = {
      success: {
        bg: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        progress: 'bg-green-500'
      },
      error: {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        progress: 'bg-red-500'
      },
      warning: {
        bg: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        progress: 'bg-yellow-500'
      },
      info: {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        progress: 'bg-blue-500'
      }
    };
    return styles[notification.type] || styles.info;
  };

  const getIcon = () => {
    const icons = {
      success: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      error: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      warning: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      info: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    return icons[notification.type] || icons.info;
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-20 left-4 right-4 z-50 
      border rounded-lg shadow-lg p-4
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      ${styles.bg}
    `}>
      {/* Progress bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon} mr-3 mt-0.5`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {notification.title}
            </h4>
          )}
          
          <p className="text-sm text-gray-700">
            {notification.message}
          </p>

          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onAction?.(action);
                    if (action.closeOnClick !== false) {
                      handleClose();
                    }
                  }}
                  className={`
                    px-3 py-1 text-xs font-medium rounded-md transition-colors
                    ${action.primary 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Composant pour gérer une pile de notifications
export function MobileNotificationStack({ notifications, onRemove, onAction }) {
  return (
    <div className="fixed top-20 left-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <MobileNotification
          key={notification.id || index}
          notification={notification}
          onClose={() => onRemove?.(notification.id || index)}
          onAction={onAction}
          autoClose={notification.autoClose !== false}
          duration={notification.duration || 5000}
        />
      ))}
    </div>
  );
}

// Hook pour gérer les notifications mobiles
export function useMobileNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Helpers pour différents types
  const success = (message, options = {}) => {
    addNotification({ type: 'success', message, ...options });
  };

  const error = (message, options = {}) => {
    addNotification({ type: 'error', message, autoClose: false, ...options });
  };

  const warning = (message, options = {}) => {
    addNotification({ type: 'warning', message, ...options });
  };

  const info = (message, options = {}) => {
    addNotification({ type: 'info', message, ...options });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}
