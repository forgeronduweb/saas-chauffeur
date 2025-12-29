import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiFilter } from 'react-icons/ci';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import CustomDropdown from '../../component/common/CustomDropdown';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import { Eye, MessageCircle, MoreVertical, Power, Edit3, Trash2, Plus, TrendingUp, Star, Clock, BarChart3, Filter, AlertCircle, TrendingDown, DollarSign, PieChart, Activity, Target, Wallet, Calendar, Copy, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentView, setCurrentView] = useState('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Hook pour les messages non lus
  const { unreadCount } = useUnreadMessages();
  
  // États pour les vues statistics et earnings
  const [timeRange, setTimeRange] = useState('30');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Récupération des produits...');
      console.log('👤 Utilisateur:', user);
      
      // Récupérer les offres de type "product" pour l'utilisateur connecté
      const response = await offersApi.myOffers();
      console.log('✅ Réponse API produits:', response);
      
      // Filtrer uniquement les offres de type "product"
      const products = Array.isArray(response.data) 
        ? response.data.filter(offer => offer.type === 'product' || offer.type === 'Autre')
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


  const filteredProducts = filter === 'all' 
    ? products 
    : filter === 'inactive' 
      ? products.filter(p => p.status === 'paused')
      : products.filter(p => p.status === filter);

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

  const handleDuplicate = async (product) => {
    try {
      const duplicatedProduct = {
        ...product,
        title: `${product.title} (Copie)`,
        status: 'active'
      };
      delete duplicatedProduct._id;
      delete duplicatedProduct.createdAt;
      delete duplicatedProduct.updatedAt;
      
      await offersApi.create(duplicatedProduct);
      console.log('✅ Offre dupliquée');
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur lors de la duplication:', error);
      alert('Erreur lors de la duplication de l\'offre');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header avec titre */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-between w-full lg:block">
              <h1 className="text-base lg:text-xl text-gray-900">Mes offres marketing</h1>
              
              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="sm:hidden p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <CiFilter className="w-6 h-6" />
              </button>
            </div>
            
            {/* Dropdown filtres/période - Desktop uniquement */}
            <div className="hidden lg:block">
              {currentView === 'list' ? (
                <CustomDropdown
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: 'all', label: `Tous les articles (${products.length})` },
                    { value: 'active', label: `Articles actifs (${products.filter(p => p.status === 'active').length})` },
                    { value: 'inactive', label: `Inactives (${products.filter(p => p.status === 'paused').length})` }
                  ]}
                  placeholder="Filtrer par statut"
                  className="w-64"
                />
              ) : (
                <CustomDropdown
                  value={timeRange}
                  onChange={setTimeRange}
                  options={[
                    { value: '7', label: '7 derniers jours' },
                    { value: '30', label: '30 derniers jours' },
                    { value: '90', label: '90 derniers jours' }
                  ]}
                  placeholder="Sélectionner période"
                  className="w-64"
                />
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm lg:text-base">Gérez vos produits et services publiés</p>
        </div>
        <div>
          {/* Main Content */}
          <div className="flex-1">
            
            {/* Content Area */}
            {currentView === 'list' ? (
              // Vue Liste des offres
              loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <h3 className="text-gray-900 mb-2">
                  {filter === 'all' 
                    ? "Aucune offre marketing"
                    : `Aucune offre ${filter === 'active' ? 'active' : 'inactive'}`
                  }
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {filter === 'all' 
                    ? "Vous n'avez pas encore créé d'offres marketing."
                    : `Aucune offre ${filter === 'active' ? 'active' : 'inactive'} trouvée.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header des résultats */}
                <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm lg:text-lg text-gray-900">
                        {filter === 'all' ? 'Toutes vos offres' : 
                         filter === 'active' ? 'Offres actives' : 'Offres inactives'}
                      </h2>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {filteredProducts.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                      <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span><span className="lg:hidden">Perf:</span><span className="hidden lg:inline">Performance:</span> 87%</span>
                    </div>
                  </div>
                </div>

                {/* Grille des offres en cartes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        {product.mainImage ? (
                          <img 
                            src={product.mainImage} 
                            alt={product.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}

                        {/* Badge statut */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {product.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Menu actions */}
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => navigate(`/produit/${product._id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir l'annonce
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/edit-offer/${product._id}`)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(product._id, product.status)}>
                                <Power className="w-4 h-4 mr-2" />
                                {product.status === 'active' ? 'Désactiver' : 'Activer'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteModal(product)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Stats en bas de l'image */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <div className="flex gap-3 text-white text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {product.views || 0} vues
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {product.messagesCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        {/* Catégorie */}
                        {product.category && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mb-2">
                            {product.category}
                          </span>
                        )}
                        
                        {/* Titre */}
                        <h3 className="text-sm lg:text-base text-gray-900 font-medium line-clamp-2 mb-2">
                          {product.title}
                        </h3>

                        {/* Prix */}
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-lg lg:text-xl font-semibold text-gray-900">
                            {(Number(product.conditions?.salary || product.price) || 0).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">FCFA</span>
                        </div>

                        {/* Localisation et date */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="truncate">{product.location?.city || 'Non spécifié'}</span>
                          </div>
                          <span>
                            {new Date(product.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : (
              // Vue Statistiques et Revenus
              <div className="space-y-6">

                {/* Section Statistiques */}
                <div>
                  <h2 className="text-lg text-gray-900 mb-4">Statistiques</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Vues totales</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{(products.length * 23).toLocaleString()}</p>
                          <span className="text-xs lg:text-sm text-orange-600 mt-1">+12% vs période précédente</span>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Messages reçus</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.length * 5}</p>
                          <p className="text-xs lg:text-sm text-orange-600 mt-1">+8% vs période précédente</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Taux de conversion</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">12.5%</p>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">-2% vs période précédente</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Articles actifs</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.filter(p => p.status === 'active').length}</p>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">sur {products.length} total</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Revenus */}
                <div>
                  <h2 className="text-lg text-gray-900 mb-4">Revenus</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Revenus potentiels</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0).toLocaleString()} F</p>
                          <p className="text-xs lg:text-sm text-orange-600 mt-1">Toutes vos offres</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Revenus actifs</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.filter(p => p.status === 'active').reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0).toLocaleString()} F</p>
                          <p className="text-xs lg:text-sm text-orange-600 mt-1">Offres en ligne</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Estimation mensuelle</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{Math.floor(products.filter(p => p.status === 'active').reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0) * 0.12).toLocaleString()} F</p>
                          <p className="text-xs lg:text-sm text-orange-600 mt-1">Basé sur 12% conversion</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-50 rounded-full flex items-center justify-center">
                          <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs lg:text-sm text-gray-600">Moyenne par offre</p>
                          <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.length > 0 ? Math.floor(products.reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0) / products.length).toLocaleString() : 0} F</p>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">Prix moyen</p>
                        </div>
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Filtres Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          
          {/* Modal Content - Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-gray-900">Filtrer par statut</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Liste des options */}
            <div className="py-2">
              {[
                { value: 'all', label: `Tous les articles (${products.length})` },
                { value: 'active', label: `Articles actifs (${products.filter(p => p.status === 'active').length})` },
                { value: 'inactive', label: `Inactifs (${products.filter(p => p.status === 'paused').length})` }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setShowMobileFilters(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm ${
                    filter === option.value 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
