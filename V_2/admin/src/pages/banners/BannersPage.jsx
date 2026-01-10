import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../../components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { DataTable } from '../../components/ui/data-table'
import { cn } from '../../lib/utils'
import { Plus, Trash2, Image, Eye, EyeOff, Save, Mail, MessageSquare, Send, Pencil, Check, ChevronsUpDown, Clock, Users, BarChart3 } from 'lucide-react'
import { Textarea } from '../../components/ui/textarea'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function BannersPage() {
  const [activeSection, setActiveSection] = useState('banners')
  const [banners, setBanners] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    location: 'home',
    isActive: true,
    startDate: '',
    endDate: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [open, setOpen] = useState(false)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [campaignType, setCampaignType] = useState('email')
  const [openTypeCombo, setOpenTypeCombo] = useState(false)
  const [campaignContent, setCampaignContent] = useState('')
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Tous les chauffeurs', type: 'group', count: 0 },
    { id: 2, name: 'Tous les employeurs', type: 'group', count: 0 },
    { id: 3, name: 'Utilisateurs actifs', type: 'group', count: 0 },
    { id: 4, name: 'Nouveaux inscrits', type: 'group', count: 0 },
  ])
  const [selectedContacts, setSelectedContacts] = useState([])

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/banners`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setBanners(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      const url = editingBanner 
        ? `${API_URL}/api/banners/${editingBanner._id}`
        : `${API_URL}/api/banners`
      
      const response = await fetch(url, {
        method: editingBanner ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchBanners()
        resetForm()
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette bannière ?')) return
    
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${API_URL}/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchBanners()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const toggleActive = async (banner) => {
    try {
      const token = localStorage.getItem('admin_token')
      await fetch(`${API_URL}/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      })
      fetchBanners()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', image: '', link: '', location: 'home', isActive: true, startDate: '', endDate: '' })
    setImagePreview('')
    setEditingBanner(null)
    setShowForm(false)
  }

  const startEdit = (banner) => {
    setFormData({
      title: banner.title || '',
      image: banner.image,
      link: banner.link || '',
      location: banner.location,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    })
    setImagePreview(banner.image)
    setEditingBanner(banner)
    setShowForm(true)
  }

  const getLocationLabel = (location) => {
    const labels = {
      home: 'Page d\'accueil',
      offers: 'Page offres',
      marketplace: 'Marketplace'
    }
    return labels[location] || location
  }

  const getCountdown = (endDate) => {
    if (!endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const diff = end - now
    
    if (diff <= 0) return { text: 'Expirée', expired: true }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return { text: `${days}j ${hours}h`, expired: false }
    if (hours > 0) return { text: `${hours}h ${minutes}m`, expired: false }
    return { text: `${minutes}m`, expired: false }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Colonnes pour DataTable des campagnes
  const campaignColumns = [
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.type === 'email' ? (
            <Mail className="h-4 w-4 text-gray-500" />
          ) : (
            <MessageSquare className="h-4 w-4 text-gray-500" />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === 'email' ? 'Email' : 'SMS'}
        </Badge>
      ),
    },
    {
      accessorKey: 'audience',
      header: 'Audience',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.audienceCount || 0} destinataires</span>
      ),
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Programmée',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.scheduledDate || 'Immédiat'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => {
        const statusMap = {
          draft: { label: 'Brouillon', variant: 'secondary' },
          scheduled: { label: 'Programmée', variant: 'outline' },
          sending: { label: 'En cours', variant: 'default' },
          sent: { label: 'Envoyée', variant: 'default' },
          failed: { label: 'Échec', variant: 'destructive' }
        }
        const status = statusMap[row.original.status] || statusMap.draft
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.status === 'draft' && (
            <Button variant="ghost" size="sm" title="Envoyer">
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Composant pour la section Campagnes Email/SMS
  const CampaignsSection = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Emails</p>
            <p className="text-2xl font-semibold">{campaigns.filter(c => c.type === 'email').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">SMS</p>
            <p className="text-2xl font-semibold">{campaigns.filter(c => c.type === 'sms').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Destinataires</p>
            <p className="text-2xl font-semibold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Taux d'ouverture</p>
            <p className="text-2xl font-semibold">0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des campagnes */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-gray-500">Aucune campagne</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={campaignColumns} data={campaigns} />
      )}
    </>
  )

  // Colonnes pour DataTable des bannières
  const bannerColumns = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="w-24 h-14 flex-shrink-0">
          <img
            src={row.original.image}
            alt={row.original.title || 'Bannière'}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Titre',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title || 'Sans titre'}</span>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Emplacement',
      cell: ({ row }) => (
        <Badge variant="outline">{getLocationLabel(row.original.location)}</Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'countdown',
      header: 'Temps restant',
      cell: ({ row }) => {
        const countdown = getCountdown(row.original.endDate)
        if (!countdown) return <span className="text-gray-400 text-sm">-</span>
        return (
          <div className={`flex items-center gap-1 text-sm ${countdown.expired ? 'text-red-500' : 'text-orange-500'}`}>
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">{countdown.text}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => toggleActive(row.original)}>
            {row.original.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => startEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Composant pour la section Bannières
  const BannersSection = () => (
    <>
      {banners.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune bannière pour le moment</p>
              <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={bannerColumns} data={banners} />
      )}
    </>
  )

  // Bouton d'action selon la section active
  const getActionButton = () => {
    switch (activeSection) {
      case 'banners':
        return (
          <Button onClick={() => setShowForm(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        )
      case 'campaigns':
        return (
          <Button onClick={() => setShowCampaignDialog(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
        )
      default:
        return null
    }
  }

  const sections = [
    { value: 'banners', label: `Bannières (${banners.length})`, icon: Image },
    { value: 'campaigns', label: 'Campagnes Email/SMS', icon: Send },
  ]

  return (
    <div className="space-y-4">
      {/* Header : Combobox + Action */}
      <div className="flex items-center justify-between gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[220px] justify-between text-sm font-medium"
            >
              {sections.find((s) => s.value === activeSection)?.label || 'Choisir une section'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandList>
                <CommandGroup>
                  {sections.map((section) => (
                    <CommandItem
                      key={section.value}
                      value={section.value}
                      onSelect={(currentValue) => {
                        setActiveSection(currentValue)
                        setOpen(false)
                      }}
                      className="text-sm font-medium"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeSection === section.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <section.icon className="mr-2 h-4 w-4" />
                      {section.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {getActionButton()}
      </div>

      {/* Content */}
      {activeSection === 'banners' && <BannersSection />}
      {activeSection === 'campaigns' && <CampaignsSection />}

      {/* Dialog Bannière */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre (optionnel)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la bannière"
                  className="w-full h-10 px-3 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emplacement</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 bg-white text-gray-900 text-sm"
                >
                  <option value="home">Page d'accueil</option>
                  <option value="offers">Page offres</option>
                  <option value="marketplace">Marketplace</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://..."
                className="w-full h-10 px-3 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="p-3 bg-gray-50 border border-gray-200 mb-3 text-xs text-gray-600">
                <strong>Taille :</strong> 1920 × 600 px • <strong>Format :</strong> JPG, PNG, WebP • <strong>Max :</strong> 500 Ko
              </div>
              <label className="cursor-pointer inline-block">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                  <Image className="h-4 w-4" />
                  <span>Choisir une image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Aperçu" className="max-h-40 border" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de début (optionnel)</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de fin (optionnel)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm">Activer cette bannière</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                <Save className="h-4 w-4 mr-2" />
                {editingBanner ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Campagne Email/SMS */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle campagne</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Combobox Type Email/SMS */}
            <div>
              <label className="block text-sm font-medium mb-2">Type de campagne</label>
              <Popover open={openTypeCombo} onOpenChange={setOpenTypeCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTypeCombo}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {campaignType === 'email' ? (
                        <>
                          <Mail className="h-4 w-4" />
                          Email
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          SMS
                        </>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          value="email"
                          onSelect={() => {
                            setCampaignType('email')
                            setOpenTypeCombo(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", campaignType === 'email' ? "opacity-100" : "opacity-0")} />
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </CommandItem>
                        <CommandItem
                          value="sms"
                          onSelect={() => {
                            setCampaignType('sms')
                            setOpenTypeCombo(false)
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", campaignType === 'sms' ? "opacity-100" : "opacity-0")} />
                          <MessageSquare className="mr-2 h-4 w-4" />
                          SMS
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Liste des contacts */}
            <div>
              <label className="block text-sm font-medium mb-2">Destinataires</label>
              <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                      selectedContacts.includes(contact.id) && "bg-gray-100"
                    )}
                    onClick={() => {
                      if (selectedContacts.includes(contact.id)) {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                      } else {
                        setSelectedContacts([...selectedContacts, contact.id])
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 border rounded flex items-center justify-center",
                        selectedContacts.includes(contact.id) ? "bg-gray-900 border-gray-900" : "border-gray-300"
                      )}>
                        {selectedContacts.includes(contact.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{contact.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {contact.count} contacts
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedContacts.length} groupe(s) sélectionné(s)
              </p>
            </div>

            {/* Objet (email uniquement) */}
            {campaignType === 'email' && (
              <div>
                <label className="block text-sm font-medium mb-2">Objet</label>
                <Input placeholder="Objet de l'email..." />
              </div>
            )}

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {campaignType === 'email' ? 'Contenu de l\'email' : 'Message SMS'}
              </label>
              <Textarea 
                placeholder={campaignType === 'email' 
                  ? "Rédigez votre email...\n\nVariables : {{prenom}}, {{nom}}, {{email}}" 
                  : "Rédigez votre SMS (160 car. max)...\n\nVariables : {{prenom}}, {{nom}}"
                }
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                className="min-h-[120px]"
              />
              {campaignType === 'sms' && (
                <p className="text-xs text-gray-500 mt-1">
                  {campaignContent.length}/160 caractères
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => {
              setShowCampaignDialog(false)
              setCampaignContent('')
              setSelectedContacts([])
            }}>
              Annuler
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BannersPage
