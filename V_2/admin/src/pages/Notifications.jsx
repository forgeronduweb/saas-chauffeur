import React, { useState } from 'react'
import { Bell, Check, X, AlertCircle, Users, FileText, Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_driver',
      title: 'Nouveau chauffeur inscrit',
      message: 'Jean Dupont a créé un compte et attend la validation de son profil',
      time: 'Il y a 2h',
      unread: true,
      action: 'Valider le profil'
    },
    {
      id: 2,
      type: 'document_validation',
      title: 'Documents à valider',
      message: '5 nouveaux documents de chauffeurs nécessitent une validation',
      time: 'Il y a 4h',
      unread: true,
      action: 'Voir les documents'
    },
    {
      id: 3,
      type: 'system_alert',
      title: 'Maintenance système',
      message: 'Maintenance programmée ce soir de 23h à 1h du matin',
      time: 'Hier',
      unread: false
    },
    {
      id: 4,
      type: 'new_employer',
      title: 'Nouvel employeur',
      message: 'Entreprise TransportCorp a créé un compte professionnel',
      time: 'Il y a 1 jour',
      unread: false,
      action: 'Voir le profil'
    },
    {
      id: 5,
      type: 'report',
      title: 'Signalement utilisateur',
      message: 'Un signalement a été déposé concernant un chauffeur',
      time: 'Il y a 2 jours',
      unread: false,
      action: 'Traiter le signalement'
    }
  ])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_driver':
        return (
          <div className="p-2 bg-orange-100 rounded">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        )
      case 'document_validation':
        return (
          <div className="p-2 bg-orange-100 rounded">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
        )
      case 'system_alert':
        return (
          <div className="p-2 bg-red-100 rounded">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
        )
      case 'new_employer':
        return (
          <div className="p-2 bg-orange-100 rounded">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        )
      case 'report':
        return (
          <div className="p-2 bg-gray-100 rounded">
            <AlertCircle className="h-5 w-5 text-gray-600" />
          </div>
        )
      default:
        return (
          <div className="p-2 bg-gray-100 rounded">
            <Bell className="h-5 w-5 text-gray-600" />
          </div>
        )
    }
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="space-y-6">
      {/* Paramètres de notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Paramètres de notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Nouveaux utilisateurs</p>
              <p className="text-sm text-muted-foreground">Recevoir des notifications pour les nouvelles inscriptions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Validation de documents</p>
              <p className="text-sm text-muted-foreground">Notifications pour les documents nécessitant une validation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Signalements</p>
              <p className="text-sm text-muted-foreground">Alertes pour les signalements d'utilisateurs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Alertes système</p>
              <p className="text-sm text-muted-foreground">Notifications concernant le système et la maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Liste des notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications récentes
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marquer toutes comme lues
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {notifications.length > 0 ? notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`py-4 first:pt-0 last:pb-0 ${notification.unread ? 'bg-orange-50/50 -mx-6 px-6' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="mt-3 flex items-center gap-3">
                      {notification.action && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                          {notification.action}
                        </Button>
                      )}
                      <div className="flex items-center gap-2">
                        {notification.unread && (
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-3 w-3 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-destructive" onClick={() => deleteNotification(notification.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Aucune notification</p>
                <p className="text-muted-foreground">Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
