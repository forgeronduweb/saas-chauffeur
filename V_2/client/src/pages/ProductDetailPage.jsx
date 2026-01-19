import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { offersApi, messagesApi, reviewsApi } from '../services/api';
import SimpleHeader from '../component/common/SimpleHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ImageModal from '../component/common/ImageModal';
import ProductCard from '../component/common/ProductCard';
import { 
  FaChevronLeft, FaChevronRight, FaCar, FaCalendarAlt, FaTachometerAlt, 
  FaGasPump, FaCheckCircle, FaCogs, FaShieldAlt, FaWrench, FaFileAlt, 
  FaPuzzlePiece, FaLink, FaBarcode, FaCertificate, FaCube, FaChartLine,
  FaTools, FaUserTie, FaBullseye, FaClock, FaAward, FaHandshake, FaHourglass,
  FaStar, FaRegStar, FaUser
} from 'react-icons/fa';

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
  const [showImageModal, setShowImageModal] = useState(false);
  const similarProductsRef = useRef(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // États pour les commentaires et notation
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fonction pour obtenir l'icône appropriée selon la caractéristique
  const getCharacteristicIcon = (characteristic) => {
    const text = characteristic.toLowerCase();
    
    // Véhicules
    if (text.includes('type') && (text.includes('berline') || text.includes('suv') || text.includes('véhicule'))) return FaCar;
    if (text.includes('année') || text.includes('annee')) return FaCalendarAlt;
    if (text.includes('km') || text.includes('kilom')) return FaTachometerAlt;
    if (text.includes('motorisation') || text.includes('essence') || text.includes('diesel')) return FaGasPump;
    if (text.includes('état') || text.includes('etat') || text.includes('excellent') || text.includes('bon')) return FaCheckCircle;
    if (text.includes('options') || text.includes('climatisation') || text.includes('gps')) return FaCogs;
    if (text.includes('sécurité') || text.includes('securite') || text.includes('abs') || text.includes('airbag')) return FaShieldAlt;
    if (text.includes('entretien') || text.includes('révision') || text.includes('revision')) return FaWrench;
    if (text.includes('documents') || text.includes('carte grise') || text.includes('contrôle')) return FaFileAlt;
    
    // Pièces
    if (text.includes('type') && (text.includes('pneus') || text.includes('batterie') || text.includes('filtre'))) return FaPuzzlePiece;
    if (text.includes('compatibilité') || text.includes('compatibilite') || text.includes('toyota') || text.includes('compatible')) return FaLink;
    if (text.includes('référence') || text.includes('reference')) return FaBarcode;
    if (text.includes('garantie')) return FaCertificate;
    if (text.includes('matériau') || text.includes('materiau') || text.includes('acier') || text.includes('plastique')) return FaCube;
    if (text.includes('performance') || text.includes('haute performance')) return FaChartLine;
    if (text.includes('installation')) return FaTools;
    
    // Services
    if (text.includes('type') && (text.includes('réparation') || text.includes('reparation') || text.includes('maintenance'))) return FaTools;
    if (text.includes('domaine') || text.includes('mécanique') || text.includes('mecanique')) return FaBullseye;
    if (text.includes('expertise') || text.includes('expérience') || text.includes('experience')) return FaUserTie;
    if (text.includes('disponibilité') || text.includes('disponibilite') || text.includes('24h')) return FaClock;
    if (text.includes('qualité') || text.includes('qualite') || text.includes('certifié') || text.includes('certifie')) return FaAward;
    if (text.includes('délais') || text.includes('delais') || text.includes('intervention')) return FaHourglass;
    
    // Par défaut, retourner l'icône de check
    return FaCheckCircle;
  };

  // Vérifier si l'utilisateur est le propriétaire de l'offre
  const ownerUserId = product && (product.employerId?._id || product.employerId);
  const isOwner =
    !!user &&
    !!product &&
    !!ownerUserId &&
    (ownerUserId === user.sub || ownerUserId === user._id);

  // Fonctions pour la modal de suppression
  const openDeleteModal = () => setShowDeleteModal(true);

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
      navigate(user.role === 'driver' ? '/driver/my-products' : '/employer/my-products');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'offre');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonctions pour les commentaires et notation
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userRating || submittingComment) return;
    
    setSubmittingComment(true);
    try {
      const reviewData = {
        productId: id,
        rating: userRating,
        comment: newComment.trim()
      };

      const response = await reviewsApi.create(reviewData);
      
      if (response.data.success) {
        // Recharger les commentaires pour avoir les données à jour
        await loadComments();
        setNewComment('');
        setUserRating(0);
        alert('Avis ajouté avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 400 && error.response?.data?.message?.includes('déjà laissé')) {
        alert('Vous avez déjà laissé un avis pour ce produit');
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Erreur lors de l\'ajout de l\'avis');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive ? 
        (hoverRating >= starValue || (!hoverRating && rating >= starValue)) :
        rating >= starValue;
      
      return (
        <button
          key={index}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onStarClick && onStarClick(starValue)}
          onMouseEnter={() => interactive && onStarHover && onStarHover(starValue)}
          onMouseLeave={() => interactive && onStarHover && onStarHover(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-all`}
        >
          {isFilled ? (
            <FaStar className="w-5 h-5 text-yellow-400" />
          ) : (
            <FaRegStar className="w-5 h-5 text-gray-300" />
          )}
        </button>
      );
    });
  };

  // Fonction pour charger les commentaires
  const loadComments = async () => {
    if (!id) return;
    
    setLoadingComments(true);
    try {
      const response = await reviewsApi.getByProduct(id);
      
      if (response.data.success) {
        // Transformer les données pour correspondre au format attendu par l'interface
        const transformedComments = response.data.data.reviews.map(review => ({
          id: review._id,
          user: review.userId ? 
            `${review.userId.firstName || ''} ${review.userId.lastName || ''}`.trim() || 'Utilisateur' : 
            'Utilisateur',
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.createdAt).toLocaleDateString('fr-FR')
        }));
        
        setComments(transformedComments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      // Ne pas afficher d'erreur à l'utilisateur pour le chargement des commentaires
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Charger le produit et les produits similaires
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await offersApi.getById(id);
        setProduct(response.data);
        if (response.data) {
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
    loadComments();
  }, [id]);

  // Fonction pour charger les produits similaires
  const fetchSimilarProducts = async (category, currentProductId) => {
    try {
      setLoadingSimilar(true);
      const productResponse = await offersApi.getById(currentProductId);
      const productType = productResponse.data.type;
      
      const response = await offersApi.list({
        type: productType,
        category,
        limit: 8,
        excludeId: currentProductId,
        sort: '-createdAt',
        status: 'active'
      });
      
      const products = response.data?.offers || response.data || [];
      setSimilarProducts(products);
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
          <h2 className="text-xl text-gray-900 mb-4">Produit non trouvé</h2>
          <Link to="/marketing-vente" className="text-orange-500 hover:text-orange-600">
            Retour à la marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader activeTab="marketing" />

      <main className="max-w-[1600px] mx-auto px-4 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Images */}
          <div>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-auto max-h-[500px] object-contain cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />
              
              {product.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-sm rounded shadow-sm">
                    {product.category}
                  </span>
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => (prev + 1) % product.images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-24 bg-gray-100 rounded-lg overflow-hidden ${
                      index === currentImageIndex ? 'ring-2 ring-orange-500' : ''
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
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="pr-4">
                  <h1 className="section-title text-xl sm:text-2xl text-gray-900 mb-3">{product.title}</h1>
                  {product.category && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {product.category}
                    </span>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2">
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

              <p className="text-2xl text-orange-500 mb-4">
                {product.price ? `${product.price.toLocaleString()} FCFA` : 'Prix sur demande'}
              </p>

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>{product.location?.city || product.location || 'Non spécifié'}</span>
                </div>
                <span>•</span>
                <span className="text-gray-500">
                  Publié le {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                </span>
                {product.condition && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs border border-black/10">
                      {product.condition}
                    </span>
                  </>
                )}
              </div>

              {/* Section Vendeur */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-black/10">
                <h3 className="section-title text-gray-900 mb-4">Vendeur</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-800">
                      {product.employer?.firstName || product.employerId?.firstName} {product.employer?.lastName || product.employerId?.lastName}
                    </p>
                    {product.employer?.companyName || product.employerId?.companyName ? (
                      <p className="text-sm text-gray-500">
                        {product.employer?.companyName || product.employerId?.companyName}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  {/* Cas 1: Non connecté - Afficher lien de connexion */}
                  {!user && (
                    <>
                      <Link
                        to="/auth"
                        className="block w-full py-2.5 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors mb-2"
                      >
                        Se connecter pour contacter
                      </Link>
                      <p className="text-xs text-gray-500 text-center">
                        Créez un compte pour discuter avec le vendeur
                      </p>
                    </>
                  )}

                  {/* Cas 2: Connecté ET pas propriétaire - Afficher boutons contact et signaler */}
                  {user && !isOwner && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <button
                        onClick={async () => {
                          try {
                            setContacting(true);
                            const employerId = ownerUserId;
                            const response = await messagesApi.createOrGetConversation(
                              employerId,
                              { type: 'product_inquiry', offerId: product._id }
                            );
                            const conversationId = response.data.conversation._id;
                            window.dispatchEvent(new CustomEvent('openMessaging', {
                              detail: { conversationId }
                            }));
                          } catch (error) {
                            console.error('Erreur:', error);
                            alert('Erreur lors de l\'ouverture de la conversation');
                          } finally {
                            setContacting(false);
                          }
                        }}
                        disabled={contacting}
                        className="w-full py-2.5 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                      >
                        {contacting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Ouverture...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>Contacter le vendeur</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full py-2.5 px-4 bg-white border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Signaler l'annonce</span>
                      </button>
                    </div>
                  )}

                  {/* Cas 3: Connecté ET propriétaire - Rien à afficher ici (boutons modifier/supprimer sont en haut) */}
                </div>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="section-title text-gray-900 mb-4">Description</h3>
                  <div className="prose max-w-none text-gray-700">
                    {product.description}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Blocs Caractéristiques et Avantages centrés */}
        {(product.requirementsList?.length > 0 || product.benefits?.length > 0) && (
          <div className="mt-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {product.requirementsList?.length > 0 && (
                <div className="bg-white p-5 rounded-lg border-2 border-orange-500">
                  <h3 className="section-title text-gray-900 mb-4">Caractéristiques</h3>
                  <ul className="space-y-2">
                    {product.requirementsList.map((item, index) => {
                      const IconComponent = getCharacteristicIcon(item);
                      // Extraire le titre (avant les deux points) et la valeur (après les deux points)
                      const [title, ...valueParts] = item.split(':');
                      const value = valueParts.join(':').trim();
                      
                      return (
                        <li key={index} className="flex items-start">
                          <div className="flex items-start w-full">
                            <div className="flex items-center w-32 flex-shrink-0">
                              <IconComponent className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                              <span className="text-gray-800">{title.trim()}</span>
                            </div>
                            {value && (
                              <div className="text-gray-700 font-normal ml-4">
                                : {value}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {product.benefits?.length > 0 && (
                <div className="bg-white p-5 rounded-lg border border-black/10">
                  <h3 className="section-title text-gray-900 mb-4">Avantages</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-gray-700 font-normal">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Commentaires et Notation */}
        <div className="mt-12 mb-12">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="section-title text-gray-900 mb-6">Avis et Commentaires</h2>
            
            {/* Message pour les non-connectés */}
            {!user && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-700 mb-2">Vous souhaitez laisser un avis ?</p>
                <Link
                  to="/auth"
                  className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Connectez-vous pour donner votre avis
                </Link>
              </div>
            )}

            {/* Formulaire d'ajout de commentaire */}
            {user && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg text-gray-900 mb-4">Laisser un avis</h3>
                
                {/* Notation par étoiles */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Votre note
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars(
                      userRating, 
                      true, 
                      setUserRating, 
                      setHoverRating
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {userRating > 0 ? `${userRating}/5` : 'Cliquez pour noter'}
                    </span>
                  </div>
                </div>

                {/* Zone de commentaire */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">
                    Votre commentaire
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Partagez votre expérience avec ce produit..."
                  />
                </div>

                {/* Bouton de soumission */}
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || !userRating || submittingComment}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingComment ? 'Publication...' : 'Publier l\'avis'}
                </button>
              </div>
            )}

            {/* Liste des commentaires */}
            <div className="space-y-4">
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                  <p className="text-gray-500">Chargement des avis...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <p className="text-gray-900 mb-1">Aucun avis pour le moment</p>
                  <p className="text-sm text-gray-600">Soyez le premier à laisser un commentaire !</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <FaUser className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900">{comment.user}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(comment.rating)}
                            </div>
                            <span className="text-sm text-gray-500">{comment.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-11">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title text-gray-900 mb-4">Produits similaires</h2>
            <div className="relative">
              <div 
                ref={similarProductsRef}
                className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {similarProducts.map((item) => (
                  <div key={item._id} className="flex-shrink-0 w-64 sm:w-72 lg:w-80" style={{ scrollSnapAlign: 'start' }}>
                    <ProductCard product={item} noShadow noBorder />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  similarProductsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-lg text-orange-500 hover:text-orange-600 transition-colors"
              >
                <FaChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  similarProductsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-lg text-orange-500 hover:text-orange-600 transition-colors"
              >
                <FaChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {showImageModal && (
        <ImageModal
          imageUrl={product.images[currentImageIndex]}
          alt={product.name}
          onClose={() => setShowImageModal(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous certain de vouloir supprimer le produit "${product.title}" ? Cette action est irréversible.`}
        confirmText={deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
        cancelText="Annuler"
        confirmButtonVariant="danger"
        isConfirmLoading={deleteLoading}
      />
    </div>
  );
}