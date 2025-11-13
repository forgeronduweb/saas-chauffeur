import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import CustomDropdown from '../../component/common/CustomDropdown';
import { Eye, MessageCircle, Copy, Power, Edit3, Trash2, Plus, TrendingUp } from 'lucide-react';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/auth');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Récupération des offres chauffeur...');
      console.log('👤 Utilisateur:', user);
      
      // Récupérer les offres de l'utilisateur connecté de type "Autre" (produits)
      const response = await offersApi.myOffers();
      console.log('✅ Réponse API:', response);
      console.log('📊 Données reçues:', response.data);
      
      // Filtrer uniquement les offres de type "Autre" (produits marketing)
      const allOffers = Array.isArray(response.data) ? response.data : [];
      console.log('📋 Total offres:', allOffers.length);
      
      const marketingOffers = allOffers.filter(offer => offer.type === 'Autre');
      console.log('🛒 Offres marketing filtrées:', marketingOffers.length);
      console.log('🛒 Détails:', marketingOffers);
      
      setProducts(marketingOffers);
    } catch (error) {
      console.error('❌ Erreur:', error);
      console.error('❌ Détails:', error.response?.data);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : filter === 'inactive' 
      ? products.filter(p => p.status === 'paused')
      : products.filter(p => p.status === filter);

  const handleDelete = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      await offersApi.delete(offerId);
      console.log('✅ Offre supprimée');
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'offre');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SimpleHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec filtres */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">Mes offres marketing</h1>
            
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
            
            {/* Dropdown personnalisé - Desktop uniquement */}
            <div className="hidden sm:block">
              <CustomDropdown
                value={filter}
                onChange={setFilter}
                placeholder="Filtrer par statut"
                options={[
                  { value: 'all', label: `Toutes (${products.length})` },
                  { value: 'active', label: `Actives (${products.filter(p => p.status === 'active').length})` },
                  { value: 'inactive', label: `Inactives (${products.filter(p => p.status === 'paused').length})` }
                ]}
              />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Gérez vos produits et services publiés</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl text-gray-900 mb-3">Aucune offre marketing</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Commencez à vendre vos produits et services. Créez votre première offre et touchez des milliers de clients potentiels.
            </p>
            <button
              onClick={() => navigate('/publier-offre')}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors inline-flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Créer ma première offre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 group"
              >
                {/* Image avec structure figure */}
                <figure className="relative h-48 overflow-hidden">
                  {product.mainImage ? (
                    <img 
                      src={product.mainImage} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-orange-400" />
                    </div>
                  )}
                  
                  {/* Statut avec design moderne */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs shadow-md ${
                      product.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {product.status === 'active' ? 'Active' : product.status === 'paused' ? 'Inactive' : 'Unknown'}
                    </span>
                  </div>

                  {/* Statistiques en overlay */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {Math.floor(Math.random() * 8) + 1}
                    </div>
                  </div>
                </figure>

                {/* Contenu de la carte */}
                <div className="p-6">
                  {/* Catégorie */}
                  {product.category && (
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Titre et prix */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors flex-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <span className="text-xl text-orange-600 whitespace-nowrap">
                        {(Number(product.conditions?.salary || product.price) || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">F</span>
                    </div>
                  </div>

                  {/* Localisation et date */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
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
                    <button 
                      onClick={() => navigate(`/produit/${product._id}`)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
                    >
                      Voir
                    </button>
                    <div className="flex gap-2">
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
                        onClick={() => handleDelete(product._id)}
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
                <h3 className="text-base text-gray-900">Filtres</h3>
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
                <div>
                  <label className="block text-xs text-gray-700 mb-1.5">
                    Statut
                  </label>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Toutes ({products.length})</option>
                    <option value="active">Actives ({products.filter(p => p.status === 'active').length})</option>
                    <option value="inactive">Inactives ({products.filter(p => p.status === 'paused').length})</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="flex gap-2 pt-3">
                  <button 
                    onClick={() => setFilter('all')}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
