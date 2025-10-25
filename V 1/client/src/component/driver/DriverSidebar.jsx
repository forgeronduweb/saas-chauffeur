export default function DriverSidebar({ activeTab, setActiveTab, availableOffers, myApplications, activeMissions, notifications, unreadMessagesCount = 0, onMessagesClick }) {
  const menuItems = [
    {
      id: 'available-offers',
      label: 'Offres disponibles',
      icon: (
        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      badge: availableOffers?.length || 0,
      badgeColor: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'my-applications',
      label: 'Mes candidatures',
      icon: (
        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: myApplications?.length || 0,
      badgeColor: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'missions',
      label: 'Mes missions',
      icon: (
        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badge: activeMissions?.length || 0,
      badgeColor: 'bg-green-100 text-green-600'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: unreadMessagesCount,
      badgeColor: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <aside className="fixed left-0 top-20 w-64 bg-white shadow-sm border-r border-gray-200 h-screen overflow-y-auto z-30">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'messages' && onMessagesClick) {
                  onMessagesClick();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === item.id 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
