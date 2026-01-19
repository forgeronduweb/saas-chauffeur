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
      className="w-full bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col p-2 h-full"
      onClick={handleClick}
    >
      {/* Image grande */}
      <figure className="relative h-40 lg:h-48 bg-gray-100 overflow-hidden flex-shrink-0 rounded-md">
        <img 
          src={product.mainImage || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'} 
          alt={product.title || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
              </figure>

      {/* Contenu compact */}
      <div className="p-2 lg:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs lg:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.title || product.name}
          </h3>
          
          <p className="text-sm lg:text-lg font-bold text-gray-900 mb-2">
            {product.price ? `${(Number(product.price) || 0).toLocaleString()} FCFA` : 'Prix sur demande'}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-600 mt-auto">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          <span className="truncate">
            {product.location?.city || (typeof product.location === 'string' ? product.location.split(',')[0] : 'Non spécifié')}
          </span>
        </div>
      </div>
    </div>
  );
}
