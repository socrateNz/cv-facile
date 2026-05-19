# CVFacile SaaS

Plateforme SaaS pour creer, previsualiser, payer et telecharger un CV en PDF.

## Stack

- Next.js App Router + TypeScript
- MongoDB + Mongoose
- Cloudinary (upload photo)
- NotchPay (paiement Mobile Money)
- Puppeteer (generation PDF)

## Demarrage

1. Copier les variables d'environnement

```bash
cp .env.example .env
```

2. Installer les dependances

```bash
npm install
```

3. Lancer l'application

```bash
npm run dev
```

## Routes principales

- `/` landing page
- `/templates` choix visuel du template
- `/cv` creation CV multi-step + preview live
- `/my-cvs` historique et edition des CV de l'utilisateur
- `/preview` apercu CV
- `/auth/login` connexion utilisateur
- `/auth/register` inscription utilisateur
- `/admin` dashboard admin
- `/admin/users` gestion utilisateurs
- `/admin/cvs` gestion CV
- `/admin/payments` suivi paiements

## API Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Migration base de donnees

- Diagnostic connexion: `npm run check:db`
- Commande: `npm run migrate:db`
- Variables utiles:
  - `MONGODB_URI`
  - `MONGODB_DB`
  - `MIGRATION_DEFAULT_PASSWORD` (optionnelle, par defaut `ChangeMe123!`)
