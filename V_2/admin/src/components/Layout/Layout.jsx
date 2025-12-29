import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '../AppSidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar'

const pageTitles = {
  '/dashboard': 'Tableau de bord',
  '/drivers': 'Chauffeurs',
  '/employers': 'Employeurs',
  '/offers': 'Offres',
  '/applications': 'Candidatures',
  '/missions': 'Missions',
  '/products': 'Produits',
  '/banners': 'Marketing & Boost',
  '/reports': 'Signalements',
  '/notifications': 'Notifications',
  '/settings': 'Paramètres',
  '/drivers-validation': 'Validation',
}

const Layout = () => {
  const location = useLocation()
  
  const getPageTitle = () => {
    const path = location.pathname
    if (pageTitles[path]) return pageTitles[path]
    if (path.startsWith('/drivers/')) return 'Détails chauffeur'
    if (path.startsWith('/employers/')) return 'Détails employeur'
    if (path.startsWith('/offers/')) return 'Détails offre'
    if (path.startsWith('/applications/')) return 'Détails candidature'
    return 'Administration'
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-sidebar-border bg-white px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-900">{getPageTitle()}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <div className="animate-fadeIn">
              <Outlet />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout
