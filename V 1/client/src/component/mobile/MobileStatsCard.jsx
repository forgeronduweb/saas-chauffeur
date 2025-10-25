export default function MobileStatsCard({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  color = 'indigo',
  onClick 
}) {
  const getColorClasses = () => {
    const colors = {
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      red: 'bg-red-50 text-red-600 border-red-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100'
    };
    return colors[color] || colors.indigo;
  };

  const getChangeClasses = () => {
    const classes = {
      positive: 'text-green-600 bg-green-100',
      negative: 'text-red-600 bg-red-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return classes[changeType] || classes.neutral;
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    }
    if (changeType === 'negative') {
      return (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${getColorClasses()}
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-95' : ''}
      `}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className={`
          p-2 rounded-lg
          ${color === 'indigo' ? 'bg-indigo-100' : ''}
          ${color === 'green' ? 'bg-green-100' : ''}
          ${color === 'blue' ? 'bg-blue-100' : ''}
          ${color === 'yellow' ? 'bg-yellow-100' : ''}
          ${color === 'red' ? 'bg-red-100' : ''}
          ${color === 'purple' ? 'bg-purple-100' : ''}
        `}>
          <div className="h-5 w-5">
            {icon}
          </div>
        </div>

        {/* Change indicator */}
        {change && (
          <div className={`
            flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${getChangeClasses()}
          `}>
            {getChangeIcon()}
            <span className="ml-1">{change}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <div className="text-2xl lg:text-3xl font-bold text-gray-900">
          {value}
        </div>
      </div>

      {/* Title */}
      <div className="text-sm lg:text-base font-medium text-gray-600">
        {title}
      </div>
    </div>
  );
}

// Composant pour une grille de statistiques mobiles
export function MobileStatsGrid({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Aucune statistique disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat, index) => (
        <MobileStatsCard
          key={stat.id || index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          changeType={stat.changeType}
          color={stat.color}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}

// Hook pour formater les statistiques
export function useFormattedStats(rawStats) {
  if (!rawStats) return [];

  return [
    {
      id: 'offers',
      title: 'Offres actives',
      value: rawStats.activeOffers || 0,
      change: rawStats.offersChange || null,
      changeType: rawStats.offersChangeType || 'neutral',
      color: 'indigo',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'applications',
      title: 'Candidatures',
      value: rawStats.totalApplications || 0,
      change: rawStats.applicationsChange || null,
      changeType: rawStats.applicationsChangeType || 'neutral',
      color: 'green',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-3-3h-1m-1-3.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM3 20v-2a7 7 0 017-7h1m7 0a7 7 0 017 7v2" />
        </svg>
      )
    },
    {
      id: 'missions',
      title: 'Missions actives',
      value: rawStats.activeMissions || 0,
      change: rawStats.missionsChange || null,
      changeType: rawStats.missionsChangeType || 'neutral',
      color: 'blue',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'revenue',
      title: 'Revenus',
      value: rawStats.totalRevenue ? `${rawStats.totalRevenue} FCFA` : '0 FCFA',
      change: rawStats.revenueChange || null,
      changeType: rawStats.revenueChangeType || 'neutral',
      color: 'yellow',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];
}
