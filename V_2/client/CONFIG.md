# Configuration de l'application Client

## 📋 Vue d'ensemble

Toutes les URLs et configurations de l'application passent maintenant par les fichiers `.env` pour faciliter la maintenance en production.

**Aucune URL n'est codée en dur dans le code source.**

## 🔧 Configuration locale (développement)

### 1. Créer le fichier .env

```bash
cd client
cp .env.example .env
```

### 2. Contenu du fichier .env

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_URL=http://localhost:4000
VITE_ENABLE_DEBUG=true
```

### 3. Démarrer l'application

```bash
npm run dev
```

## 🚀 Configuration production

### 1. Créer le fichier .env.production

```bash
cd client
cp .env.production.example .env.production
```

### 2. Contenu du fichier .env.production

```env
VITE_API_BASE_URL=https://server-chauffeur.onrender.com/api
VITE_API_URL=https://server-chauffeur.onrender.com
VITE_ENABLE_DEBUG=false
```

### 3. Build pour la production

```bash
npm run build
```

## 📁 Structure de configuration

```
client/
├── .env.example              # Template pour développement
├── .env.production.example   # Template pour production
├── .env                      # Votre config locale (gitignored)
├── .env.production          # Votre config prod (gitignored)
└── src/
    └── config/
        └── env.js           # Fichier de configuration centralisé
```

## 🔐 Sécurité

### Fichiers à NE JAMAIS commiter :
- ❌ `.env`
- ❌ `.env.production`
- ❌ `.env.local`
- ❌ Tout fichier contenant des vraies valeurs

### Fichiers à commiter :
- ✅ `.env.example`
- ✅ `.env.production.example`
- ✅ `src/config/env.js`

## 📝 Variables disponibles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL de l'API avec `/api` | `http://localhost:4000/api` |
| `VITE_API_URL` | URL du serveur sans `/api` | `http://localhost:4000` |
| `VITE_ENABLE_DEBUG` | Active les logs de debug | `true` ou `false` |

## 🛠️ Utilisation dans le code

### ❌ Ancienne méthode (à ne plus utiliser)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

### ✅ Nouvelle méthode (recommandée)

```javascript
import { config } from '../config/env';

const API_URL = config.api.url;
```

## 🔍 Debugging

### Afficher la configuration actuelle

```javascript
import { logConfig } from '../config/env';

logConfig(); // Affiche la config dans la console
```

### Vérifier les variables manquantes

Si une variable obligatoire manque, l'application affichera une erreur au démarrage :

```
❌ Variables d'environnement manquantes: VITE_API_BASE_URL
📝 Veuillez créer un fichier .env à la racine du projet client avec:
   VITE_API_BASE_URL=...
```

## 🌐 Déploiement sur Render

### Option 1 : Variables d'environnement Render

1. Allez dans votre service Render
2. Cliquez sur "Environment"
3. Ajoutez les variables :
   - `VITE_API_BASE_URL` = `https://server-chauffeur.onrender.com/api`
   - `VITE_API_URL` = `https://server-chauffeur.onrender.com`
   - `VITE_ENABLE_DEBUG` = `false`

### Option 2 : Fichier .env.production dans le repo

1. Créez `.env.production` avec vos valeurs de production
2. **Attention** : Ce fichier sera public dans votre repo
3. Recommandé uniquement si les URLs sont publiques

## ✅ Checklist avant déploiement

- [ ] Fichier `.env.production` créé avec les bonnes URLs
- [ ] `VITE_ENABLE_DEBUG=false` en production
- [ ] Aucun fichier `.env` avec des secrets n'est commité
- [ ] Les URLs de production sont correctes
- [ ] Test local avec `npm run build && npm run preview`

## 🆘 Dépannage

### Erreur : "Variables d'environnement manquantes"

**Solution** : Créez un fichier `.env` avec toutes les variables obligatoires.

### L'application ne se connecte pas à l'API

1. Vérifiez que le serveur est démarré
2. Vérifiez les URLs dans `.env`
3. Activez le debug : `VITE_ENABLE_DEBUG=true`
4. Regardez la console du navigateur

### Les changements du .env ne sont pas pris en compte

**Solution** : Redémarrez le serveur de développement (`npm run dev`)

## 📚 Ressources

- [Documentation Vite - Variables d'environnement](https://vitejs.dev/guide/env-and-mode.html)
- [Documentation Render - Variables d'environnement](https://render.com/docs/environment-variables)
