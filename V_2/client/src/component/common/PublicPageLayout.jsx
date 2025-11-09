import PublicHeader from './PublicHeader';
import SubNavigation from './SubNavigation';

export default function PublicPageLayout({ children, activeTab = '' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header public */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <PublicHeader />
        
        {/* Sous-menu */}
        <SubNavigation activeTab={activeTab} />
      </header>

      {/* Contenu de la page */}
      {children}
    </div>
  );
}
