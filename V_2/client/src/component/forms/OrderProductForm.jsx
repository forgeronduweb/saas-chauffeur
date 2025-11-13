import { useState } from 'react';

export default function OrderProductForm({ productId, productName, productPrice, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Abidjan',
    quantity: 1,
    paymentMethod: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalPrice = productPrice * formData.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implémenter l'appel API pour créer la commande
      console.log('Commande créée:', { ...formData, productId, totalPrice });
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 className="text-xl text-gray-900 mb-2">Commande confirmée !</h3>
        <p className="text-gray-600">Nous vous contacterons pour la livraison.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">Commander {productName}</h2>
        <p className="text-gray-600">Remplissez vos informations de livraison</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nom complet */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Votre nom complet"
          />
        </div>

        {/* Email et Téléphone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="votre.email@exemple.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="+225 XX XX XX XX XX"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Adresse de livraison <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Rue, quartier, numéro..."
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Ville <span className="text-red-500">*</span>
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="Abidjan">Abidjan</option>
            <option value="Yamoussoukro">Yamoussoukro</option>
            <option value="Bouaké">Bouaké</option>
            <option value="Daloa">Daloa</option>
            <option value="San Pedro">San Pedro</option>
            <option value="Man">Man</option>
            <option value="Gagnoa">Gagnoa</option>
            <option value="Korhogo">Korhogo</option>
            <option value="Divo">Divo</option>
            <option value="Abengourou">Abengourou</option>
            <option value="Bondoukou">Bondoukou</option>
            <option value="Séguéla">Séguéla</option>
            <option value="Soubré">Soubré</option>
            <option value="Ferkessédougou">Ferkessédougou</option>
            <option value="Odienné">Odienné</option>
            <option value="Touba">Touba</option>
            <option value="Dabou">Dabou</option>
            <option value="Tiassalé">Tiassalé</option>
            <option value="Grand-Bassam">Grand-Bassam</option>
            <option value="Guiglo">Guiglo</option>
            <option value="Danané">Danané</option>
            <option value="Biankouma">Biankouma</option>
            <option value="M'Batto">M'Batto</option>
            <option value="Bocanda">Bocanda</option>
            <option value="Katiola">Katiola</option>
            <option value="Bouaflé">Bouaflé</option>
            <option value="Sakassou">Sakassou</option>
            <option value="Daoukro">Daoukro</option>
            <option value="Tanda">Tanda</option>
            <option value="Tabou">Tabou</option>
          </select>
        </div>

        {/* Quantité et Prix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Prix total
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-lg text-gray-900">
              {totalPrice.toLocaleString()} FCFA
            </div>
          </div>
        </div>

        {/* Mode de paiement */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Mode de paiement <span className="text-red-500">*</span>
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="">Sélectionnez un mode de paiement</option>
            <option value="cash">Paiement à la livraison</option>
            <option value="mobile">Mobile Money (Orange/MTN/Moov)</option>
            <option value="bank">Virement bancaire</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Notes supplémentaires <span className="text-gray-500 text-xs">(optionnel)</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            placeholder="Instructions spéciales, horaires de livraison préférés..."
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                Confirmer la commande
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
