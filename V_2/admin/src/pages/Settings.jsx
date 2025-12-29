import React, { useState } from 'react'
import { Save, User, Lock, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: 'Forgeron du Web',
    email: 'admin@forgeron.dev',
    bio: 'Développeur Full Stack passionné par les technologies web modernes.',
    website: 'https://forgeron-du-web.com',
    location: 'France'
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    newMessages: true,
    projectUpdates: false,
    weeklyReport: true
  })

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSecurityChange = (e) => {
    const { name, value } = e.target
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    try {
      setIsSaving(true)
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Mot de passe mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du mot de passe')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true)
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Préférences de notification mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notifications')
    } finally {
      setIsSaving(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Site web</label>
                <Input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Localisation</label>
                <Input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Sauvegarder</>
                )}
              </Button>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mot de passe actuel</label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={securityData.currentPassword}
                  onChange={handleSecurityChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nouveau mot de passe</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={securityData.newPassword}
                  onChange={handleSecurityChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={securityData.confirmPassword}
                  onChange={handleSecurityChange}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSecurity} disabled={isSaving}>
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Mettre à jour</>
                )}
              </Button>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications par email</p>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationData.emailNotifications}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nouveaux messages</p>
                  <p className="text-sm text-muted-foreground">Être notifié des nouveaux messages de contact</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="newMessages"
                    checked={notificationData.newMessages}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mises à jour de projets</p>
                  <p className="text-sm text-muted-foreground">Notifications lors de modifications de projets</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="projectUpdates"
                    checked={notificationData.projectUpdates}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rapport hebdomadaire</p>
                  <p className="text-sm text-muted-foreground">Recevoir un résumé hebdomadaire des activités</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="weeklyReport"
                    checked={notificationData.weeklyReport}
                    onChange={handleNotificationChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Sauvegarder</>
                )}
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Contenu de l'onglet */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeTab === 'profile' && <><User className="h-5 w-5" />Informations personnelles</>}
                {activeTab === 'security' && <><Lock className="h-5 w-5" />Changer le mot de passe</>}
                {activeTab === 'notifications' && <><Bell className="h-5 w-5" />Préférences de notification</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
