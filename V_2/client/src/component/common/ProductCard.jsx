import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log('Clic sur produit:', product);
    console.log('ID du produit:', product._id);
    if (product._id) {
      navigate(`/produit/${product._id}`);
    } else {
      console.error('Produit sans ID:', product);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image grande */}
      <figure className="relative h-32 lg:h-48 bg-gray-100 overflow-hidden">
        <img 
          src={product.mainImage || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'} 
          alt={product.title || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badge catégorie sur l'image */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded shadow-sm">
            {product.category}
          </span>
        </div>
      </figure>

      {/* Contenu compact */}
      <div className="p-2 lg:p-4">
        <h3 className="text-xs lg:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.title || product.name}
        </h3>
        
        <p className="text-sm lg:text-lg font-bold text-gray-900 mb-2">
          {typeof product.price === 'number' ? `${product.price.toLocaleString()} FCFA` : product.price}
        </p>

        <div className="flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          <span className="truncate">
            {product.location?.city || (typeof product.location === 'string' ? product.location.split(',')[0] : 'Non spécifié')}
          </span>
        </div>
        
        <div className="mt-1">
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
            {product.condition}
          </span>
        </div>
      </div>
    </div>
  );
}
