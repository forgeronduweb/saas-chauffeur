import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, sold

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Récupération des offres...');
      console.log('👤 Utilisateur:', user);
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
      
      // Récupérer les offres de l'utilisateur connecté de type "Autre" (produits)
      const response = await offersApi.myOffers();
      console.log('✅ Réponse API:', response);
      console.log('📊 Données reçues:', response.data);
      
      // Filtrer uniquement les offres de type "Autre" (produits marketing)
      const allOffers = Array.isArray(response.data) ? response.data : [];
      console.log('📋 Total offres:', allOffers.length);
      console.log('📋 Types d\'offres:', allOffers.map(o => ({ title: o.title, type: o.type })));
      
      const marketingOffers = allOffers.filter(offer => offer.type === 'Autre');
      console.log('🛒 Offres marketing filtrées:', marketingOffers.length);
      console.log('🛒 Détails:', marketingOffers);
      
      setProducts(marketingOffers);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits:', error);
      console.error('❌ Détails:', error.response?.data);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.status === filter);

  const handleDelete = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      await offersApi.delete(offerId);
      console.log('✅ Offre supprimée');
      // Rafraîchir la liste
      fetchProducts();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'offre');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">Mes offres marketing</h1>
          <p className="text-gray-600 text-sm">Gérez vos produits et services publiés</p>
        </div>

        {/* Liste des produits */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg text-gray-900 mb-2">Aucune offre marketing</h3>
            <p className="text-gray-600 mb-4">Vous n'avez pas encore publié de produits ou services.</p>
            <button
              onClick={() => navigate('/publier-offre?type=product')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première offre
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg border border-gray-200 transition-all overflow-hidden group"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 relative overflow-hidden">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {product.status === 'active' ? 'Active' : 'Vendue'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-3">
                  <div className="mb-2">
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors font-medium flex-1">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <span className="text-base text-orange-600 font-bold whitespace-nowrap">
                        {parseInt(product.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-600">F</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{product.location?.city || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(product.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => navigate(`/produit/${product._id}`)}
                      className="flex-1 px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-xs font-medium"
                    >
                      Voir
                    </button>
                    <button 
                      onClick={() => navigate(`/edit-offer/${product._id}`)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-medium"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
