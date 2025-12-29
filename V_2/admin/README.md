# Admin Panel - Forgeron du Web

Panel d'administration pour le portfolio Forgeron du Web.

## 🚀 Technologies utilisées

- **React 19** - Framework frontend
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utilitaire
- **DaisyUI** - Composants UI pour Tailwind
- **React Router** - Routage côté client
- **React Hook Form** - Gestion des formulaires
- **React Hot Toast** - Notifications
- **Lucide React** - Icônes
- **Axios** - Client HTTP

## 📁 Structure du projet

```
admin/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout/         # Layout principal (Sidebar, Header)
│   │   └── ProtectedRoute.jsx
│   ├── contexts/           # Contextes React
│   │   └── AuthContext.jsx
│   ├── pages/              # Pages de l'application
│   │   ├── Dashboard.jsx   # Tableau de bord
│   │   ├── Login.jsx       # Page de connexion
│   │   ├── Projects.jsx    # Gestion des projets
│   │   ├── Articles.jsx    # Gestion des articles
│   │   └── Messages.jsx    # Messages de contact
│   ├── services/           # Services API
│   │   └── api.js
│   ├── App.jsx            # Composant principal
│   └── main.jsx           # Point d'entrée
├── .env                   # Variables d'environnement
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔧 Installation et démarrage

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3001`

3. **Build pour la production :**
   ```bash
   npm run build
   ```

## 🔐 Authentification

**Identifiants de test :**
- Email : `admin@forgeron.dev`
- Mot de passe : `admin123`

## 📋 Fonctionnalités

### ✅ Implémentées
- 🔐 Système d'authentification
- 📊 Tableau de bord avec statistiques
- 📁 Gestion des projets (liste, visualisation)
- 📝 Gestion des articles de blog (liste, visualisation)
- 💬 Gestion des messages de contact
- 🎨 Interface responsive avec thème sombre/clair
- 🔍 Recherche et filtrage
- 📱 Design mobile-first

### 🚧 À implémenter
- ✏️ Formulaires de création/édition des projets
- ✏️ Formulaires de création/édition des articles
- 📊 Page de statistiques détaillées
- ⚙️ Page de paramètres
- 🔄 Intégration API backend complète
- 📤 Upload d'images
- 📧 Système de réponse aux messages

## 🌐 API

L'admin communique avec l'API backend sur `http://localhost:5000/api/v1`

### Endpoints utilisés :
- `GET /projects` - Liste des projets
- `GET /articles` - Liste des articles
- `GET /contact/messages` - Messages de contact
- `POST /auth/login` - Authentification
- `GET /admin/stats` - Statistiques

## 🎨 Interface

- **Design moderne** avec Tailwind CSS et DaisyUI
- **Thème adaptatif** (clair/sombre)
- **Navigation intuitive** avec sidebar responsive
- **Notifications** avec React Hot Toast
- **Icônes** avec Lucide React

## 📱 Responsive Design

L'interface s'adapte automatiquement :
- **Mobile** : Navigation en overlay
- **Tablet** : Layout adapté
- **Desktop** : Sidebar fixe

## 🔄 État de développement

Le projet est en cours de développement. Les fonctionnalités de base sont implémentées avec des données simulées. L'intégration avec l'API backend sera ajoutée progressivement.

## 🚀 Prochaines étapes

1. Installer les dépendances : `npm install`
2. Démarrer l'application : `npm run dev`
3. Se connecter avec les identifiants de test
4. Tester les différentes sections de l'admin
5. Implémenter les formulaires de création/édition
6. Connecter à l'API backend réelle
