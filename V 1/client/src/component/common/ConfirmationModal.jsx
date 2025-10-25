export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "info",
  icon,
  autoClose = false,
  autoCloseDelay = 3000
}) {
  if (!isOpen) return null;

  // Auto-fermeture si activée
  if (autoClose) {
    setTimeout(() => {
      onClose();
    }, autoCloseDelay);
  }

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-indigo-100 text-indigo-700';
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="flex flex-col items-center bg-white shadow-md rounded-xl py-6 px-5 md:w-[460px] w-[370px] border border-gray-200">
        {/* Icône */}
        {icon && (
          <div className={`flex items-center justify-center p-4 rounded-full ${getTypeColors()}`}>
            {icon}
          </div>
        )}

        {/* Titre */}
        <h3 className="text-gray-900 font-semibold mt-4 text-xl text-center">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mt-2 text-center">
          {message}
        </p>

        {/* Boutons */}
        <div className="flex gap-3 mt-6 w-full">
          {cancelText && (
            <button
              onClick={onClose}
              className="w-full md:w-36 h-10 rounded-md border border-gray-300 bg-white text-gray-600 font-medium text-sm hover:bg-gray-100 active:scale-95 transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm();
              if (!autoClose) onClose();
            }}
            className={`w-full md:w-36 h-10 rounded-md text-white font-medium text-sm active:scale-95 transition ${getButtonColors()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
