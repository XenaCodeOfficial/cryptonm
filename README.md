# NM Crypto - Plateforme de Gestion de Portefeuille Crypto

Plateforme professionnelle de gestion de portefeuille crypto développée pour Neftali Manzambi.

## Caractéristiques Principales

### Panel Admin
- **Tableau de bord complet** avec 5 indicateurs clés:
  - Actifs sous gestion
  - Performance Globale
  - Rendement Moyen par Client
  - Commissions de l'Admin
  - Clients Actifs
- **Gestion des clients**:
  - Créer, visualiser et supprimer des clients
  - Upload de photos de profil
  - Magic Link pour l'accès client
  - Configuration du niveau de risque et commission
- **Gestion des transactions**:
  - Support de multiples catégories (Crypto, NFT, Immobilier, Presale, Memecoin, Autre)
  - Enregistrement détaillé des opérations d'achat/vente
  - Calcul automatique des profits/pertes
  - Support des Presales avec dates de sortie et targets
- **Visualisation des données**:
  - Statistiques par client
  - Historique complet des transactions

### Panel Client
- **Vue d'ensemble du portefeuille**:
  - Budget initial
  - Valeur actuelle
  - Profit/Perte total
  - Performance en pourcentage
- **Historique des transactions**:
  - Vue détaillée de toutes les opérations
  - Calculs de profit/perte en temps réel

### Fonctionnalités Générales
- **Mode clair/sombre** avec persistance
- **Multi-devises** (USD, EUR, CHF) avec conversion automatique
- **Format européen** pour les nombres (2.000,00)
- **Design professionnel** type banque/gestionnaire financier
- **Authentification sécurisée** avec NextAuth
- **Upload d'images** pour les avatars
- **Responsive design** (desktop et mobile)

## Technologies Utilisées

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Base de données**: SQLite avec Prisma ORM
- **Authentification**: NextAuth.js
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Gestion d'état**: React Context API

## Installation

### Prérequis
- Node.js 18+ et npm

### Étapes d'installation

1. **Installer les dépendances**:
```bash
npm install
```

2. **Configurer la base de données**:
```bash
npx prisma generate
npx prisma db push
```

3. **Créer un compte admin** (via Prisma Studio ou script):
```bash
npx prisma studio
```

Dans Prisma Studio:
- Aller dans le modèle `Admin`
- Créer un nouvel enregistrement:
  - email: `nefta@nmcrypto.com`
  - password: Utiliser un hash bcrypt (voir ci-dessous)
  - name: `Neftali Manzambi`

**Pour générer un hash bcrypt du mot de passe**:
```javascript
// Créer un fichier hash-password.js
const bcrypt = require('bcryptjs');
const password = 'votre-mot-de-passe';
const hash = bcrypt.hashSync(password, 12);
console.log(hash);
```
Puis exécuter: `node hash-password.js`

4. **Démarrer le serveur de développement**:
```bash
npm run dev
```

5. **Ouvrir l'application**: [http://localhost:3000](http://localhost:3000)

## Utilisation

### Connexion

#### Admin
1. Aller sur `/login`
2. Sélectionner "Admin"
3. Email: `nefta@nmcrypto.com`
4. Mot de passe: (celui que vous avez configuré)

#### Client
1. Aller sur `/login`
2. Sélectionner "Client"
3. Utiliser les identifiants fournis par l'admin

### Créer un Client (Admin)

1. Se connecter en tant qu'admin
2. Cliquer sur "Créer un client"
3. Remplir le formulaire:
   - **Informations personnelles**: Nom, prénom, email, mot de passe, âge, sexe, nationalité
   - **Investissement**: Budget initial, niveau de risque, commission
   - **Photo de profil**: Upload direct ou laisser le client le faire
   - **Magic Link**: Générer un lien unique pour l'accès client
4. Cliquer sur "Créer le client"

### Ajouter une Transaction (Admin)

1. Aller dans le détail d'un client
2. Cliquer sur "Ajouter une transaction"
3. Remplir le formulaire:
   - **Type**: Achat ou Vente
   - **Catégorie**: Crypto, NFT, Immobilier, Presale, Memecoin, Autre
   - **Asset**: Nom de l'asset (BTC, ETH, etc.)
   - **Plateforme**: Binance, Coinbase, etc.
   - **Quantité et prix**: Montant et prix unitaire
   - **Prix objectif**: Target de prix (optionnel)
   - **Prix actuel**: Pour calculer le profit/perte
   - **Presale**: Cocher si c'est une presale et ajouter la date de sortie + target
   - **Notes**: Commentaires additionnels
4. Cliquer sur "Ajouter"

Les statistiques du client se mettent à jour automatiquement.

### Changer de Devise

En haut à droite du header, cliquer sur USD, EUR ou CHF. Tous les montants se convertissent automatiquement.

### Changer de Mode (Clair/Sombre)

Cliquer sur l'icône soleil/lune dans le header.

## Structure du Projet

```
nm-crypto-app/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── public/
│   ├── assets/
│   │   ├── logos/
│   │   │   └── logo-nm.png
│   │   └── images/
│   │       ├── bg-website.png
│   │       └── bg-login.png
│   └── uploads/               # Photos de profil uploadées
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/     # Dashboard admin
│   │   │   └── clients/       # Gestion clients
│   │   ├── client/
│   │   │   └── dashboard/     # Dashboard client
│   │   ├── api/               # API routes
│   │   ├── login/             # Page de connexion
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/             # Composants admin
│   │   ├── client/            # Composants client
│   │   ├── layout/            # Header, etc.
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── auth.ts            # Configuration NextAuth
│   │   └── prisma.ts          # Client Prisma
│   └── types/
│       └── next-auth.d.ts     # Types NextAuth
├── .env.local                 # Variables d'environnement
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Base de Données

### Modèles Principaux

- **Admin**: Compte administrateur (Nefta)
- **Client**: Comptes clients gérés
- **ClientStats**: Statistiques calculées par client
- **Transaction**: Opérations d'achat/vente
- **GlobalStats**: Statistiques globales du portefeuille
- **PriceHistory**: Historique des prix (pour futures features)

## API Endpoints

### Admin
- `POST /api/admin/clients` - Créer un client
- `DELETE /api/admin/clients/[id]` - Supprimer un client
- `POST /api/admin/clients/[id]/transactions` - Ajouter une transaction

### Upload
- `POST /api/upload` - Upload de fichiers (avatars)

### Auth
- `POST /api/auth/[...nextauth]` - Authentification NextAuth

## Fonctionnalités Futures

### À Implémenter
- [ ] Charts interactifs avec filtres temporels (1D, 1W, 1M, 6M, 1Y)
- [ ] Intégration CoinMarketCap API pour prix en temps réel
- [ ] Dashboard global des cryptos
- [ ] Notifications par email
- [ ] Export PDF des rapports
- [ ] Historique des prix avec graphiques
- [ ] Multi-langues (FR, EN, ES)
- [ ] Système de sauvegarde automatique
- [ ] Analytics avancés

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- Sessions JWT avec NextAuth
- Validation des entrées côté serveur
- Protection CSRF intégrée
- Upload de fichiers sécurisé avec validation de type et taille

## Notes Importantes

1. **Base de données**: SQLite est utilisé pour le développement. Pour la production, migrer vers PostgreSQL ou MySQL.

2. **Uploads**: Les fichiers sont stockés dans `public/uploads`. Pour la production, utiliser un service cloud (AWS S3, Cloudinary, etc.).

3. **API Keys**: Les clés API (CoinMarketCap, OpenAI) sont dans `.env.local`. Ne jamais les committer.

4. **Performance**: Les calculs de statistiques se font à chaque ajout de transaction. Pour de gros volumes, implémenter un système de cache ou calcul asynchrone.

5. **Format des nombres**: Toujours afficher les valeurs exactes (pas de notation scientifique comme 1e-8).

## Support

Pour toute question ou problème:
- Vérifier les logs dans la console du navigateur
- Vérifier les logs serveur dans le terminal
- Vérifier la base de données avec `npx prisma studio`

## Auteur

Développé pour Neftali Manzambi - NM Crypto

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025
