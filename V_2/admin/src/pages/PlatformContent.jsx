import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Save,
  X,
  Upload,
  GripVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const PlatformContent = () => {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('hero_carousel')
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    type: 'hero_carousel',
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    link: '',
    buttonText: '',
    order: 0,
    isActive: true
  })

  const contentTypes = [
    { value: 'hero_carousel', label: 'Carousel Hero', icon: '🎠' },
    { value: 'testimonial', label: 'Témoignages', icon: '💬' },
    { value: 'partner_logo', label: 'Logos Partenaires', icon: '🤝' },
    { value: 'feature', label: 'Fonctionnalités', icon: '⭐' },
    { value: 'stat', label: 'Statistiques', icon: '📊' },
    { value: 'faq', label: 'FAQ', icon: '❓' }
  ]

  useEffect(() => {
    fetchContents()
  }, [selectedType])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(`${API_URL}/platform-content?type=${selectedType}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setContents(response.data.data || [])
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des contenus')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('adminToken')
      const submitData = new FormData()
      
      Object.keys(formData).forEach(key => {
        if (key !== 'imageFile' && formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key])
        }
      })
      
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile)
      }

      if (editingContent) {
        await axios.put(`${API_URL}/platform-content/${editingContent._id}`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Contenu mis à jour avec succès')
      } else {
        await axios.post(`${API_URL}/platform-content`, submitData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        toast.success('Contenu créé avec succès')
      }

      setShowModal(false)
      resetForm()
      fetchContents()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${API_URL}/platform-content/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Contenu supprimé avec succès')
      fetchContents()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.patch(`${API_URL}/platform-content/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Statut mis à jour')
      fetchContents()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const openEditModal = (content) => {
    setEditingContent(content)
    setFormData({
      type: content.type,
      title: content.title || '',
      subtitle: content.subtitle || '',
      description: content.description || '',
      imageUrl: content.imageUrl || '',
      link: content.link || '',
      buttonText: content.buttonText || '',
      order: content.order || 0,
      isActive: content.isActive
    })
    setImagePreview(content.imageUrl)
    setShowModal(true)
  }

  const openCreateModal = () => {
    resetForm()
    setFormData({ ...formData, type: selectedType })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingContent(null)
    setImagePreview(null)
    setFormData({
      type: selectedType,
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      link: '',
      buttonText: '',
      order: 0,
      isActive: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
          <p className="text-sm text-gray-600 mt-2">
            Gérez les images et contenus de la plateforme
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Ajouter un contenu</span>
        </button>
      </div>

      {/* Type Selector */}
      <div className="bg-white border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {contentTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`p-5 border-2 transition-all ${
                selectedType === type.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <div className="text-3xl mb-3">{type.icon}</div>
              <div className="text-sm font-semibold text-gray-900">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : contents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Aucun contenu pour cette catégorie</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contents.map(content => (
              <div key={content._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  
                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-24 h-24 object-cover border border-gray-200"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{content.title || 'Sans titre'}</h3>
                    {content.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{content.subtitle}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs font-medium text-gray-500">Ordre: {content.order}</span>
                      <span className={`text-xs px-3 py-1 font-medium border ${
                        content.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {content.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStatus(content._id)}
                      className="p-3 hover:bg-gray-100 transition-colors border border-gray-200"
                      title={content.isActive ? 'Désactiver' : 'Activer'}
                    >
                      {content.isActive ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(content)}
                      className="p-3 hover:bg-blue-50 transition-colors border border-gray-200"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(content._id)}
                      className="p-3 hover:bg-red-50 transition-colors border border-gray-200"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-gray-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingContent ? 'Modifier le contenu' : 'Nouveau contenu'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Image
                </label>
                <div className="border-2 border-dashed border-gray-300 p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-56 object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData({ ...formData, imageFile: null })
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer py-8">
                      <Upload className="w-16 h-16 text-gray-400 mb-3" />
                      <span className="text-base font-medium text-gray-600">Cliquez pour uploader une image</span>
                      <span className="text-sm text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                />
              </div>

              {/* Link & Button Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Lien
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:outline-none focus:border-orange-500 text-base"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                  Activer ce contenu
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
                >
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformContent
