# Configuration de l'envoi d'emails avec Nodemailer

## 📧 Configuration Gmail

Pour utiliser Gmail avec Nodemailer, vous devez créer un **mot de passe d'application** (App Password).

### Étapes pour configurer Gmail :

1. **Activer la validation en 2 étapes sur votre compte Google**
   - Allez sur https://myaccount.google.com/security
   - Activez la "Validation en 2 étapes"

2. **Créer un mot de passe d'application**
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)"
   - Entrez "GoDriver" comme nom
   - Cliquez sur "Générer"
   - Copiez le mot de passe généré (16 caractères)

3. **Configurer les variables d'environnement**
   
   Dans votre fichier `.env`, ajoutez :
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre.email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Le mot de passe d'application généré
   CLIENT_URL=http://localhost:5173
   ```

## 🔧 Autres fournisseurs SMTP

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=votre.email@outlook.com
EMAIL_PASSWORD=votre_mot_de_passe
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=votre.email@yahoo.com
EMAIL_PASSWORD=votre_mot_de_passe
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=votre_api_key_sendgrid
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@votre-domaine.mailgun.org
EMAIL_PASSWORD=votre_mot_de_passe_mailgun
```

## 📝 Types d'emails envoyés

Le service email envoie automatiquement les emails suivants :

### 1. Email de validation de compte chauffeur
- **Quand** : Lorsqu'un admin valide un compte chauffeur
- **Contenu** : Confirmation de validation + lien vers les offres

### 2. Email de rejet de compte chauffeur
- **Quand** : Lorsqu'un admin rejette un compte chauffeur
- **Contenu** : Notification de rejet + raison + lien pour mettre à jour le profil

### 3. Email de bienvenue
- **Quand** : Lors de l'inscription d'un nouvel utilisateur
- **Contenu** : Message de bienvenue personnalisé selon le rôle (chauffeur/employeur)

### 4. Email de nouvelle candidature
- **Quand** : Un chauffeur postule à une offre
- **Contenu** : Notification à l'employeur avec infos du candidat

## 🧪 Test de l'envoi d'emails

Pour tester l'envoi d'emails, vous pouvez utiliser **Mailtrap** (environnement de développement) :

1. Créez un compte sur https://mailtrap.io
2. Récupérez vos identifiants SMTP
3. Configurez votre `.env` :
   ```env
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=votre_username_mailtrap
   EMAIL_PASSWORD=votre_password_mailtrap
   ```

## 🚨 Dépannage

### Erreur "Invalid login"
- Vérifiez que vous utilisez un mot de passe d'application (pas votre mot de passe Gmail)
- Vérifiez que la validation en 2 étapes est activée

### Erreur "Connection timeout"
- Vérifiez votre connexion internet
- Vérifiez que le port 587 n'est pas bloqué par votre pare-feu

### Emails non reçus
- Vérifiez le dossier spam/courrier indésirable
- Vérifiez que l'adresse email du destinataire est correcte
- Consultez les logs du serveur pour voir les erreurs

## 📊 Monitoring

Les logs d'envoi d'emails sont affichés dans la console :
- ✅ `Email de validation envoyé: <messageId>`
- ❌ `Erreur lors de l'envoi de l'email: <error>`

## 🔒 Sécurité

- ⚠️ Ne commitez JAMAIS votre fichier `.env` avec vos identifiants
- ✅ Utilisez toujours des mots de passe d'application
- ✅ Limitez les permissions du compte email utilisé
- ✅ Surveillez les logs pour détecter les abus
