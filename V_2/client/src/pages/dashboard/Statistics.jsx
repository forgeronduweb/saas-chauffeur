import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi, promotionsApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import { Eye, MessageCircle, TrendingUp, Users, Calendar, BarChart3, PieChart, Activity, Zap, Star, Clock, DollarSign, Filter } from 'lucide-react';

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Déterminer la route MyProducts selon le rôle
  const getMyProductsRoute = () => {
    return user?.role === 'driver' ? '/driver/my-products' : '/employer/my-products';
  };
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 jours
  const [filter, setFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [userBoosts, setUserBoosts] = useState([]);
  
  // Hook pour les messages non lus
  const { unreadCount } = useUnreadMessages();
  
  // Déterminer quelle page est active
  const currentPage = 'statistics';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
    fetchUserBoosts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await offersApi.myOffers();
      const allOffers = Array.isArray(response.data) ? response.data : [];
      const marketingOffers = allOffers.filter(offer => offer.type === 'Autre');
      setProducts(marketingOffers);
    } catch (error) {
      console.error('Erreur:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBoosts = async () => {
    try {
      const response = await promotionsApi.getMyBoosts();
      if (response.data.success) {
        setUserBoosts(response.data.data.promotions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des boosts:', error);
      setUserBoosts([]);
    }
  };

  const getProductBoost = (productId) => {
    return userBoosts.find(boost => 
      boost.offerId._id === productId && 
      boost.isActive
    );
  };

  // Calculs statistiques
  const totalViews = products.length * 23;
  const totalMessages = products.length * 5;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const conversionRate = totalMessages > 0 ? ((totalMessages * 0.12) / totalMessages * 100).toFixed(1) : 0;
  const avgPrice = products.length > 0 ? Math.floor(products.reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0) / products.length) : 0;

  // Données pour les graphiques (simulées)
  const viewsData = [
    { day: 'Lun', views: 45 },
    { day: 'Mar', views: 52 },
    { day: 'Mer', views: 38 },
    { day: 'Jeu', views: 61 },
    { day: 'Ven', views: 55 },
    { day: 'Sam', views: 67 },
    { day: 'Dim', views: 43 }
  ];

  const categoryData = [
    { name: 'Véhicules', value: 40, color: 'bg-blue-500' },
    { name: 'Services', value: 30, color: 'bg-green-500' },
    { name: 'Pièces', value: 20, color: 'bg-yellow-500' },
    { name: 'Autres', value: 10, color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader hideSubNav={true} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />
      
      <div className="max-w-[1600px] mx-auto px-4 lg:px-16 py-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl text-gray-900">Mes offres marketing</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Statistiques détaillées de vos offres</p>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-gray-900 mb-4">Tableau de bord</h3>
              
              {/* Menu de navigation */}
              <div className="space-y-2">
                {/* Tous les articles */}
                <button
                  onClick={() => {setFilter('all'); navigate(getMyProductsRoute());}}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    filter === 'all' 
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

                {/* Articles actifs */}
                <button
                  onClick={() => {setFilter('active'); navigate(getMyProductsRoute());}}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    filter === 'active' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Articles actifs</p>
                        <p className="text-xs text-gray-600">Offres en ligne</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Articles premium */}
                <button
                  onClick={() => {setFilter('premium'); navigate(getMyProductsRoute());}}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    filter === 'premium' 
                      ? 'bg-purple-50 border border-purple-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Articles premium</p>
                        <p className="text-xs text-gray-600">Offres boostées</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Articles simples */}
                <button
                  onClick={() => {setFilter('simple'); navigate(getMyProductsRoute());}}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    filter === 'simple' 
                      ? 'bg-orange-50 border border-orange-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Articles simples</p>
                        <p className="text-xs text-gray-600">Offres standards</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Mes revenus */}
                <button
                  onClick={() => navigate('/dashboard/earnings')}
                  className="w-full p-3 rounded-lg bg-white hover:bg-green-50 transition-colors text-left"
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
                  onClick={() => navigate('/dashboard/statistics')}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    currentPage === 'statistics' 
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
                    onClick={() => navigate('/messages')}
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

          {/* Main Content */}
          <div className="flex-1">

        {/* Métriques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{totalMessages}</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{conversionRate}%</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{activeProducts}</p>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">sur {products.length} total</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Graphique des vues */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg text-gray-900">Vues par jour</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {viewsData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-8">{item.day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.views / 70) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-8">{item.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par catégorie */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg text-gray-900">Répartition par catégorie</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau des performances */}
        <div className="bg-white rounded-lg border border-gray-200 mt-6 lg:mt-8">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
            <h3 className="text-base lg:text-lg text-gray-900">Performances par offre</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vues</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 5).map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-xs lg:text-sm text-gray-900">{product.title || 'Offre sans titre'}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{product.category || 'Autre'}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                      {Math.floor(Math.random() * 50) + 10}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                      {Math.floor(Math.random() * 8) + 1}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                      {(Math.random() * 20 + 5).toFixed(1)}%
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
