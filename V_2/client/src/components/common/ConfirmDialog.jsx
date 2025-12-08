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
  type = "danger",
  loading = false 
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'success':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'info':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-orange-500 hover:bg-orange-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-gray-700">
            {message}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded disabled:opacity-50 ${getButtonColor()}`}
          >
            {loading ? 'Chargement...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
