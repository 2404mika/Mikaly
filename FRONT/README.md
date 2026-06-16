# SmartRestaurant Frontend

Frontend React + TypeScript + Tailwind CSS pour le système de gestion de restaurant SmartRestaurant.

## Stack Technique

- **React 18** avec TypeScript
- **Vite** pour le build rapide
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Socket.io-client** pour le temps réel

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Le serveur est accessible sur :
- **Local** : http://localhost:3000/
- **Réseau local** : http://<IP_DU_PC>:3000/ (pour scanner les QR codes avec le téléphone)

## Structure du Projet

```
src/
├── components/
│   ├── ui/          # Composants réutilisables (Button, Input)
│   └── layout/      # Layout components (TopNavBar, BottomNavBar, Footer)
├── pages/           # Pages de l'application
│   ├── Home.tsx     # Page d'accueil
│   ├── Login.tsx    # Page de connexion
│   └── Register.tsx # Page d'inscription
├── services/        # Services API
│   ├── api.ts       # Instance Axios configurée
│   ├── auth.ts      # Appels API authentication
│   ── meals.ts     # Appels API repas/catégories
├── context/         # Contexts React
│   └── AuthContext.tsx
├── hooks/           # Custom hooks
│   └── useMeals.ts
├── App.tsx
└── main.tsx
```

## Design System

### Couleurs
- **Primary** : `#306D29` (vert principal)
- **Secondary** : `#0D530E` (vert foncé)
- **Tertiary** : `#994267` (violet/rose)
- **Neutral** : `#747870` (gris)
- **Background** : `#F7F7F5` (fond chaud)

### Typographie
- **Headlines** : Source Serif 4
- **Body/UI** : Work Sans

### Composants
- Boutons : Primary (vert), Secondary (gris), Tertiary (violet), Ghost (transparent)
- Cards : Border radius 12-16px, ombres douces avec teinte verte
- Inputs : Bordure grise, focus ring vert

## Pages Implémentées

### 1. Home (`/`)
- Hero section avec image de fond et gradient
- Signature Dishes (Bento Grid) avec plats dynamiques depuis l'API
- Section Testimonials avec images
- Footer

### 2. Login (`/login`)
- Split-screen : visual gauche + formulaire droite
- Toggle entre Login et Register
- Formulaire avec validation
- Social login (Google, Apple)
- Connexion dynamique avec le backend

### 3. Register (`/register`)
- Même structure que Login
- Formulaire d'inscription complet
- Validation des mots de passe
- Inscription dynamique avec le backend

## API Backend

Le frontend se connecte au backend sur `http://localhost:5000/api` via le proxy Vite.

### Endpoints utilisés
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur
- `GET /api/meals` - Liste des plats
- `GET /api/categories` - Liste des catégories

## Authentification

Le token JWT est stocké dans `localStorage` et ajouté automatiquement aux requêtes via l'interceptor Axios.

## Responsive

- **Desktop** : 12 colonnes, 40px margins
- **Tablet** : 8 colonnes, 24px margins
- **Mobile** : 4 colonnes, 16px margins + BottomNavBar

## QR Code & Réseau Local

Pour que le téléphone du client puisse scanner le QR code et accéder à l'interface :
1. Le PC et le téléphone doivent être sur le même réseau WiFi
2. Le QR code contient l'URL : `http://<IP_DU_PC>:3000/menu?tableId=X`
3. Le frontend écoute sur `0.0.0.0` pour être accessible depuis le réseau

## Prochaines Étapes

- Page Menu (`/menu`) avec filtrage par catégorie
- Page Réservation (`/reservations`)
- Page Commande client (`/order`) avec panier
- Page Checkout (`/checkout`)
- Dashboard Admin
- Interface Cuisine
- Interface Livreur
- Interface Caissier
- Intégration Socket.io pour les mises à jour temps réel
