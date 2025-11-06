# Chauffeurs - Backend

## Démarrage

1. Créez un fichier `.env` à la racine (même niveau que `package.json`) avec:
```
PORT=4000
JWT_SECRET=change-me
```

2. Installer les dépendances (déjà fait si vous avez suivi l'initialisation):
```bash
npm install
```

3. Lancer le serveur en développement:
```bash
npm run dev
```

Le serveur écoute par défaut sur `http://localhost:4000`.

## Endpoints

- `GET /health`
- `POST /api/auth/register` { email, password, role? }
- `POST /api/auth/login` { email, password }

- `GET /api/drivers`
- `POST /api/drivers` (Bearer token)
- `PUT /api/drivers/:id` (Bearer token)
- `DELETE /api/drivers/:id` (Bearer token)

- `GET /api/vehicles`
- `POST /api/vehicles` (Bearer token)
- `PUT /api/vehicles/:id` (Bearer token)
- `DELETE /api/vehicles/:id` (Bearer token)

- `GET /api/rides`
- `POST /api/rides` (Bearer token)
- `PUT /api/rides/:id` (Bearer token)
- `DELETE /api/rides/:id` (Bearer token)

## Stockage

Le stockage est basé sur des fichiers JSON dans `server/db/*.json` créés automatiquement au premier démarrage.
