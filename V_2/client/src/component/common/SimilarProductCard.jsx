import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';

export default function SimilarProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <Link to={`/produit/${product._id}`} className="block">
        {/* Image */}
        <div className="h-40 bg-gray-100 relative">
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
          {product.category && (
            <span className="absolute top-2 left-2 bg-white/90 text-gray-900 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-gray-900 font-medium text-sm line-clamp-2 h-10">
            {product.title}
          </h3>
          
          <div className="mt-2 flex items-center gap-1 text-yellow-400">
            <FaStar className="w-3.5 h-3.5" />
            <span className="text-xs text-gray-600">
              {product.rating?.toFixed(1) || 'Nouveau'}
            </span>
          </div>
          
          <div className="mt-2 flex items-center gap-1 text-gray-500 text-xs">
            <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {product.location?.city || product.location || 'Non spécifié'}
            </span>
          </div>
          
          <p className="mt-2 text-orange-500 text-sm font-medium">
            {product.price ? `${product.price.toLocaleString()} FCFA` : 'Prix sur demande'}
          </p>
        </div>
      </Link>
    </div>
  );
}
