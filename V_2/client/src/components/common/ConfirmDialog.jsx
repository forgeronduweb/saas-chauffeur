import React from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  subtitle,
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "danger", // danger, success, warning, info
  loading = false 
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-red-100',
          confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          alertBg: 'bg-red-50 border-red-200',
          alertText: 'text-red-800'
        };
      case 'success':
        return {
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-green-100',
          confirmBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          alertBg: 'bg-green-50 border-green-200',
          alertText: 'text-green-800'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-orange-100',
          confirmBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          alertBg: 'bg-orange-50 border-orange-200',
          alertText: 'text-orange-800'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-100',
          confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          alertBg: 'bg-blue-50 border-blue-200',
          alertText: 'text-blue-800'
        };
      default:
        return getIconAndColors('danger');
    }
  };

  const { icon, bgColor, confirmBg, alertBg, alertText } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay avec animation */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal Content avec animation */}
      <div className="relative bg-white shadow-2xl rounded-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header avec icône */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 ${bgColor} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="mb-6">
          <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">
            {message}
          </p>
          {type === 'danger' && (
            <div className={`mt-3 p-3 ${alertBg} border rounded-lg`}>
              <p className={`text-xs sm:text-sm ${alertText} flex items-center gap-2`}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Cette action est irréversible.
              </p>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm lg:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-xs sm:text-sm lg:text-base text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 ${confirmBg}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traitement...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
