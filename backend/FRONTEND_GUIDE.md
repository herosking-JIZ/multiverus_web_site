# Guide Frontend — API Broadway Technologies

> Documentation pour développeur React junior.
> Base URL en développement : `http://localhost:8080/api/v1`

---

## Table des matières

1. [Configuration obligatoire — Axios](#1-configuration-obligatoire--axios)
2. [Authentification](#2-authentification)
3. [Médias — Images et Vidéos](#3-médias--images-et-vidéos)
4. [Services](#4-services)
5. [Produits](#5-produits)
6. [Références (Projets clients)](#6-références-projets-clients)
7. [Partenaires](#7-partenaires)
8. [Leads (Formulaire de contact)](#8-leads-formulaire-de-contact)
9. [Gestion des utilisateurs](#9-gestion-des-utilisateurs)
10. [Réinitialisation de mot de passe](#10-réinitialisation-de-mot-de-passe)
11. [Règles générales importantes](#11-règles-générales-importantes)

---

## 1. Configuration obligatoire — Axios

**À faire une seule fois avant tout le reste.**

```js
// src/lib/apiClient.js
import axios from 'axios';
import { getCsrfToken, fetchCsrfToken } from './csrf';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true,   // OBLIGATOIRE — envoie les cookies avec chaque requête
    headers: { 'Content-Type': 'application/json' },
});

// Injecte automatiquement le token CSRF sur chaque requête POST/PUT/PATCH/DELETE
apiClient.interceptors.request.use(async (config) => {
    const mutating = ['post', 'put', 'patch', 'delete'];
    if (mutating.includes(config.method)) {
        let token = getCsrfToken();
        if (!token) token = await fetchCsrfToken();
        config.headers['x-csrf-token'] = token;
    }
    return config;
});

// Si le token CSRF expire, en récupère un nouveau et réessaie
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 403 && !original._retry) {
            original._retry = true;
            original.headers['x-csrf-token'] = await fetchCsrfToken();
            return apiClient(original);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

```js
// src/lib/csrf.js
import apiClient from './apiClient';

let csrfToken = null;

export async function fetchCsrfToken() {
    const res = await apiClient.get('/csrf-token');
    csrfToken = res.data.csrfToken;
    return csrfToken;
}

export function getCsrfToken() {
    return csrfToken;
}
```

```jsx
// src/main.jsx — initialiser AVANT de monter l'app
import { fetchCsrfToken } from './lib/csrf';

fetchCsrfToken().then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
});
```

> **Règle absolue :** utilise toujours `apiClient`, jamais `fetch` ou `axios` directement.

---

## 2. Authentification

### Flux complet

```
1. GET  /csrf-token          → récupère le token (fait automatiquement au démarrage)
2. POST /auth/register       → créer un compte
3. POST /auth/login          → connexion → reçoit accessToken + refreshToken
4. Stocker accessToken en mémoire (variable JS) — jamais dans localStorage
5. Ajouter accessToken dans le header Authorization de chaque requête admin
6. POST /auth/refresh-token  → renouveler l'accessToken quand il expire
7. POST /auth/logout         → déconnexion
```

### Inscription — `POST /auth/register`

```js
const res = await apiClient.post('/auth/register', {
    nomComplet: 'Jean Dupont',     // requis | min 2, max 200 chars
    email:      'jean@gmail.com',  // requis | format email valide
    password:   'MonMot2Passe!',   // requis | min 8 chars, 1 majuscule, 1 chiffre, 1 spécial
});
// Réponse 201 : { success: true, message: "...", data: { id, nomComplet, email, role } }
```

Règle mot de passe — doit contenir **les 4 éléments** :
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (`!@#$%...`)

### Connexion — `POST /auth/login`

```js
const res = await apiClient.post('/auth/login', {
    email:    'jean@gmail.com',   // requis
    password: 'MonMot2Passe!',    // requis
});

const { accessToken, refreshToken, user } = res.data.data;

// Stocker en mémoire (pas localStorage !)
let ACCESS_TOKEN = accessToken;
localStorage.setItem('refreshToken', refreshToken); // le refresh peut aller en localStorage
```

> Après **5 tentatives échouées**, le compte est bloqué **15 minutes**.

### Requêtes authentifiées (admin)

```js
// Ajouter Bearer token sur chaque requête admin
const res = await apiClient.get('/admin/services', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

Ou configurer globalement dans l'intercepteur request de `apiClient` après connexion.

### Renouveler le token — `POST /auth/refresh-token`

```js
const res = await apiClient.post('/auth/refresh-token', {
    refreshToken: localStorage.getItem('refreshToken'),  // requis
});
ACCESS_TOKEN = res.data.data.accessToken;
```

À appeler quand une requête retourne **401**.

### Déconnexion — `POST /auth/logout`

```js
await apiClient.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
ACCESS_TOKEN = null;
localStorage.removeItem('refreshToken');
```

---

## 3. Médias — Images et Vidéos

### Vue d'ensemble des routes

| Méthode | Route | Usage |
|---------|-------|-------|
| `POST` | `/admin/medias/upload` | Upload générique (retourne un `id` à réutiliser) |
| `GET` | `/admin/medias` | Lister tous les médias |
| `PATCH` | `/admin/medias/:id` | Modifier uniquement le texte alternatif (`altText`) |
| `DELETE` | `/admin/medias/:id` | Supprimer un média |
| `PATCH` | `/admin/services/:id/media` | **Remplacer l'image d'un service** (atomique) |
| `PATCH` | `/admin/produits/:id/media` | **Remplacer l'image d'un produit** (atomique) |
| `PATCH` | `/admin/references/:id/media` | **Remplacer le logo d'une référence** (atomique) |
| `PATCH` | `/admin/partenaires/:id/media` | **Remplacer le logo d'un partenaire** (atomique) |

---

### Formats acceptés et tailles limites

| Type | Formats | Taille max |
|------|---------|------------|
| Images | JPG, PNG, WEBP | 100 MB |
| Documents | PDF, DOC, DOCX | 20 MB |
| Vidéos | MP4, WEBM, MOV, AVI, MKV, OGG, WMV, FLV, MPEG | 250 MB |

> Le champ fichier s'appelle toujours **`fichier`** dans le `FormData`. Ne pas changer ce nom.

---

### Objet `Media` retourné par l'API

```js
{
  id:          "550e8400-e29b-41d4-a716-446655440000",
  nomFichier:  "photo-agence.jpg",
  typeMime:    "image/jpeg",
  tailleOctets: 204800,
  url:         "http://localhost:8080/uploads/services/550e8400.jpg",
  cdnUrl:      "http://localhost:8080/uploads/services/550e8400.jpg",
  altText:     null,
  dossier:     "services",
  largeur:     null,
  hauteur:     null,
  uploadStatus: "UPLOADED",
  createdAt:   "2024-01-15T10:30:00.000Z",
  updatedAt:   "2024-01-15T10:30:00.000Z"
}
```

Dans un service/produit/référence/partenaire, le média est accessible dans le champ `image` ou `logo` :

```js
// Service ou Produit → champ "image"
service.image  // { id, url, cdnUrl, altText }

// Référence ou Partenaire → champ "logo"
partenaire.logo  // { id, url, cdnUrl, altText }
```

---

### Cas 1 — Associer une image lors de la CRÉATION d'une entité

Flux en 2 étapes : d'abord uploader, ensuite créer l'entité.

```
Étape 1 : Uploader le fichier
  POST /admin/medias/upload → reçoit { id: "uuid-media", url: "..." }

Étape 2 : Créer l'entité en passant l'id
  POST /admin/services → { titre: "...", imageId: "uuid-media" }
  POST /admin/produits → { nom: "...", imageId: "uuid-media" }
  POST /admin/references → { titre: "...", logoId: "uuid-media" }
  POST /admin/partenaires → { nom: "...", logoId: "uuid-media" }
```

**Étape 1 — Upload du fichier :**

```js
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);  // champ obligatoire
// "dossier" est optionnel ici — les routes de remplacement le gèrent automatiquement

const res = await apiClient.post('/admin/medias/upload', formData, {
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
    },
});

const mediaId = res.data.data.id;
const previewUrl = res.data.data.url;
```

**Étape 2 — Créer l'entité avec l'id du média :**

```js
// Exemple pour un service
await apiClient.post('/admin/services', {
    titre:       'Développement Web',
    description: 'Nous créons des sites sur mesure.',
    imageId:     mediaId,   // ← l'id récupéré à l'étape 1
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

---

### Cas 2 — Remplacer le média d'une entité EXISTANTE (1 seule requête)

Ces 4 routes font tout en une seule requête `multipart/form-data` :
1. Uploadent le nouveau fichier
2. Mettent à jour `imageId` ou `logoId` sur l'entité
3. Suppriment automatiquement l'ancien fichier et son enregistrement en base

> **Ne pas utiliser `POST /admin/medias/upload` pour ça** — utiliser directement la route de l'entité.

#### Remplacer l'image d'un service — `PATCH /admin/services/:id/media`

```js
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);

const res = await apiClient.patch(`/admin/services/${serviceId}/media`, formData, {
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
    },
});

// Réponse 200 :
// { success: true, message: "Image du service mise à jour.", data: { ...objetMedia } }
const nouvelleUrl = res.data.data.url;
```

#### Remplacer l'image d'un produit — `PATCH /admin/produits/:id/media`

```js
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);

const res = await apiClient.patch(`/admin/produits/${produitId}/media`, formData, {
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
    },
});
```

#### Remplacer le logo d'une référence — `PATCH /admin/references/:id/media`

```js
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);

const res = await apiClient.patch(`/admin/references/${referenceId}/media`, formData, {
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
    },
});
```

#### Remplacer le logo d'un partenaire — `PATCH /admin/partenaires/:id/media`

```js
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);

const res = await apiClient.patch(`/admin/partenaires/${partenaireId}/media`, formData, {
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
    },
});
```

#### Hook React réutilisable pour le remplacement

```jsx
// src/hooks/useReplaceMedia.js
import { useState } from 'react';
import apiClient from '../lib/apiClient';

export function useReplaceMedia() {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const replaceMedia = async (route, file, accessToken) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('fichier', file);

            const res = await apiClient.patch(route, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data.data;  // objet Media
        } catch (err) {
            setError(err.response?.data?.message ?? 'Erreur upload');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { replaceMedia, loading, error };
}
```

```jsx
// Utilisation dans un composant
function ServiceEditForm({ service, accessToken }) {
    const { replaceMedia, loading } = useReplaceMedia();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const newMedia = await replaceMedia(
            `/admin/services/${service.id}/media`,
            file,
            accessToken
        );
        console.log('Nouvelle URL :', newMedia.url);
    };

    return (
        <div>
            {service.image && <img src={service.image.url} alt={service.image.altText} />}
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
            {loading && <p>Upload en cours...</p>}
        </div>
    );
}
```

---

### Lister les médias — `GET /admin/medias`

```js
const res = await apiClient.get('/admin/medias', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
        page:     1,
        limit:    20,
        typeMime: 'image',    // optionnel — filtre partiel (ex: "image" matche "image/jpeg")
        dossier:  'services', // optionnel — filtre par sous-dossier exact
    },
});
// Réponse : { success: true, data: [...], total, page, limit, totalPages }
```

---

### Modifier le texte alternatif — `PATCH /admin/medias/:id`

Cette route ne modifie **que** le champ `altText`. Elle ne remplace pas le fichier.

```js
await apiClient.patch(`/admin/medias/${mediaId}`, {
    altText: 'Photo de l\'équipe BZT',  // requis | max 300 chars | null autorisé
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

---

### Supprimer un média — `DELETE /admin/medias/:id`

```js
await apiClient.delete(`/admin/medias/${mediaId}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
// Supprime le fichier du disque ET l'enregistrement en base
```

> **À savoir :** supprimer un média met `imageId`/`logoId` à `null` sur toutes les entités qui l'utilisaient. Pas d'erreur, mais l'image disparaît partout.

---

### Afficher une image côté public

```jsx
// Service ou Produit → champ "image"
{service.image && (
    <img
        src={service.image.cdnUrl ?? service.image.url}
        alt={service.image.altText ?? service.titre}
    />
)}

// Référence ou Partenaire → champ "logo"
{partenaire.logo && (
    <img
        src={partenaire.logo.cdnUrl ?? partenaire.logo.url}
        alt={partenaire.logo.altText ?? partenaire.nom}
    />
)}
```

> Toujours préférer `cdnUrl` à `url` — en production `cdnUrl` pointe vers le CDN, plus rapide.

---

### Récapitulatif — Quel endpoint utiliser ?

| Situation | Route à appeler |
|-----------|----------------|
| Créer une entité avec image | `POST /admin/medias/upload` → récupérer l'id → le passer dans `imageId`/`logoId` à la création |
| Changer l'image d'une entité existante | `PATCH /admin/{entité}/:id/media` directement |
| Modifier juste le texte alternatif | `PATCH /admin/medias/:id` avec `{ altText }` |
| Supprimer définitivement un fichier | `DELETE /admin/medias/:id` |
| Voir tous les fichiers uploadés | `GET /admin/medias` |

---

## 4. Services

### Flux recommandé pour créer un service avec image

```
1. POST /admin/medias/upload → récupère imageId
2. POST /admin/services      → envoie { titre, description, imageId }
3. GET  /services            → affiche côté public
```

### Créer — `POST /admin/services`

```js
const res = await apiClient.post('/admin/services', {
    titre:       'Développement Web',  // requis | min 2, max 200 chars
    description: 'Nous développons...', // requis | min 10 chars
    icone:       'code',               // optionnel | nom d'icône (ex: Lucide, FontAwesome)
    imageId:     'uuid-du-media',      // optionnel | UUID d'un média uploadé
    ordre:       0,                    // optionnel | entier >= 0, défaut 0
    actif:       true,                 // optionnel | défaut true
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Lister (public) — `GET /services`

```js
const res = await apiClient.get('/services', {
    params: { page: 1, limit: 20, actif: 'true' }
});
// Réponse : { data: [{ id, titre, slug, description, icone, ordre, image: {...} }], total, ... }
```

### Lister (admin) — `GET /admin/services`

```js
const res = await apiClient.get('/admin/services', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: { page: 1, limit: 20, actif: 'true' } // actif: 'true' | 'false' | absent = tous
});
```

### Détail — `GET /services/:slug` ou `GET /admin/services/:id`

```js
// Public — par slug
const res = await apiClient.get('/services/developpement-web');

// Admin — par UUID
const res = await apiClient.get(`/admin/services/${id}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Modifier — `PATCH /admin/services/:id`

```js
await apiClient.patch(`/admin/services/${id}`, {
    titre: 'Nouveau titre',  // au moins 1 champ requis
    actif: false,
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Réordonner — `PATCH /admin/services/reorder`

```js
// Envoyer les IDs dans l'ordre voulu (index 0 = ordre 0)
await apiClient.patch('/admin/services/reorder', {
    ids: ['uuid-1', 'uuid-2', 'uuid-3'],  // requis | tableau d'UUIDs
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Supprimer — `DELETE /admin/services/:id`

```js
await apiClient.delete(`/admin/services/${id}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
// Soft delete : actif passe à false, le service disparaît du public
```

---

## 5. Produits

### Créer — `POST /admin/produits`

```js
const res = await apiClient.post('/admin/produits', {
    nom:         'Solution CRM',         // requis | min 2, max 200 chars
    description: 'Notre solution CRM...', // requis | min 10 chars
    categorie:   'Logiciel',             // requis | max 100 chars
    statut:      'ACTIF',                // optionnel | 'NOUVEAU' | 'ACTIF' | 'ARCHIVE' — défaut 'ACTIF'
    features:    ['Module A', 'Module B'], // optionnel | tableau de strings, chaque max 300 chars
    imageId:     'uuid-du-media',        // optionnel | UUID d'un média uploadé
    actif:       true,                   // optionnel | défaut true
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

**Valeurs valides pour `statut` :**
- `NOUVEAU` — badge "Nouveau" côté public
- `ACTIF` — affiché normalement
- `ARCHIVE` — masqué du public (même logique que `actif: false`)

### Lister (public) — `GET /produits`

```js
const res = await apiClient.get('/produits', {
    params: {
        page:      1,
        limit:     20,
        categorie: 'Logiciel',  // optionnel
    }
});
// Seuls les produits actif=true ET statut != ARCHIVE sont retournés
```

### Modifier — `PATCH /admin/produits/:id`

```js
await apiClient.patch(`/admin/produits/${id}`, {
    statut: 'ARCHIVE',  // au moins 1 champ requis
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Supprimer — `DELETE /admin/produits/:id`

```js
await apiClient.delete(`/admin/produits/${id}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
// Soft delete : actif=false ET statut=ARCHIVE
```

---

## 6. Références (Projets clients)

### Créer — `POST /admin/references`

```js
const res = await apiClient.post('/admin/references', {
    titre:           'Refonte site BankXYZ',      // requis | min 2, max 300 chars
    client:          'BankXYZ',                   // requis | min 2, max 200 chars
    secteur:         'Finance',                   // requis | max 150 chars
    description:     'Nous avons refait...',      // requis | min 10 chars
    technologies:    ['React', 'Node.js', 'AWS'], // optionnel | tableau de strings max 100 chars
    logoId:          'uuid-du-media',             // optionnel | UUID d'un média uploadé
    dateRealisation: '2025-03-15',                // optionnel | format ISO YYYY-MM-DD
    publie:          true,                        // optionnel | défaut true
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

> **Erreur fréquente :** ne pas envoyer `logoClientUrl` (URL directe). Le backend attend `logoId` (UUID d'un média déjà uploadé).

### Lister (public) — `GET /references`

```js
const res = await apiClient.get('/references', {
    params: {
        page:    1,
        limit:   20,
        secteur: 'Finance', // optionnel — recherche insensible à la casse
    }
});
// Seules les références publie=true sont retournées
```

### Lister (admin) — `GET /admin/references`

```js
const res = await apiClient.get('/admin/references', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
        page:   1,
        limit:  20,
        publie: 'true',     // optionnel | 'true' | 'false'
        secteur: 'Finance', // optionnel
    }
});
```

### Supprimer — `DELETE /admin/references/:id`

```js
await apiClient.delete(`/admin/references/${id}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
// Hard delete — suppression définitive (pas de soft delete ici)
```

---

## 7. Partenaires

### Créer — `POST /admin/partenaires`

```js
const res = await apiClient.post('/admin/partenaires', {
    nom:     'Partenaire ABC',          // requis | min 2, max 200 chars
    logoId:  'uuid-du-media',           // optionnel | UUID d'un média uploadé
    siteWeb: 'https://partenaire.com',  // optionnel | URL valide, max 300 chars
    ordre:   0,                         // optionnel | entier >= 0, défaut 0
    actif:   true,                      // optionnel | défaut true
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Lister (public) — `GET /partenaires`

```js
const res = await apiClient.get('/partenaires');
// Retourne tous les partenaires actifs, ordonnés par ordre ASC
// Pas de pagination sur le public
```

### Réordonner — `PATCH /admin/partenaires/reorder`

```js
await apiClient.patch('/admin/partenaires/reorder', {
    ids: ['uuid-1', 'uuid-2', 'uuid-3'],
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

---

## 8. Leads (Formulaire de contact)

### Flux

```
Visiteur remplit le formulaire
    ↓
POST /contact  (public, pas de token)
    ↓
Lead créé en base + email de notification envoyé à l'équipe
    ↓
Admin gère les leads dans /admin/leads
```

### Soumettre le formulaire — `POST /contact`

```js
// Route publique — pas de token nécessaire
const res = await apiClient.post('/contact', {
    nomComplet:   'Marie Martin',         // requis | min 2, max 200 chars
    email:        'marie@gmail.com',      // requis | format email valide
    organisation: 'Entreprise SA',        // optionnel | max 200 chars
    sujet:        'Demande de devis',     // requis | max 200 chars
    message:      'Bonjour, je souhaite...', // requis | min 10, max 2000 chars
});
```

> **Rate limit :** 5 soumissions maximum par IP par minute. Au-delà → 429.

### Lister les leads — `GET /admin/leads`

```js
const res = await apiClient.get('/admin/leads', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: {
        page:   1,
        limit:  20,
        statut: 'NOUVEAU',       // optionnel | 'NOUVEAU' | 'EN_COURS' | 'TRAITE' | 'ARCHIVE'
        from:   '2025-01-01',    // optionnel | date début (ISO)
        to:     '2025-12-31',    // optionnel | date fin (ISO)
    }
});
```

### Mettre à jour le statut — `PATCH /admin/leads/:id/statut`

```js
await apiClient.patch(`/admin/leads/${id}/statut`, {
    statut: 'EN_COURS',  // requis | 'NOUVEAU' | 'EN_COURS' | 'TRAITE' | 'ARCHIVE'
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Ajouter une note interne — `PATCH /admin/leads/:id/notes`

```js
await apiClient.patch(`/admin/leads/${id}/notes`, {
    notes: 'Client contacté par téléphone le 24/04.',  // requis | min 1, max 5000 chars
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Exporter en CSV — `GET /admin/leads/export`

```js
const res = await apiClient.get('/admin/leads/export', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    params: { statut: 'TRAITE', from: '2025-01-01' }, // mêmes filtres que la liste
    responseType: 'blob', // important pour télécharger un fichier
});

// Téléchargement automatique
const url = URL.createObjectURL(res.data);
const a = document.createElement('a');
a.href = url;
a.download = 'leads.csv';
a.click();
```

---

## 9. Gestion des utilisateurs

> Toutes les routes nécessitent un token **avec rôle ADMIN**.

### Lister — `GET /admin/users`

```js
const res = await apiClient.get('/admin/users', {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Créer un utilisateur — `POST /admin/users`

```js
await apiClient.post('/admin/users', {
    email:      'nouveau@gmail.com',  // requis | format email valide
    motDePasse: 'MonMot2Passe!',      // requis | min 8 chars
    nomComplet: 'Nouveau Admin',      // requis
    role:       'ADMIN',              // optionnel | seule valeur acceptée : 'ADMIN'
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Modifier — `PATCH /admin/users/:id`

```js
await apiClient.patch(`/admin/users/${id}`, {
    nomComplet: 'Nouveau Nom',  // optionnel
    role:       'ADMIN',        // optionnel
    actif:      false,          // optionnel | boolean
}, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
```

### Désactiver — `DELETE /admin/users/:id`

```js
await apiClient.delete(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
});
// Soft delete — l'utilisateur ne peut plus se connecter
```

---

## 10. Réinitialisation de mot de passe

### Flux complet

```
1. POST /auth/forgot-password  → envoie email avec lien contenant le token
2. Utilisateur clique le lien  → page reset avec token dans l'URL
3. POST /auth/reset-password   → nouveau mot de passe + token
```

### Demander un reset — `POST /auth/forgot-password`

```js
await apiClient.post('/auth/forgot-password', {
    email: 'jean@gmail.com',  // requis | format email valide
});
// Toujours 200, même si l'email n'existe pas (sécurité anti-énumération)
```

> **Rate limit :** 3 requêtes par minute.

### Réinitialiser — `POST /auth/reset-password`

```js
await apiClient.post('/auth/reset-password', {
    token:              'token-recu-par-email',  // requis
    motDePasse:         'NouveauMot2Passe!',     // requis | mêmes règles que le mot de passe
    confirmMotDePasse:  'NouveauMot2Passe!',     // requis | doit être identique à motDePasse
});
// Le token expire après 15 minutes
// Toutes les sessions existantes sont invalidées après reset
```

---

## 11. Règles générales importantes

### Pagination

Toutes les routes de liste retournent ce format :
```json
{
  "success": true,
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

Paramètres disponibles sur toutes les routes paginées :
```js
params: { page: 1, limit: 20 }  // limit max: 100
```

### Format des erreurs

```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

| Code HTTP | Signification |
|-----------|--------------|
| 400 | Données invalides (type, format) |
| 401 | Non authentifié (token manquant ou expiré) |
| 403 | Interdit (token CSRF invalide, ou rôle insuffisant) |
| 404 | Ressource introuvable |
| 422 | Validation échouée (champ manquant, règle non respectée) |
| 429 | Trop de requêtes (rate limit) |
| 500 | Erreur serveur |

### Champs communs à tous les objets retournés

```json
{
  "id":        "uuid",
  "createdAt": "2025-04-24T10:00:00.000Z",
  "updatedAt": "2025-04-24T10:00:00.000Z"
}
```

### Afficher une image retournée par l'API

```jsx
// L'objet image est toujours de cette forme :
// { id, url, cdnUrl, altText }

function ServiceCard({ service }) {
    return (
        <div>
            <h2>{service.titre}</h2>
            {service.image && (
                <img
                    src={service.image.url}
                    alt={service.image.altText || service.titre}
                />
            )}
        </div>
    );
}
```

### Modules qui ont une image/logo associée

| Module | Champ dans la requête | Champ dans la réponse |
|--------|-----------------------|-----------------------|
| Service | `imageId` (UUID) | `image` (objet Media) |
| Produit | `imageId` (UUID) | `image` (objet Media) |
| Référence | `logoId` (UUID) | `logo` (objet Media) |
| Partenaire | `logoId` (UUID) | `logo` (objet Media) |

**Dans tous les cas :** uploader d'abord avec `POST /admin/medias/upload`, récupérer l'`id`, puis l'envoyer dans le champ correspondant.
