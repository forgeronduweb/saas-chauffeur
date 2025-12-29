import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { reportsApi } from '../../services/api';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'fraud', label: 'Fraude ou arnaque' },
  { value: 'misleading', label: 'Information trompeuse' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'other', label: 'Autre raison' }
];

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await reportsApi.create({
        targetType,
        targetId,
        reason,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Vous avez déjà signalé ce contenu');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setReason('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg text-gray-900">Signaler</h2>
            {targetTitle && (
              <p className="text-sm text-gray-500 truncate max-w-[250px]">{targetTitle}</p>
            )}
          </div>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900">Signalement envoyé</p>
            <p className="text-sm text-gray-500">Merci de nous aider à garder la plateforme sûre</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                Raison du signalement *
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      reason === opt.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={opt.value}
                      checked={reason === opt.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      reason === opt.value ? 'border-orange-500' : 'border-gray-300'
                    }`}>
                      {reason === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-2">
                Détails supplémentaires (optionnel)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                placeholder="Décrivez le problème..."
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !reason}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
