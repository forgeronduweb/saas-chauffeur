import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { offersApi } from '../../services/api';
import SimpleHeader from '../../component/common/SimpleHeader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Eye, MessageCircle, MoreVertical, Power, Edit3, Trash2, Plus, Package, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      await fetchProducts();
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

  const stats = {
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalMessages: products.reduce((sum, p) => sum + (p.messagesCount || 0), 0),
    activeCount: products.filter(p => p.status === 'active').length,
    pausedCount: products.filter(p => p.status === 'paused').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader hideSubNav={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-base lg:text-lg text-gray-900">Mes offres marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos produits et services en vente</p>
        </div>

        {/* Data Table */}
        {products.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Annonce</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Vues</TableHead>
                    <TableHead className="text-center">Messages</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {product.mainImage ? (
                              <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 truncate">{product.title}</p>
                            <p className="text-xs text-gray-500">{product.location?.city || 'Non spécifié'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{(Number(product.conditions?.salary || product.price) || 0).toLocaleString()}</span>
                        <span className="text-gray-500 text-xs ml-1">FCFA</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'success' : 'secondary'}>
                          {product.status === 'active' ? 'Active' : 'En pause'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{product.views || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{product.messagesCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(product.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
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
                              {product.status === 'active' ? 'Mettre en pause' : 'Activer'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteModal(product)}
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
