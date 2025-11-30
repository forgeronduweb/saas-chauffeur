import { useState, useEffect } from 'react';
import { X, Zap, Star, Clock, TrendingUp, Eye, MousePointer, MessageCircle } from 'lucide-react';
import { promotionsApi } from '../../services/api';

const BoostModal = ({ isOpen, onClose, offer, onBoostCreated }) => {
  const [boostPricing, setBoostPricing] = useState({});
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBoostPricing();
    }
  }, [isOpen]);

  const fetchBoostPricing = async () => {
    setLoading(true);
    try {
      const response = await promotionsApi.getPricing();
      if (response.data.success) {
        setBoostPricing(response.data.data);
        // Sélectionner le premier boost par défaut
        const firstBoost = Object.keys(response.data.data)[0];
        setSelectedBoost(firstBoost);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBoost || submitting) return;

    setSubmitting(true);
    try {
      const boostData = {
        offerId: offer._id,
        type: selectedBoost,
        duration: parseInt(duration),
        paymentMethod
      };

      const response = await promotionsApi.create(boostData);
      
      if (response.data.success) {
        alert('Boost créé avec succès ! Procédez au paiement pour l\'activer.');
        onBoostCreated && onBoostCreated(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la création du boost:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Erreur lors de la création du boost');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedBoost || !boostPricing[selectedBoost]) return 0;
    return boostPricing[selectedBoost].pricePerDay * duration;
  };

  const getBoostIcon = (type) => {
    switch (type) {
      case 'featured': return <TrendingUp className="w-6 h-6" />;
      case 'premium': return <Star className="w-6 h-6" />;
      case 'urgent': return <Zap className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getBoostColor = (type) => {
    switch (type) {
      case 'featured': return 'blue';
      case 'premium': return 'yellow';
      case 'urgent': return 'red';
      default: return 'blue';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl text-gray-900">Booster votre offre</h2>
            <p className="text-gray-600 mt-1">Augmentez la visibilité de "{offer?.title}"</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Types de boost */}
            <div className="mb-6">
              <h3 className="text-lg text-gray-900 mb-4">Choisissez votre type de boost</h3>
              <div className="grid gap-4">
                {Object.entries(boostPricing).map(([type, config]) => (
                  <div
                    key={type}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedBoost === type
                        ? `border-${getBoostColor(type)}-500 bg-${getBoostColor(type)}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBoost(type)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${getBoostColor(type)}-100 text-${getBoostColor(type)}-600`}>
                          {getBoostIcon(type)}
                        </div>
                        <div>
                          <h4 className="text-gray-900 mb-1">{config.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{config.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{config.pricePerDay} FCFA/jour</span>
                            <span>Max {config.maxDuration} jours</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedBoost === type
                          ? `border-${getBoostColor(type)}-500 bg-${getBoostColor(type)}-500`
                          : 'border-gray-300'
                      }`}>
                        {selectedBoost === type && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Durée */}
            {selectedBoost && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Durée du boost
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={boostPricing[selectedBoost]?.maxDuration || 7}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{duration} jour{duration > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Méthode de paiement */}
            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="card">Carte bancaire</option>
                <option value="bank_transfer">Virement bancaire</option>
              </select>
            </div>

            {/* Résumé */}
            {selectedBoost && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-gray-900 mb-3">Résumé de votre boost</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900">{boostPricing[selectedBoost].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="text-gray-900">{duration} jour{duration > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix par jour:</span>
                    <span className="text-gray-900">{boostPricing[selectedBoost].pricePerDay} FCFA</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-xl text-orange-500">{calculateTotalPrice().toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Avantages */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="text-blue-900 mb-3">Avantages du boost</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="text-blue-700">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Plus de vues</p>
                </div>
                <div className="text-blue-700">
                  <MousePointer className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Plus de clics</p>
                </div>
                <div className="text-blue-700">
                  <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Plus de contacts</p>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!selectedBoost || submitting}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Création...' : `Booster pour ${calculateTotalPrice().toLocaleString()} FCFA`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BoostModal;
