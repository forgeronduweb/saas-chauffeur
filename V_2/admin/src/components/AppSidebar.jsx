import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Car,
  Briefcase,
  FileText,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ShoppingBag,
  UserCheck,
  Megaphone,
  AlertTriangle
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './ui/sidebar'

const menuItems = [
  {
    title: "Navigation",
    items: [
      { title: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Gestion",
    items: [
      { title: "Chauffeurs", path: "/drivers", icon: Car },
      { title: "Employeurs", path: "/employers", icon: Users },
      { title: "Offres", path: "/offers", icon: Briefcase },
      { title: "Candidatures", path: "/applications", icon: FileText },
      { title: "Missions", path: "/missions", icon: MapPin },
      { title: "Produits", path: "/products", icon: ShoppingBag },
    ]
  },
  {
    title: "Administration",
    items: [
      { title: "Validation", path: "/drivers-validation", icon: UserCheck },
      { title: "Signalements", path: "/reports", icon: AlertTriangle },
      { title: "Marketing & Boost", path: "/banners", icon: Megaphone },
      { title: "Notifications", path: "/notifications", icon: Bell },
      { title: "Paramètres", path: "/settings", icon: Settings },
    ]
  }
]

export function AppSidebar() {
  const location = useLocation()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-medium">
            {user?.firstName?.[0] || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {user?.firstName || 'Admin'} {user?.lastName || ''}
            </span>
            <span className="text-xs text-gray-500">Administrateur</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-gray-900 font-medium">{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4 text-gray-900" />
                          <span className="text-gray-900">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-gray-600 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
