import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi, promotionsApi, productsApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BoostModal from '../../components/modals/BoostModal';
import CustomDropdown from '../../component/common/CustomDropdown';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import { Eye, MessageCircle, Copy, Power, Edit3, Trash2, Plus, TrendingUp, Zap, Star, Clock, BarChart3, Filter, AlertCircle, TrendingDown, DollarSign, PieChart, Activity, Target, Wallet, Calendar } from 'lucide-react';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentView, setCurrentView] = useState('list');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // États pour le système de boost
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showBoostMenu, setShowBoostMenu] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBoostDuration, setSelectedBoostDuration] = useState(null);
  const [boostImage, setBoostImage] = useState(null);
  const [boostImagePreview, setBoostImagePreview] = useState(null);
  const [boostText, setBoostText] = useState('');
  const [boostStep, setBoostStep] = useState(1); // 1: Image/Texte, 2: Plans, 3: Paiement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [userBoosts, setUserBoosts] = useState([]);
  const [loadingBoosts, setLoadingBoosts] = useState(false);
  const [creatingBoost, setCreatingBoost] = useState(false);
  
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

  const fetchUserBoosts = async () => {
    // Implémentation de la fonction fetchUserBoosts si nécessaire
    setUserBoosts([]);
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
    fetchUserBoosts();
  }, [user, navigate]);

  const handleBoostClick = (product) => {
    setSelectedProduct(product);
    setSelectedBoostDuration(null);
    setBoostImage(null);
    setBoostImagePreview(null);
    setBoostText('');
    setBoostStep(1);
    setShowBoostMenu(true);
  };

  const handleBoostCreated = (boostData) => {
    // Recharger les boosts après création
    fetchUserBoosts();
  };

  const handleSelectBoostDuration = (duration) => {
    setSelectedBoostDuration(duration);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setBoostImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setBoostImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBoostImage = () => {
    setBoostImage(null);
    setBoostImagePreview(null);
  };

  const handleNextStep = () => {
    if (boostStep === 1) {
      setBoostStep(2);
    } else if (boostStep === 2 && selectedBoostDuration) {
      setBoostStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (boostStep === 2) {
      setBoostStep(1);
    } else if (boostStep === 3) {
      setBoostStep(2);
    }
  };

  const handleCreateBoost = async () => {
    if (!selectedProduct || !selectedBoostDuration || !selectedPaymentMethod) {
      alert('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setCreatingBoost(true);
    try {
      // Créer FormData pour inclure l'image
      const formData = new FormData();
      formData.append('offerId', selectedProduct._id);
      formData.append('duration', selectedBoostDuration.days);
      formData.append('price', selectedBoostDuration.price);
      formData.append('boostText', boostText);
      formData.append('paymentMethod', selectedPaymentMethod);
      
      if (boostImage) {
        formData.append('boostImage', boostImage);
      }

      const response = await productsApi.createBoost(formData);
      
      if (response.data.success) {
        alert(`Paiement confirmé ! Boost créé avec succès pour ${selectedBoostDuration.days} jour${selectedBoostDuration.days > 1 ? 's' : ''} !`);
        setShowBoostMenu(false);
        setSelectedProduct(null);
        setSelectedBoostDuration(null);
        setSelectedPaymentMethod(null);
        setBoostImage(null);
        setBoostImagePreview(null);
        setBoostText('');
        setBoostStep(1);
        fetchProducts(); // Recharger les produits pour mettre à jour l'affichage
      } else {
        alert('Erreur lors du traitement du paiement');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setCreatingBoost(false);
    }
  };

  const getProductBoost = (productId) => {
    return userBoosts.find(boost => 
      boost.offerId._id === productId && 
      boost.isActive
    );
  };

  const getBoostIcon = (type) => {
    switch (type) {
      case 'featured': return <TrendingUp className="w-4 h-4" />;
      case 'premium': return <Star className="w-4 h-4" />;
      case 'urgent': return <Zap className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
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

  const filteredProducts = filter === 'all' 
    ? products 
    : filter === 'inactive' 
      ? products.filter(p => p.status === 'paused')
      : filter === 'premium'
        ? products.filter(p => getProductBoost(p._id))
        : filter === 'simple'
          ? products.filter(p => !getProductBoost(p._id))
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

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        // Utiliser la méthode delete de l'API des offres
        await offersApi.delete(productId);
        // Mettre à jour l'état local
        setProducts(products.filter(product => product._id !== productId));
        alert('Produit supprimé avec succès');
      } catch (err) {
        console.error('Erreur lors de la suppression du produit:', err);
        alert('Erreur lors de la suppression du produit');
      }
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
                className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtres
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
                    { value: 'premium', label: `Articles premium (${products.filter(p => p.isPremium || p.isPromoted).length})` },
                    { value: 'simple', label: `Articles simples (${products.filter(p => !p.isPremium && !p.isPromoted).length})` },
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
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-base lg:text-xl text-gray-900 mb-4">Tableau de bord</h3>
              
              {/* Menu de navigation */}
              <div className="space-y-2">
                {/* Tous les articles */}
                <button
                  onClick={() => {setFilter('all'); setCurrentView('list');}}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    currentView === 'list' && filter === 'all'
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-xl text-gray-900">Tous les articles</p>
                        <p className="text-sm text-gray-600">Toutes vos offres</p>
                      </div>
                    </div>
                  </div>
                </button>


                {/* Mes revenus */}
                <button
                  onClick={() => setCurrentView('earnings')}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    currentView === 'earnings' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-white hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-xl text-gray-900">Mes revenus</p>
                        <p className="text-xs text-gray-600">Gains potentiels</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Statistiques */}
                <button
                  onClick={() => setCurrentView('statistics')}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    currentView === 'statistics' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm lg:text-xl text-gray-900">Statistiques</p>
                        <p className="text-xs text-gray-600">Voir les détails</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Messages non lus */}
                {unreadCount > 0 && (
                  <button
                    onClick={() => navigate('/messages')}
                    className="w-full p-3 rounded-lg transition-colors text-left bg-red-50 border border-red-200 hover:bg-red-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm lg:text-xl text-gray-900">Messages</p>
                          <p className="text-xs text-gray-600">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">Menu</span>
                <Filter className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content Area */}
            {currentView === 'list' ? (
              // Vue Liste des offres
              loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Chargement de vos offres...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                
                <h3 className="text-xl text-gray-900 mb-2">Aucune offre trouvée</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {filter === 'all' 
                    ? "Vous n'avez pas encore créé d'offres marketing. Commencez dès maintenant !"
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
                      <h2 className="text-gray-900">
                        {filter === 'all' ? 'Toutes vos offres' : 
                         filter === 'active' ? 'Offres actives' : 'Offres inactives'}
                      </h2>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                        {filteredProducts.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      <span>Performance globale: 87%</span>
                    </div>
                  </div>
                </div>

                {/* Grille des offres en cartes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden"
                    >
                      {/* Image en haut */}
                      <figure className="relative h-48 overflow-hidden">
                        {/* Badge de boost */}
                        {(() => {
                          const boost = getProductBoost(product._id);
                          return boost ? (
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white bg-purple-500 flex items-center gap-1 z-10">
                              <Zap className="w-3 h-3" />
                              <span>Boostée</span>
                            </div>
                          ) : null;
                        })()}
                        
                        {/* Statut */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {product.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {product.mainImage ? (
                          <img 
                            src={product.mainImage} 
                            alt={product.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <TrendingUp className="w-12 h-12 text-blue-500" />
                          </div>
                        )}

                        {/* Statistiques en overlay */}
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {Math.floor(Math.random() * 50) + 10}
                          </div>
                          <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {Math.floor(Math.random() * 8) + 1}
                          </div>
                        </div>
                      </figure>

                      {/* Contenu de la carte */}
                      <div className="p-4">
                        {/* Catégorie */}
                        {product.category && (
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {product.category}
                            </span>
                          </div>
                        )}
                        
                        {/* Titre et prix */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg text-gray-900 line-clamp-2 flex-1">
                            {product.title}
                          </h3>
                          <div className="flex items-baseline gap-1 flex-shrink-0">
                            <span className="text-xl text-blue-600 whitespace-nowrap">
                              {(Number(product.conditions?.salary || product.price) || 0).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600">F</span>
                          </div>
                        </div>

                        {/* Localisation et date */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{product.location?.city || 'Non spécifié'}</span>
                          </div>
                          <span className="text-xs">
                            {new Date(product.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => navigate(`/produit/${product._id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                            >
                              Voir
                            </button>
                            
                            {/* Bouton Boost */}
                            {!getProductBoost(product._id) && product.status === 'active' && (
                              <button 
                                onClick={() => handleBoostClick(product)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 rounded text-sm transition-all flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3" />
                                Boost
                              </button>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleToggleStatus(product._id, product.status)}
                              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDuplicate(product)}
                              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => navigate(`/edit-offer/${product._id}`)}
                              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(product)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
            ) : currentView === 'statistics' ? (
              // Vue Statistiques
              <div className="space-y-6">

                {/* Métriques principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Vues totales</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{(products.length * 23).toLocaleString()}</p>
                        <p className="text-xs lg:text-sm text-green-600 mt-1">+12% vs période précédente</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Messages reçus</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.length * 5}</p>
                        <p className="text-xs lg:text-sm text-green-600 mt-1">+8% vs période précédente</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Taux de conversion</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">12.5%</p>
                        <p className="text-xs lg:text-sm text-red-600 mt-1">-2% vs période précédente</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
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
            ) : (
              // Vue Revenus
              <div className="space-y-6">

                {/* Métriques principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Revenus potentiels</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0).toLocaleString()} F</p>
                        <p className="text-xs lg:text-sm text-green-600 mt-1">Toutes vos offres</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Revenus actifs</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{products.filter(p => p.status === 'active').reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0).toLocaleString()} F</p>
                        <p className="text-xs lg:text-sm text-blue-600 mt-1">Offres en ligne</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">Estimation mensuelle</p>
                        <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{Math.floor(products.filter(p => p.status === 'active').reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0) * 0.12).toLocaleString()} F</p>
                        <p className="text-xs lg:text-sm text-purple-600 mt-1">Basé sur 12% conversion</p>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
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
            )}
          </div>
        </div>
      </div>

      {/* Modal Sidebar Mobile - Style Filtre */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
          
          {/* Modal Content - Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[60vh] overflow-y-auto">
            {/* Barre de glissement */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-3"></div>
            
            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Tableau de bord</h3>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu de navigation complet */}
            <div className="p-4 space-y-2">
              {/* Tous les articles */}
              <button
                onClick={() => {setFilter('all'); setCurrentView('list'); setShowMobileSidebar(false);}}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  currentView === 'list' && filter === 'all'
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Tous les articles</p>
                      <p className="text-xs text-gray-600">Toutes vos offres</p>
                    </div>
                  </div>
                </div>
              </button>


              {/* Mes revenus */}
              <button
                onClick={() => {setCurrentView('earnings'); setShowMobileSidebar(false);}}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  currentView === 'earnings' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white hover:bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Mes revenus</p>
                      <p className="text-xs text-gray-600">Gains potentiels</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Statistiques */}
              <button
                onClick={() => {setCurrentView('statistics'); setShowMobileSidebar(false);}}
                className={`w-full p-3 rounded-lg transition-colors text-left ${
                  currentView === 'statistics' 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Statistiques</p>
                      <p className="text-xs text-gray-600">Voir les détails</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* Messages non lus */}
              {unreadCount > 0 && (
                <button
                  onClick={() => {navigate('/messages'); setShowMobileSidebar(false);}}
                  className="w-full p-3 rounded-lg transition-colors text-left bg-red-50 border border-red-200 hover:bg-red-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Messages</p>
                        <p className="text-xs text-gray-600">{unreadCount} non lu{unreadCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Boost - Bottom Sheet Mobile / Sidebar Desktop */}
      {showBoostMenu && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBoostMenu(false)}
          ></div>

          {/* Menu - Bottom Sheet Mobile / Sidebar Desktop */}
          <div className="absolute bottom-0 left-0 right-0 lg:right-0 lg:top-0 lg:bottom-0 lg:left-auto lg:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out rounded-t-lg lg:rounded-none max-h-[80vh] lg:max-h-full overflow-hidden">
            {/* Barre de glissement mobile */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-3 lg:hidden"></div>
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {boostStep === 2 && (
                    <button
                      onClick={handlePreviousStep}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <h3 className="text-lg text-gray-900">
                    {boostStep === 1 ? 'Créer votre publicité' : boostStep === 2 ? 'Choisir votre plan' : 'Paiement'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowBoostMenu(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Indicateur d'étapes */}
              <div className="flex items-center justify-center mt-3 space-x-2">
                <div className={`w-2 h-2 rounded-full ${boostStep === 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${boostStep === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${boostStep === 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 max-h-[calc(80vh-120px)] lg:max-h-[calc(100vh-120px)]">
              {selectedProduct && (
                <>
                  {/* Aperçu du produit */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <h4 className="text-sm text-gray-900 mb-1">{selectedProduct.title}</h4>
                    <p className="text-xs text-orange-600">
                      {(Number(selectedProduct.conditions?.salary || selectedProduct.price) || 0).toLocaleString()} F
                    </p>
                  </div>

                  {/* Étape 1: Image et Texte */}
                  {boostStep === 1 && (
                    <>
                      {/* Upload d'image publicitaire */}
                      <div className="space-y-3">
                        <h5 className="text-sm text-gray-900">Image publicitaire (optionnel)</h5>
                    
                    {!boostImagePreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="boost-image-upload"
                        />
                        <label htmlFor="boost-image-upload" className="cursor-pointer">
                          <div className="space-y-2">
                            <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-600">Cliquez pour ajouter une image</p>
                            <p className="text-xs text-gray-500">PNG, JPG jusqu'à 5MB</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={boostImagePreview} 
                          alt="Aperçu publicité" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={removeBoostImage}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                      </div>

                      {/* Texte publicitaire */}
                      <div className="space-y-3">
                        <h5 className="text-sm text-gray-900">Texte publicitaire</h5>
                        <textarea
                          value={boostText}
                          onChange={(e) => setBoostText(e.target.value)}
                          placeholder="Écrivez un message accrocheur pour votre publicité..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                          rows="4"
                          maxLength="200"
                        />
                        <p className="text-xs text-gray-500 text-right">{boostText.length}/200 caractères</p>
                      </div>
                    </>
                  )}

                  {/* Étape 2: Plans de boost */}
                  {boostStep === 2 && (
                    <>
                      <div className="space-y-4">
                        <h5 className="text-sm text-gray-900">Choisissez votre formule</h5>
                    
                    {/* Formule Découverte - 1 semaine */}
                    <button 
                      onClick={() => handleSelectBoostDuration({ days: 7, price: 2500, label: 'Découverte', weeks: 1 })}
                      className={`w-full p-4 border rounded-lg transition-colors text-left ${
                        selectedBoostDuration?.label === 'Découverte'
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs text-gray-900">Découverte</p>
                          <p className="text-xs text-gray-600">1 semaine</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-orange-600">2 500 F</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>• +200% de visibilité</p>
                        <p>• Publication Facebook automatique</p>
                        <p>• Badge "Boostée" visible</p>
                      </div>
                    </button>

                    {/* Formule Croissance - 3 semaines */}
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Recommandé
                      </div>
                      <button 
                        onClick={() => handleSelectBoostDuration({ days: 21, price: 6000, label: 'Croissance', weeks: 3 })}
                        className={`w-full p-4 border rounded-lg transition-colors text-left ${
                          selectedBoostDuration?.label === 'Croissance'
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-gray-900">Croissance</p>
                            <p className="text-xs text-orange-600">3 semaines</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-orange-600">6 000 F</p>
                            <p className="text-xs text-gray-500 line-through">7 500 F</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>• +400% de visibilité</p>
                          <p>• 3 publications Facebook</p>
                          <p>• Support prioritaire</p>
                          <p className="text-gray-600">• Économie de 20%</p>
                        </div>
                      </button>
                    </div>

                    {/* Formule Succès - 1 mois et demi */}
                    <button 
                      onClick={() => handleSelectBoostDuration({ days: 45, price: 8500, label: 'Succès', weeks: 6 })}
                      className={`w-full p-4 border rounded-lg transition-colors text-left ${
                        selectedBoostDuration?.label === 'Succès'
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs text-gray-900">Succès</p>
                          <p className="text-xs text-gray-600">1 mois et demi</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-orange-600">8 500 F</p>
                          <p className="text-xs text-gray-500 line-through">11 250 F</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>• +600% de visibilité maximale</p>
                        <p>• Publications Facebook hebdomadaires</p>
                        <p>• Badge "Vendeur Vérifié"</p>
                        <p className="text-gray-600">• Économie de 35%</p>
                      </div>
                    </button>
                      </div>

                    </>
                  )}

                  {/* Étape 3: Paiement */}
                  {boostStep === 3 && (
                    <>
                      <div className="space-y-4">
                        <h5 className="text-sm text-gray-900">Choisissez votre méthode de paiement</h5>
                        
                        {/* Récapitulatif de la commande */}
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Récapitulatif</h6>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Formule {selectedBoostDuration?.label}</span>
                            <span className="text-sm font-medium">{selectedBoostDuration?.price.toLocaleString()} F</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Durée: {selectedBoostDuration?.weeks ? `${selectedBoostDuration.weeks} semaine${selectedBoostDuration.weeks > 1 ? 's' : ''}` : `${selectedBoostDuration?.days} jour${selectedBoostDuration?.days > 1 ? 's' : ''}`}</span>
                          </div>
                        </div>

                        {/* Options de paiement */}
                        <div className="space-y-3">
                          {/* Paiement mobile */}
                          <div>
                            <h6 className="text-xs font-medium text-gray-700 mb-2">Paiement mobile</h6>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'wave', name: 'Wave', color: 'bg-blue-500'},
                                { id: 'mtn', name: 'MTN Money', color: 'bg-yellow-500'},
                                { id: 'orange', name: 'Orange Money', color: 'bg-orange-500'},
                                { id: 'moov', name: 'Moov Money', color: 'bg-green-500'}
                              ].map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => setSelectedPaymentMethod(method.id)}
                                  className={`p-3 border rounded-lg transition-colors text-left ${
                                    selectedPaymentMethod === method.id
                                      ? 'border-orange-500 bg-orange-50'
                                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{method.icon}</span>
                                    <span className="text-xs font-medium">{method.name}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Carte bancaire */}
                          <div>
                            <h6 className="text-xs font-medium text-gray-700 mb-2">Carte bancaire</h6>
                            <button
                              onClick={() => setSelectedPaymentMethod('visa')}
                              className={`w-full p-3 border rounded-lg transition-colors text-left ${
                                selectedPaymentMethod === 'visa'
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💳</span>
                                <span className="text-xs font-medium">Carte Visa/MasterCard</span>
                              </div>
                            </button>
                          </div>

                          {selectedPaymentMethod === 'visa' && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Numéro de carte"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="CVV"
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer avec bouton */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              {boostStep === 1 ? (
                <button 
                  onClick={handleNextStep}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : boostStep === 2 ? (
                <button 
                  onClick={handleNextStep}
                  disabled={!selectedBoostDuration}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    !selectedBoostDuration
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  Continuer vers le paiement
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleCreateBoost}
                  disabled={!selectedPaymentMethod || creatingBoost}
                  className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    !selectedPaymentMethod || creatingBoost
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {creatingBoost ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement du paiement...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Confirmer le paiement ({selectedBoostDuration?.price.toLocaleString()} F)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Filtres Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Filtres</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filtres */}
            <div className="p-4 space-y-3">
              {currentView === 'list' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Statut
                  </label>
                  <CustomDropdown
                    value={filter}
                    onChange={setFilter}
                    options={[
                      { value: 'all', label: `Tous les articles (${products.length})` },
                      { value: 'active', label: `Articles actifs (${products.filter(p => p.status === 'active').length})` },
                      { value: 'premium', label: `Articles premium (${products.filter(p => p.isPremium || p.isPromoted).length})` },
                      { value: 'simple', label: `Articles simples (${products.filter(p => !p.isPremium && !p.isPromoted).length})` },
                      { value: 'inactive', label: `Inactives (${products.filter(p => p.status === 'paused').length})` }
                    ]}
                    placeholder="Filtrer par statut"
                    className="w-full"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Période
                  </label>
                  <CustomDropdown
                    value={timeRange}
                    onChange={setTimeRange}
                    options={[
                      { value: '7', label: '7 derniers jours' },
                      { value: '30', label: '30 derniers jours' },
                      { value: '90', label: '90 derniers jours' }
                    ]}
                    placeholder="Sélectionner période"
                    className="w-full"
                  />
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-2 pt-3">
                <button 
                  onClick={() => {
                    setFilter('all');
                    setTimeRange('30');
                  }}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Réinitialiser
                </button>
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
