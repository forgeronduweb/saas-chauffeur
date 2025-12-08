import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Paperclip, Send, Smile, Mic, MoreVertical } from 'lucide-react';
import { messagesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ChatModal({ isOpen, onClose, recipientId, recipientName, recipientPhoto }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Charger les messages de la conversation
  useEffect(() => {
    if (!isOpen || !recipientId) return;

    const loadConversation = async () => {
      try {
        setLoading(true);
        // Créer ou récupérer la conversation
        const convResponse = await messagesApi.createOrGetConversation(recipientId, {
          context: 'direct_contact',
          source: 'driver_profile'
        });
        
        // Récupérer les messages de la conversation
        const messagesResponse = await messagesApi.getMessages(convResponse.data.conversation._id);
        setMessages(messagesResponse.data.messages || []);
      } catch (error) {
        console.error('Erreur chargement conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [isOpen, recipientId]);

  // Faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      // Créer ou récupérer la conversation
      const convResponse = await messagesApi.createOrGetConversation(recipientId, {
        context: 'direct_contact',
        source: 'driver_profile'
      });

      // Envoyer le message
      const newMessage = {
        _id: Date.now().toString(),
        content: message,
        sender: user._id,
        recipient: recipientId,
        createdAt: new Date().toISOString(),
        isSending: true
      };

      // Mise à jour optimiste
      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Envoyer le message au serveur
      await messagesApi.sendMessage(convResponse.data.conversation._id, {
        content: message
      });

      // Mettre à jour le statut du message
      setMessages(prev => 
        prev.map(m => 
          m._id === newMessage._id 
            ? { ...m, isSending: false }
            : m
        )
      );

    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Marquer le message comme erreur
      setMessages(prev => 
        prev.map(m => 
          m._id === newMessage._id 
            ? { ...m, error: true, isSending: false }
            : m
        )
      );
    }
  };

  if (!isOpen) return null;

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  const formatDate = (dateString) => {
    const today = new Date();
    const messageDate = new Date(dateString);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return 'Aujourd\'hui';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return 'Hier';
    }
    
    return format(messageDate, 'd MMMM yyyy', { locale: fr });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* En-tête */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-1 text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {recipientPhoto ? (
            <img 
              src={recipientPhoto} 
              alt={recipientName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
              {recipientName ? recipientName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          <div>
            <h2 className="font-medium text-gray-900">{recipientName || 'Utilisateur'}</h2>
            <p className="text-xs text-gray-500">En ligne</p>
          </div>
        </div>
        
        <button className="p-1 text-gray-600">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Envoyez votre premier message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isOwnMessage = msg.sender === user._id;
              const showDate = index === 0 || 
                formatDate(messages[index-1].createdAt) !== formatDate(msg.createdAt);
              
              return (
                <div key={msg._id} className="space-y-1">
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {!isOwnMessage && (
                      <div className="self-end mb-1 mr-2">
                        {recipientPhoto ? (
                          <img 
                            src={recipientPhoto} 
                            alt={recipientName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                            {recipientName ? recipientName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="max-w-[80%]">
                      <div 
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage 
                            ? 'bg-orange-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Champ de saisie */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez un message..."
              className="w-full py-2 px-4 pr-12 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button 
              type="button" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-full ${
              message.trim() 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
          
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <Mic className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
