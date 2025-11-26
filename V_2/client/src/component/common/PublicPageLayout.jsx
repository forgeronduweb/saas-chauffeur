import SimpleHeader from './SimpleHeader';

export default function PublicPageLayout({ children, activeTab = '' }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader activeTab={activeTab} />
      
      {/* Contenu de la page */}
      <main className="min-h-[calc(100vh-200px)]">
        {children}
      </main>
    </div>
  );
}
