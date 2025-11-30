import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi, promotionsApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import { DollarSign, TrendingUp, Calendar, PieChart, BarChart3, Target, Wallet, Eye, MessageCircle, Zap, Star, Clock } from 'lucide-react';

export default function Earnings() {
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
  const [userBoosts, setUserBoosts] = useState([]);
  
  // Hook pour les messages non lus
  const { unreadCount } = useUnreadMessages();
  
  // Déterminer quelle page est active
  const currentPage = 'earnings';

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

  // Calculs des revenus
  const totalPotentialEarnings = products.reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0);
  const activeEarnings = products.filter(p => p.status === 'active').reduce((sum, p) => sum + (Number(p.conditions?.salary || p.price) || 0), 0);
  const avgEarningsPerProduct = products.length > 0 ? Math.floor(totalPotentialEarnings / products.length) : 0;
  const estimatedMonthlyEarnings = Math.floor(activeEarnings * 0.12); // 12% de taux de conversion estimé

  // Données pour les graphiques (simulées)
  const monthlyData = [
    { month: 'Jan', earnings: 45000 },
    { month: 'Fév', earnings: 52000 },
    { month: 'Mar', earnings: 48000 },
    { month: 'Avr', earnings: 61000 },
    { month: 'Mai', earnings: 55000 },
    { month: 'Juin', earnings: 67000 }
  ];

  const categoryEarnings = [
    { name: 'Véhicules', amount: totalPotentialEarnings * 0.4, color: 'bg-blue-500' },
    { name: 'Services', amount: totalPotentialEarnings * 0.3, color: 'bg-green-500' },
    { name: 'Pièces', amount: totalPotentialEarnings * 0.2, color: 'bg-yellow-500' },
    { name: 'Autres', amount: totalPotentialEarnings * 0.1, color: 'bg-purple-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SimpleHeader hideSubNav={true} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des revenus...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl text-gray-900">Mes offres marketing</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Revenus détaillés de vos offres</p>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm lg:text-base"
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
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    currentPage === 'earnings' 
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
                  onClick={() => navigate('/dashboard/statistics')}
                  className="w-full p-3 rounded-lg transition-colors text-left bg-white hover:bg-gray-50"
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
                <p className="text-xs lg:text-sm text-gray-600">Revenus potentiels</p>
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{totalPotentialEarnings.toLocaleString()} F</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{activeEarnings.toLocaleString()} F</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{estimatedMonthlyEarnings.toLocaleString()} F</p>
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
                <p className="text-2xl lg:text-3xl text-gray-900 mt-1">{avgEarningsPerProduct.toLocaleString()} F</p>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">Prix moyen</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Évolution mensuelle */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg text-gray-900">Évolution des revenus</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {monthlyData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-8">{item.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(item.earnings / 70000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-16 text-right">{(item.earnings / 1000).toFixed(0)}k F</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par catégorie */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg text-gray-900">Revenus par catégorie</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {categoryEarnings.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-900">{item.amount.toLocaleString()} F</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau des offres les plus rentables */}
        <div className="bg-white rounded-lg border border-gray-200 mt-6 lg:mt-8">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
            <h3 className="text-base lg:text-lg text-gray-900">Offres les plus rentables</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus estimés</th>
                  <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products
                  .sort((a, b) => (Number(b.conditions?.salary || b.price) || 0) - (Number(a.conditions?.salary || a.price) || 0))
                  .slice(0, 5)
                  .map((product, index) => {
                    const price = Number(product.conditions?.salary || product.price) || 0;
                    const messages = Math.floor(Math.random() * 8) + 1;
                    const estimatedEarnings = Math.floor(price * 0.12);
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="text-xs lg:text-sm text-gray-900">{product.title || 'Offre sans titre'}</div>
                          <div className="text-xs lg:text-sm text-gray-500">{product.category || 'Autre'}</div>
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                          {price.toLocaleString()} F
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                          {messages}
                        </td>
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-green-600">
                          {estimatedEarnings.toLocaleString()} F
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
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conseils pour optimiser les revenus */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4 lg:p-6 mt-6 lg:mt-8">
          <h3 className="text-base lg:text-lg text-gray-900 mb-3 lg:mb-4">💡 Conseils pour optimiser vos revenus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Boostez vos offres les plus demandées</p>
                <p className="text-xs text-gray-600">Augmentez la visibilité de vos meilleures offres</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Optimisez vos prix</p>
                <p className="text-xs text-gray-600">Ajustez vos tarifs selon la demande du marché</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Répondez rapidement aux messages</p>
                <p className="text-xs text-gray-600">Un taux de réponse élevé améliore vos conversions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Diversifiez vos offres</p>
                <p className="text-xs text-gray-600">Explorez de nouvelles catégories rentables</p>
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
