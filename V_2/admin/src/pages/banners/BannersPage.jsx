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
import { Plus, Trash2, Image, Eye, EyeOff, Save, Rocket, Share2, Star, Users, TrendingUp, Pencil, Check, ChevronsUpDown } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function BannersPage() {
  const [activeSection, setActiveSection] = useState('banners')
  const [banners, setBanners] = useState([])
  const [boosts, setBoosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    location: 'home',
    isActive: true
  })
  const [imagePreview, setImagePreview] = useState('')
  const [open, setOpen] = useState(false)
  const [showBoostDialog, setShowBoostDialog] = useState(false)
  const [showSocialDialog, setShowSocialDialog] = useState(false)
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)

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
    setFormData({ title: '', image: '', link: '', location: 'home', isActive: true })
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
      isActive: banner.isActive
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Colonnes pour DataTable des boosts
  const boostColumns = [
    {
      accessorKey: 'user',
      header: 'Utilisateur',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
            {row.original.userName?.[0] || 'U'}
          </div>
          <span className="font-medium">{row.original.userName || 'Utilisateur'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === 'driver' ? 'Chauffeur' : 'Employeur'}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Début',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.startDate || '-'}</span>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'Fin',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.endDate || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status === 'active' ? 'Actif' : 'Expiré'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
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

  // Composant pour la section Boost Utilisateurs
  const BoostSection = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl">{boosts.filter(b => b.type === 'driver').length}</p>
                <p className="text-sm text-gray-500">Chauffeurs boostés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl">{boosts.filter(b => b.type === 'employer').length}</p>
                <p className="text-sm text-gray-500">Employeurs boostés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
                <Star className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl">0 FCFA</p>
                <p className="text-sm text-gray-500">Revenus boost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {boosts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun boost actif pour le moment</p>
              <p className="text-sm">Les utilisateurs boostés apparaîtront ici</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={boostColumns} data={boosts} />
      )}
    </>
  )

  // Composant pour la section Promotions Réseaux Sociaux
  const SocialSection = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-600">f</span>
                </div>
                <div>
                  <p className="font-medium">Facebook</p>
                  <p className="text-sm text-gray-500">0 partages ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-600">IG</span>
                </div>
                <div>
                  <p className="font-medium">Instagram</p>
                  <p className="text-sm text-gray-500">0 partages ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-center py-8 text-gray-500 border border-dashed">
          <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Promotions RS à venir</p>
          <p className="text-sm mt-1">Partagez automatiquement les profils sur les réseaux sociaux</p>
        </div>
      </CardContent>
    </Card>
  )

  // Composant pour la section Profils Premium
  const PremiumSection = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-lg">Bronze</p>
              <p className="text-2xl">5 000 FCFA</p>
              <p className="text-xs text-gray-500">/mois</p>
              <ul className="text-sm text-left mt-3 space-y-1 text-gray-600">
                <li>✓ Badge vérifié</li>
                <li>✓ Priorité recherche +10%</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-lg">Silver</p>
              <p className="text-2xl">15 000 FCFA</p>
              <p className="text-xs text-gray-500">/mois</p>
              <ul className="text-sm text-left mt-3 space-y-1 text-gray-600">
                <li>✓ Badge vérifié</li>
                <li>✓ Priorité recherche +30%</li>
                <li>✓ Profil mis en avant</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-lg">Gold</p>
              <p className="text-2xl">30 000 FCFA</p>
              <p className="text-xs text-gray-500">/mois</p>
              <ul className="text-sm text-left mt-3 space-y-1 text-gray-600">
                <li>✓ Badge Gold</li>
                <li>✓ Priorité recherche +50%</li>
                <li>✓ En haut des résultats</li>
                <li>✓ Support prioritaire</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="text-center py-8 text-gray-500 border border-dashed">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Abonnements Premium à venir</p>
          <p className="text-sm mt-1">Proposez des abonnements pour augmenter la visibilité des profils</p>
        </div>
      </CardContent>
    </Card>
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
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre (optionnel)</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la bannière"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emplacement</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 bg-transparent text-gray-900 text-sm"
                >
                  <option value="home">Page d'accueil</option>
                  <option value="offers">Page offres</option>
                  <option value="marketplace">Marketplace</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Lien (optionnel)</label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
      case 'boost':
        return (
          <Button onClick={() => setShowBoostDialog(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un boost
          </Button>
        )
      case 'social':
        return (
          <Button onClick={() => setShowSocialDialog(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Connecter un compte
          </Button>
        )
      case 'premium':
        return (
          <Button onClick={() => setShowPremiumDialog(true)} className="bg-gray-900 hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un abonnement
          </Button>
        )
      default:
        return null
    }
  }

  const sections = [
    { value: 'banners', label: `Bannières (${banners.length})`, icon: Image },
    { value: 'boost', label: 'Boost Utilisateurs', icon: Rocket },
    { value: 'social', label: 'Promotions RS', icon: Share2 },
    { value: 'premium', label: 'Profils Premium', icon: Star },
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
      {activeSection === 'boost' && <BoostSection />}
      {activeSection === 'social' && <SocialSection />}
      {activeSection === 'premium' && <PremiumSection />}

      {/* Dialog Boost */}
      <Dialog open={showBoostDialog} onOpenChange={setShowBoostDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un boost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Utilisateur</label>
              <Input placeholder="Rechercher un utilisateur..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full h-10 px-3 border border-gray-300 bg-transparent text-gray-900 text-sm">
                <option value="driver">Chauffeur</option>
                <option value="employer">Employeur</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date début</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date fin</label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoostDialog(false)}>Annuler</Button>
            <Button className="bg-gray-900 hover:bg-gray-800">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Social */}
      <Dialog open={showSocialDialog} onOpenChange={setShowSocialDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connecter un compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plateforme</label>
              <select className="w-full h-10 px-3 border border-gray-300 bg-transparent text-gray-900 text-sm">
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter / X</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom du compte</label>
              <Input placeholder="@votrecompte" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Token d'accès</label>
              <Input type="password" placeholder="Token API..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSocialDialog(false)}>Annuler</Button>
            <Button className="bg-gray-900 hover:bg-gray-800">Connecter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Premium */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un abonnement Premium</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Utilisateur</label>
              <Input placeholder="Rechercher un utilisateur..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Formule</label>
              <select className="w-full h-10 px-3 border border-gray-300 bg-transparent text-gray-900 text-sm">
                <option value="bronze">Bronze - 5 000 FCFA/mois</option>
                <option value="silver">Silver - 15 000 FCFA/mois</option>
                <option value="gold">Gold - 30 000 FCFA/mois</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date début</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée (mois)</label>
                <Input type="number" min="1" defaultValue="1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>Annuler</Button>
            <Button className="bg-gray-900 hover:bg-gray-800">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BannersPage
