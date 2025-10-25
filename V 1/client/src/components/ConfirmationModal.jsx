import React from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "Do you really want to continue? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // danger, success, warning, info
  icon,
  autoClose = false,
  autoCloseDelay = 2000
}) {
  if (!isOpen) return null;

  // Auto-fermeture pour les messages de succès
  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onConfirm();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onConfirm]);

  const getIconBgColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-100';
      case 'success': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'info': return 'bg-blue-100';
      default: return 'bg-red-100';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger': return '#DC2626';
      case 'success': return '#059669';
      case 'warning': return '#D97706';
      case 'info': return '#2563EB';
      default: return '#DC2626';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700';
      case 'success': return 'bg-green-600 hover:bg-green-700';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-red-600 hover:bg-red-700';
    }
  };

  const defaultIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75" 
        stroke={getIconColor()} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className="flex flex-col items-center bg-white rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.05)'}}>
        <div className={`flex items-center justify-center p-4 ${getIconBgColor()} rounded-full`}>
          {icon || defaultIcon}
        </div>
        
        <h2 className="text-gray-900 font-semibold mt-4 text-xl">{title}</h2>
        
        <p className="text-sm text-gray-600 mt-2 text-center whitespace-pre-line">
          {message}
        </p>
        
        {!autoClose && (
          <div className="flex items-center justify-center gap-4 mt-5 w-full">
            {cancelText && (
              <button 
                type="button" 
                onClick={onClose}
                className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
              >
                {cancelText}
              </button>
            )}
            
            <button 
              type="button" 
              onClick={onConfirm}
              className={`${cancelText ? 'w-full md:w-36' : 'w-full md:w-48'} h-10 rounded-md text-white ${getConfirmButtonColor()} font-medium text-sm active:scale-95 transition`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
