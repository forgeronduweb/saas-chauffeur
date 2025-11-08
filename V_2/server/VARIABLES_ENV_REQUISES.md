# 📝 Variables d'environnement requises - GoDriver

## ✅ Configuration complète du fichier `.env`

Copiez ce template dans votre fichier `server/.env` :

```env
# ========================================
# SERVEUR
# ========================================
PORT=4000
NODE_ENV=development

# ========================================
# BASE DE DONNÉES MONGODB
# ========================================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chauffeur_db?retryWrites=true&w=majority

# ========================================
# JWT SECRET
# ========================================
JWT_SECRET=votre_secret_jwt_tres_securise_ici

# ========================================
# URLs DES APPLICATIONS
# ========================================
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:3001
API_URL=http://localhost:4000

# ========================================
# GOOGLE OAUTH (Optionnel)
# ========================================
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# ========================================
# EMAIL (NODEMAILER) - OBLIGATOIRE
# ========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_16_caracteres

# ========================================
# EMAIL DE TEST (Optionnel)
# ========================================
TEST_EMAIL=votre.email.personnel@gmail.com

# ========================================
# MAILBOXLAYER API (Optionnel)
# ========================================
MAILBOXLAYER_API_KEY=votre_api_key_mailboxlayer
```

## 🔴 Variables OBLIGATOIRES

Ces variables sont **essentielles** pour le fonctionnement de l'application :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `4000` |
| `MONGO_URI` | Connexion MongoDB | `mongodb+srv://...` |
| `JWT_SECRET` | Secret pour les tokens | `mon_secret_123` |
| `CLIENT_URL` | URL du client React | `http://localhost:5173` |
| `EMAIL_HOST` | Serveur SMTP | `smtp.gmail.com` |
| `EMAIL_PORT` | Port SMTP | `587` |
| `EMAIL_USER` | Email expéditeur | `godriver@gmail.com` |
| `EMAIL_PASSWORD` | Mot de passe app | `abcd efgh ijkl mnop` |

## 🟡 Variables RECOMMANDÉES

Ces variables améliorent l'expérience utilisateur :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `ADMIN_URL` | URL de l'admin | `http://localhost:3001` |
| `API_URL` | URL de l'API | `http://localhost:4000` |
| `TEST_EMAIL` | Email pour tests | `test@gmail.com` |

## 🟢 Variables OPTIONNELLES

Ces variables ajoutent des fonctionnalités supplémentaires :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth Google | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Secret OAuth | `GOCSPX-...` |
| `MAILBOXLAYER_API_KEY` | Validation email | `abc123...` |

## 📋 Checklist de configuration

Avant de démarrer le serveur, vérifiez que :

- [ ] Le fichier `.env` existe dans `server/`
- [ ] `MONGO_URI` est configuré avec vos identifiants MongoDB
- [ ] `JWT_SECRET` contient une chaîne aléatoire sécurisée
- [ ] `EMAIL_USER` et `EMAIL_PASSWORD` sont configurés
- [ ] `EMAIL_PASSWORD` est un **mot de passe d'application** (pas votre mot de passe Gmail)
- [ ] `CLIENT_URL` pointe vers votre application React
- [ ] Toutes les variables obligatoires sont renseignées

## 🔒 Sécurité

### ⚠️ NE JAMAIS :
- ❌ Commiter le fichier `.env` sur Git
- ❌ Partager vos identifiants
- ❌ Utiliser des valeurs par défaut en production
- ❌ Exposer vos secrets dans le code

### ✅ TOUJOURS :
- ✅ Ajouter `.env` dans `.gitignore`
- ✅ Utiliser des mots de passe forts
- ✅ Générer un nouveau `JWT_SECRET` pour chaque environnement
- ✅ Utiliser des mots de passe d'application pour Gmail

## 🔐 Génération de secrets sécurisés

### JWT_SECRET

Générez un secret aléatoire sécurisé :

**Node.js :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**En ligne :**
https://www.random.org/strings/

### EMAIL_PASSWORD (Gmail)

1. Allez sur https://myaccount.google.com/apppasswords
2. Créez un nouveau mot de passe d'application
3. Copiez le mot de passe généré (16 caractères)

## 📊 Validation de la configuration

Pour vérifier que votre configuration est correcte :

```bash
cd server
node test-email.js
```

Vous devriez voir :
```
✅ Serveur email prêt à envoyer des messages
✅ Email de validation envoyé avec succès
✅ Email de rejet envoyé avec succès
✅ Email de bienvenue envoyé avec succès
```

## 🌍 Configuration par environnement

### Développement (`.env`)
```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.mailtrap.io  # Pour les tests
```

### Production (`.env.production`)
```env
NODE_ENV=production
CLIENT_URL=https://godriver.com
EMAIL_HOST=smtp.sendgrid.net  # Service professionnel
```

## 🆘 Dépannage

### Erreur : "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Erreur : "Invalid login" (Email)
- Vérifiez que vous utilisez un **mot de passe d'application**
- Activez la validation en 2 étapes sur Gmail

### Erreur : "MongoServerError: bad auth"
- Vérifiez votre `MONGO_URI`
- Vérifiez que votre IP est autorisée dans MongoDB Atlas

### Variables non chargées
- Vérifiez que le fichier `.env` est dans `server/`
- Redémarrez le serveur après modification du `.env`

## 📚 Ressources

- [Documentation Nodemailer](https://nodemailer.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Google App Passwords](https://myaccount.google.com/apppasswords)
- [JWT.io](https://jwt.io/)

---

**Dernière mise à jour** : ${new Date().toLocaleDateString('fr-FR')}
