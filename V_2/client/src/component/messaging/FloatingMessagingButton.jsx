import React from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingMessagingButton = ({ isOpen, onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 p-3 lg:px-5 lg:py-3 rounded-full shadow-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl group ${isOpen ? 'hidden lg:flex' : 'flex'}`}
      aria-label={isOpen ? "Fermer la messagerie" : "Ouvrir la messagerie"}
    >
      {isOpen ? (
        <>
          <X className="w-5 h-5 text-gray-700" />
          <span className="hidden lg:inline font-semibold text-base">Messagerie</span>
        </>
      ) : (
        <>
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden lg:inline font-semibold text-base">Messagerie</span>
        </>
      )}
    </button>
  );
};

export default FloatingMessagingButton;
