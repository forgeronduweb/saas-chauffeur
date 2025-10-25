export default function ResponsiveGrid({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-4',
  className = ''
}) {
  const getGridCols = () => {
    const colClasses = [];
    
    if (cols.sm) colClasses.push(`grid-cols-${cols.sm}`);
    if (cols.md) colClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colClasses.push(`xl:grid-cols-${cols.xl}`);
    
    return colClasses.join(' ');
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les cartes responsives
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'p-4 lg:p-6',
  shadow = 'shadow-sm hover:shadow-md',
  ...props 
}) {
  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 
        ${shadow} ${padding} 
        transition-shadow duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Composant pour les listes responsives
export function ResponsiveList({ 
  children, 
  className = '',
  spacing = 'space-y-3 lg:space-y-4'
}) {
  return (
    <div className={`${spacing} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les éléments de liste responsifs
export function ResponsiveListItem({ 
  children, 
  className = '',
  padding = 'p-3 lg:p-4',
  ...props 
}) {
  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        hover:shadow-md transition-shadow duration-200
        ${padding} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
