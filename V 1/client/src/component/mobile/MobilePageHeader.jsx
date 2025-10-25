export default function MobilePageHeader({ 
  title, 
  subtitle, 
  actions = null,
  className = '' 
}) {
  return (
    <div className={`mb-4 lg:mb-6 pt-4 lg:pt-0 ${className}`}>
      <div className="pl-4 lg:pl-0">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm lg:text-base text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="mt-4 pl-4 lg:pl-0">
          {actions}
        </div>
      )}
    </div>
  );
}

// Composant pour les titres de section
export function MobileSectionHeader({ 
  title, 
  subtitle, 
  badge,
  actions = null,
  className = '' 
}) {
  return (
    <div className={`mb-3 lg:mb-4 ${className}`}>
      <div className="flex items-center justify-between pl-4 lg:pl-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          {badge && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {badge}
            </span>
          )}
        </div>
        
        {actions && (
          <div className="pr-4 lg:pr-0">
            {actions}
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1 pl-4 lg:pl-0">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Composant pour les conteneurs de contenu avec espacement mobile
export function MobileContentContainer({ 
  children, 
  className = '',
  noPadding = false 
}) {
  return (
    <div className={`
      ${noPadding ? '' : 'px-4 lg:px-0'}
      ${className}
    `}>
      {children}
    </div>
  );
}
