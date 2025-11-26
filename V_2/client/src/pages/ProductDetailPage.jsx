import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi, messagesApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ImageModal from '../component/common/ImageModal';
import ProductCard from '../component/common/ProductCard';
import api from '../services/api';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contacting, setContacting] = useState(false);
  const similarProductsRef = useRef(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Vérifier si l'utilisateur est le propriétaire de l'offre
  const isOwner = user && product && product.employerId === user.sub;

  // Fonctions pour la modal de suppression
  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setDeleteLoading(false);
  };

  const handleDelete = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);
    try {
      await offersApi.delete(id);
      // Rediriger vers la page des offres marketing
      navigate(user.role === 'driver' ? '/driver/my-products' : '/employer/my-products');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'offre');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Récupérer le produit depuis l'API
  // Charger le produit et les produits similaires
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Chargement du produit avec ID:', id);
        const response = await offersApi.getById(id);
        console.log('Réponse du produit:', response);
        setProduct(response.data);
        
        // Charger les produits similaires après avoir chargé le produit
        if (response.data) {
          console.log('Données du produit chargées, catégorie:', response.data.category);
          fetchSimilarProducts(response.data.category, response.data._id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Impossible de charger les détails du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fonction pour charger les produits similaires
  const fetchSimilarProducts = async (category, currentProductId) => {
    try {
      setLoadingSimilar(true);
      console.log('Chargement des produits similaires pour la catégorie:', category);
      
      // D'abord, on récupère le type du produit actuel
      const productResponse = await offersApi.getById(currentProductId);
      const productType = productResponse.data.type; // 'marketing', 'vehicules', etc.
      
      // On charge jusqu'à 8 produits similaires du même type et de la même catégorie
      const response = await offersApi.list({
        type: productType,
        category,
        limit: 8, // On charge jusqu'à 8 produits
        excludeId: currentProductId,
        sort: '-createdAt',
        status: 'active' // On ne montre que les produits actifs
      });
      
      console.log('Réponse des produits similaires:', response);
      
      // Extraire le tableau des offres de la réponse
      const products = response.data?.offers || response.data || [];
      setSimilarProducts(products);
      console.log('Produits similaires chargés:', products);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
          <Link to="/marketing-vente" className="text-gray-600 hover:text-gray-900">
            Retour à la marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SimpleHeader activeTab="marketing" />

      {/* Contenu - Style fiche produit */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Images */}
          <div>
            {/* Image principale */}
            <div className="relative h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              
              {/* Badge catégorie */}
              {product.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-sm rounded shadow-sm">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Navigation images si plusieurs */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Miniatures */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-24 bg-gray-100 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-gray-900' : ''
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colonne droite - Informations */}
          <div>
            {/* En-tête */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-base sm:text-2xl lg:text-3xl text-gray-900 flex-1">
                  {product.title}
                </h1>
                
                {/* Boutons d'action si propriétaire */}
                {isOwner && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/edit-offer/${product._id}`)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={openDeleteModal}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl text-orange-500 mb-4">
                {product.price ? `${product.price.toLocaleString()} FCFA` : 'Prix sur demande'}
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>{product.location?.city || product.location || 'Non spécifié'}</span>
                  <span className="mx-2">•</span>
                  <span className="text-xs text-gray-500">
                    Publié le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {(product.condition || product.category || product.type) && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {product.condition || product.category || product.type}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-base lg:text-lg text-gray-900 mb-4">Description</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-base lg:text-lg text-gray-900 mb-4">Contact</h2>
              {(product.employer || product.employerId) && (
                <p className="text-xs lg:text-lg text-gray-600 mb-4">
                  <span className="font-medium">Vendeur:</span> {(product.employer?.firstName || product.employerId?.firstName)} {(product.employer?.lastName || product.employerId?.lastName)}
                  {(product.employer?.companyName || product.employerId?.companyName) && ` (${product.employer?.companyName || product.employerId?.companyName})`}
                </p>
              )}
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      try {
                        setContacting(true);
                        const employerId = product.employerId?._id || product.employerId;
                        console.log('📤 Création/récupération de la conversation pour le produit:', {
                          productId: product._id,
                          productTitle: product.title,
                          employerId: employerId
                        });
                        
                        const response = await messagesApi.createOrGetConversation(
                          employerId,
                          { type: 'product_inquiry', offerId: product._id }
                        );
                        
                        console.log('📨 Réponse complète:', response.data);
                        console.log('💬 Messages reçus:', response.data.messages);
                        console.log('📊 Nombre de messages:', response.data.messages?.length || 0);
                        
                        const conversationId = response.data.conversation._id;
                        console.log('✅ Conversation prête:', conversationId);
                        
                        // Attendre un peu pour s'assurer que tout est sauvegardé
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // Ouvrir la messagerie avec cette conversation
                        console.log('🚀 Dispatch événement openMessaging avec conversationId:', conversationId);
                        window.dispatchEvent(new CustomEvent('openMessaging', {
                          detail: { conversationId }
                        }));
                      } catch (error) {
                        console.error('❌ Erreur complète:', error);
                        console.error('📋 Détails:', error.response?.data || error.message);
                        alert('Erreur lors de l\'ouverture de la conversation');
                      } finally {
                        setContacting(false);
                      }
                    }}
                    disabled={contacting}
                    className="block w-full py-3 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {contacting ? 'Ouverture...' : 'Envoyer un message'}
                  </button>
                  
                  <button
                    onClick={() => {
                      // TODO: Implémenter la logique de signalement
                      alert('Fonctionnalité de signalement à venir');
                    }}
                    className="block w-full py-2 border border-orange-500 text-orange-500 bg-white hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Signaler cette annonce
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="block w-full py-3 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Contacter le vendeur
                  </Link>
                  <p className="text-xs lg:text-sm text-gray-500 text-center mt-2">
                    Créez un compte gratuit pour contacter le vendeur
                  </p>
                </>
              )}
            </div>

            {/* Caractéristiques */}
            {product.requirementsList && product.requirementsList.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-base lg:text-lg text-gray-900 mb-4">Caractéristiques</h2>
                <ul className="grid grid-cols-1 gap-2">
                  {product.requirementsList.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Avantages */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-base lg:text-lg text-gray-900 mb-4">Avantages</h2>
                <ul className="grid grid-cols-1 gap-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm sm:text-base text-gray-700">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Section Articles similaires */}
      {!loading && similarProducts && similarProducts.length > 0 && (
        <section className="bg-white py-8 px-4 sm:px-6 lg:px-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg lg:text-2xl font-normal text-gray-900">
                Articles similaires
              </h2>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  similarProductsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-orange-500 hover:text-orange-600 transition-all duration-200"
                aria-label="Précédent"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              
              <div 
                ref={similarProductsRef}
                className="grid grid-flow-col auto-cols-[calc(50%-0.375rem)] sm:auto-cols-[calc(33.333%-0.5rem)] lg:auto-cols-[calc(25%-0.75rem)] gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollPadding: '0 1rem',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}
              >
                {similarProducts.map((product) => (
                  <div key={product._id} className="w-full" style={{ scrollSnapAlign: 'start' }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  similarProductsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-orange-500 hover:text-orange-600 transition-all duration-200"
                aria-label="Suivant"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modal d'agrandissement d'image */}
      {showImageModal && (
        <ImageModal
          imageUrl={product.images[currentImageIndex]}
          alt={product.name}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        subtitle="Cette action est définitive"
        message={`Êtes-vous certain de vouloir supprimer le produit "${product?.title}" ? Cette action supprimera définitivement le produit.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
