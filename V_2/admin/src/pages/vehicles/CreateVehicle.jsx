import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiService } from '../../services/api'

const CreateVehicle = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    plate: '',
    year: '',
    color: '',
    type: '',
    seats: '',
    driverId: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await apiService.createVehicle(formData)
      toast.success('Véhicule créé avec succès')
      navigate('/vehicles')
    } catch (error) {
      toast.error('Erreur lors de la création du véhicule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="p-2 hover:bg-gray-100 transition-colors border-2 border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouveau Véhicule</h1>
            <p className="text-sm text-gray-600 mt-1">
              Ajouter un nouveau véhicule à la flotte
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border-2 border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marque */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Marque *
              </label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="Toyota, Mercedes, etc."
              />
            </div>

            {/* Modèle */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Modèle *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="Corolla, Classe E, etc."
              />
            </div>

            {/* Plaque */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Plaque d'immatriculation *
              </label>
              <input
                type="text"
                required
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="AB-1234-CD"
              />
            </div>

            {/* Année */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Année
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="2024"
              />
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Couleur
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="Noir, Blanc, etc."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type de véhicule
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
              >
                <option value="">Sélectionner un type</option>
                <option value="berline">Berline</option>
                <option value="suv">SUV</option>
                <option value="4x4">4x4</option>
                <option value="minibus">Minibus</option>
                <option value="utilitaire">Utilitaire</option>
                <option value="luxe">Véhicule de luxe</option>
              </select>
            </div>

            {/* Nombre de places */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre de places
              </label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="5"
              />
            </div>

            {/* ID Chauffeur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                ID Chauffeur (optionnel)
              </label>
              <input
                type="text"
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500"
                placeholder="Laisser vide si non assigné"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Création...' : 'Créer le véhicule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateVehicle
