import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductCard from '../../component/common/ProductCard';
import { Eye, MessageCircle, Package } from 'lucide-react';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Récupération des produits...');
      console.log('👤 Utilisateur:', user);
      
      // Récupérer les offres de type "product" pour l'utilisateur connecté
      const response = await offersApi.myOffers();
      console.log('✅ Réponse API produits:', response);
      
      // Filtrer uniquement les offres de type "product" et exclure les offres marketing
      const products = Array.isArray(response.data) 
        ? response.data.filter(offer => offer.type === 'product' && !offer.isMarketing)
        : [];
      
      // Mettre à jour l'état avec les produits récupérés
      setProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
  }, [user, navigate]);


  
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setProductToDelete(null);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (!productToDelete || deleteLoading) return;

    setDeleteLoading(true);
    try {
      await offersApi.delete(productToDelete._id);
      console.log('✅ Produit supprimé');
      // Mettre à jour l'état local
      setProducts(products.filter(product => product._id !== productToDelete._id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du produit');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (offerId, currentStatus) => {
    try {
      // Utiliser 'paused' au lieu de 'inactive' selon le modèle Offer
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      console.log('🔄 Tentative de mise à jour du statut:', { offerId, currentStatus, newStatus });
      
      const response = await offersApi.update(offerId, { status: newStatus });
      console.log('✅ Statut mis à jour:', response);
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      console.error('❌ Détails de l\'erreur:', error.response?.data);
      alert(`Erreur lors de la mise à jour du statut: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <div className="max-w-[1600px] mx-auto px-4 lg:px-16 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base lg:text-lg text-gray-900">Mes offres marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos produits et services en vente</p>
        </div>
        {/* Liste des offres marketing */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => {
              const badge = {
                active: { text: 'Active', color: 'bg-orange-50 text-orange-600 border border-orange-500' },
                paused: { text: 'En pause', color: 'bg-orange-50 text-orange-600 border border-orange-500' }
              }[product.status] || { text: 'Active', color: 'bg-orange-50 text-orange-600 border border-orange-500' };
              
              const cardClasses = "bg-white rounded-lg border border-gray-200 transition-all overflow-hidden";
              
              return (
                <div
                  key={product._id}
                  className={cardClasses}
                >
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                      {/* En-tête avec image et vues */}
                      <div className="flex items-start justify-between w-full lg:hidden">
                        {/* Image du produit - mobile */}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${
                          product.status === 'active' ? 'ring-2 ring-orange-500' : 'ring-2 ring-gray-300'
                        }`}>
                          {product.mainImage ? (
                            <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Vues - complètement à droite */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                          <span>{product.views || 0}</span>
                        </div>
                      </div>

                      {/* Image du produit - desktop */}
                      <div className="hidden lg:block lg:w-48 lg:h-auto lg:flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.mainImage ? (
                          <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 flex flex-col gap-3 sm:gap-4">
                        {/* Titre et informations avec vues à droite */}
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1 min-w-0">
                            {/* Titre et prix sur la même ligne - mobile uniquement */}
                            <div className="flex flex-col sm:flex-col lg:flex-col gap-1 mb-1">
                              <div className="flex items-center justify-between sm:hidden">
                                <h3 className="text-sm text-gray-900 flex-1 min-w-0">
                                  {product.title && product.title.length > 10 
                                    ? `${product.title.substring(0, 10)}...` 
                                    : product.title || 'Produit sans nom'}
                                </h3>
                                <span className="text-sm text-orange-600 font-semibold ml-2 flex-shrink-0">
                                  {(Number(product.conditions?.salary || product.price) || 0).toLocaleString()} FCFA
                                </span>
                              </div>
                              <h3 className="hidden sm:block text-sm sm:text-base text-gray-900 lg:block">
                                {product.title || 'Produit sans nom'}
                              </h3>
                              <span className="hidden sm:block text-sm sm:text-base text-orange-600 font-semibold lg:block">
                                {(Number(product.conditions?.salary || product.price) || 0).toLocaleString()} FCFA
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-col lg:flex-col gap-1 mb-2">
                              <div className="flex items-center justify-between sm:hidden">
                                <p className="text-xs text-gray-600 leading-relaxed flex-1 min-w-0">
                                  {product.category || 'Produit'} • {product.location?.city || 'Non spécifié'}
                                </p>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                  {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed lg:block">
                                {product.category || 'Produit'} • {product.location?.city || 'Non spécifié'}
                              </p>
                              <div className="hidden sm:block flex flex-wrap gap-2 text-xs text-gray-500 lg:block">
                                <span className="bg-gray-100 px-2 py-1 rounded">{new Date(product.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Vues - desktop à droite */}
                          <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 ml-4">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            <span>{product.views || 0}</span>
                          </div>
                        </div>

                        {/* Status et actions - toujours sur la même ligne */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs self-start hidden sm:block ${badge.color}`}>
                            {badge.text}
                          </span>
                          <div className="flex flex-row gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => navigate(`/produit/${product._id}`)}
                              className="flex-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs"
                            >
                              Voir
                            </button>
                            <button 
                              onClick={() => navigate(`/edit-offer/${product._id}`)}
                              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(product._id, product.status)}
                              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                            >
                              {product.status === 'active' ? 'Pause' : 'Activer'}
                            </button>
                            <button 
                              onClick={() => openDeleteModal(product)}
                              className="flex-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-xs"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune offre marketing à afficher pour le moment</p>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer l'offre"
        subtitle={productToDelete?.title}
        message="Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
