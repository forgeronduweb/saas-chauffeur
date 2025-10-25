import { useState, useEffect } from 'react';

const Notification = ({ type, title, message, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(() => onClose(), 300); // Attendre la fin de l'animation
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-white border-green-200',
          icon: '#22C55E', // Vert
          titleColor: 'text-green-700',
          messageColor: 'text-green-600'
        };
      case 'error':
        return {
          container: 'bg-white border-red-200',
          icon: '#EF4444', // Rouge
          titleColor: 'text-red-700',
          messageColor: 'text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-white border-yellow-200',
          icon: '#F59E0B', // Jaune
          titleColor: 'text-yellow-700',
          messageColor: 'text-yellow-600'
        };
      default:
        return {
          container: 'bg-white border-gray-200',
          icon: '#6B7280', // Gris
          titleColor: 'text-gray-700',
          messageColor: 'text-gray-600'
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 8.31V9a7.5 7.5 0 1 1-4.447-6.855M16.5 3 9 10.508l-2.25-2.25" stroke={styles.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM11.25 6.75l-4.5 4.5M6.75 6.75l4.5 4.5" stroke={styles.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6.75V9.75M9 12.75h.008M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z" stroke={styles.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12.75h.008M9 6.75V9.75M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z" stroke={styles.icon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`${styles.container} inline-flex space-x-3 p-3 text-sm rounded border transition-all duration-300 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
    }`}>
      {getIcon()}
      <div className="flex-1">
        <h3 className={`${styles.titleColor} font-medium`}>{title}</h3>
        {message && <p className={`${styles.messageColor} mt-1`}>{message}</p>}
      </div>
      <button 
        type="button" 
        aria-label="close" 
        onClick={handleClose}
        className="cursor-pointer mb-auto text-slate-400 hover:text-slate-600 active:scale-95 transition"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="currentColor" fillOpacity=".7"/>
          <rect x="12.531" y="13.914" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.531 13.914)" fill="currentColor" fillOpacity=".7"/>
        </svg>
      </button>
    </div>
  );
};

export default Notification;
