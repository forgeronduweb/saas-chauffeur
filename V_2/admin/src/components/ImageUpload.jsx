import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

const ImageUpload = ({ images = [], onImagesChange, maxImages = 4 }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)
    
    // Vérifier le nombre total d'images
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`)
      return
    }

    // Vérifier le type et la taille des fichiers
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} est trop volumineux (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      validFiles.forEach(file => {
        formData.append('images', file)
      })

      const response = await apiService.uploadProjectImages(formData)
      const uploadedImages = response.data.data.images

      // Ajouter les nouvelles images à la liste existante
      const newImages = [...images, ...uploadedImages]
      onImagesChange(newImages)
      
      toast.success(`${uploadedImages.length} image(s) uploadée(s) avec succès`)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      const message = error.response?.data?.error || 'Erreur lors de l\'upload des images'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
    // Reset input pour permettre de sélectionner le même fichier
    e.target.value = ''
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove)
    onImagesChange(newImages)
    toast.success('Image supprimée')
  }

  const setPrimaryImage = (indexToSetPrimary) => {
    const newImages = images.map((img, index) => ({
      ...img,
      isPrimary: index === indexToSetPrimary
    }))
    onImagesChange(newImages)
    toast.success('Image principale mise à jour')
  }

  return (
    <div className="space-y-4">
      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading || images.length >= maxImages}
      />

      {/* 4 zones d'upload alignées */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: maxImages }).map((_, index) => {
          const hasImage = images[index]
          const image = images[index]
          
          return (
            <div
              key={index}
              className={`relative aspect-square border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                dragActive && !hasImage
                  ? 'border-orange-400 bg-orange-50'
                  : hasImage
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={!hasImage ? triggerFileInput : undefined}
            >
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                {hasImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={`http://localhost:5000${image.url}`}
                      alt={image.alt || `Image ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-gray-400 rounded bg-gray-100 dark:bg-gray-800" style={{ display: 'none' }}>
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    
                    {/* Overlay avec actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                      <div className="flex flex-col space-y-1">
                        {!image.isPrimary && (
                          <button
                            onClick={() => setPrimaryImage(index)}
                            className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors"
                            title="Définir comme image principale"
                          >
                            Principal
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center"
                          title="Supprimer l'image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Badge image principale */}
                    {image.isPrimary && (
                      <div className="absolute top-1 left-1 px-1 py-0.5 bg-orange-500 text-white text-xs rounded">
                        #1
                      </div>
                    )}
                  </div>
                ) : isUploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs text-gray-600 text-center">
                      Upload...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Image {index + 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Cliquez ou glissez
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Informations globales */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Glissez-déposez vos images</span> ou cliquez sur une zone vide
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          PNG, JPG, GIF jusqu'à 5MB • {images.length}/{maxImages} images uploadées
        </p>
        
        {/* Bouton d'upload alternatif */}
        {images.length < maxImages && (
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Upload en cours...' : 'Ajouter des images'}
          </button>
        )}
      </div>

      {/* Message d'information */}
      {images.length === 0 && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <AlertCircle className="w-4 h-4" />
          <span>Ajoutez jusqu'à {maxImages} images pour présenter votre projet</span>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
