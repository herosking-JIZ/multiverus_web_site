# Broadway Technologies — Documentation API

**Version :** 1.0  
**Base URL :** `https://api.broadway-technologies.com/api/v1`  
**Format :** JSON (sauf export CSV)  
**Encodage :** UTF-8

---

## Table des matières

1. [Conventions générales](#1-conventions-générales)
2. [Authentification](#2-authentification)
3. [Gestion des erreurs](#3-gestion-des-erreurs)
4. [Services](#4-services)
5. [Produits](#5-produits)
6. [Références / Projets](#6-références--projets)
7. [Partenaires](#7-partenaires)
8. [Leads / Contact](#8-leads--contact)
9. [Médias](#9-médias)
10. [Analytics](#10-analytics)

---

## 1. Conventions générales

### URL de base

```
https://api.broadway-technologies.com/api/v1
```

### Headers communs

```http
Content-Type: application/json
Accept: application/json
```

Pour les routes protégées, ajouter :

```http
Authorization: Bearer <accessToken>
X-CSRF-TOKEN: <csrfToken>
```

### Protection CSRF

Toutes les requêtes qui modifient l'état (POST, PATCH, DELETE) nécessitent un token CSRF.

**Étape 1 — Obtenir le token :**

```http
GET /api/v1/csrf-token
```

**Réponse :**
```json
{
  "success": true,
  "csrfToken": "abc123..."
}
```

**Étape 2 — Inclure le token dans chaque requête mutante :**

```http
X-CSRF-TOKEN: abc123...
```

> Le token CSRF est lié à la session. Il doit être récupéré une fois au démarrage de l'application et réutilisé.

### Format des réponses

**Succès :**
```json
{
  "success": true,
  "message": "Opération réussie.",
  "data": { ... }
}
```

**Liste paginée :**
```json
{
  "success": true,
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Description de l'erreur."
}
```

### Pagination

Tous les endpoints de liste acceptent ces query params :

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `page` | integer | `1` | Numéro de page |
| `limit` | integer | `20` | Éléments par page (max 100) |

---

## 2. Authentification

### POST /auth/register

Crée un compte administrateur (limité à 10 comptes max).

**Body :**
```json
{
  "nomComplet": "Jean Dupont",
  "email": "jean@broadway.com",
  "password": "MonMot2Passe!"
}
```

> Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Utilisateur enregistré avec succès",
  "data": {
    "id": "uuid",
    "nomComplet": "Jean Dupont",
    "email": "jean@broadway.com",
    "role": "ADMIN"
  }
}
```

---

### POST /auth/login

**Body :**
```json
{
  "email": "jean@broadway.com",
  "password": "MonMot2Passe!"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "nomComplet": "Jean Dupont",
      "email": "jean@broadway.com",
      "role": "ADMIN",
      "lastLogin": "2026-04-16T10:00:00.000Z"
    },
    "accessToken": "eyJhbGci..."
  }
}
```

> Le `refreshToken` est stocké automatiquement dans un cookie HTTP-Only sécurisé. Ne pas le manipuler côté JS.

**Sécurité :** Après 5 tentatives échouées, le compte est bloqué 15 minutes.

---

### POST /auth/refresh-token

Renouvelle l'access token en utilisant le refresh token (cookie automatique).

**Body :**
```json
{
  "refreshToken": "valeur_depuis_cookie_si_besoin"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

---

### POST /auth/logout

**Headers :** `Authorization: Bearer <accessToken>`

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### POST /auth/logout-global

Révoque toutes les sessions actives.

**Headers :** `Authorization: Bearer <accessToken>`

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Déconnexion globale réussie."
}
```

---

### POST /password/forgot-password

Envoie un email de réinitialisation.

**Body :**
```json
{
  "email": "jean@broadway.com"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé si le compte existe."
}
```

---

### POST /password/reset-password

**Body :**
```json
{
  "token": "token_reçu_par_email",
  "motDePasse": "NouveauMot2Passe!",
  "confirmMotDePasse": "NouveauMot2Passe!"
}
```

---

## 3. Gestion des erreurs

| Code HTTP | Signification |
|---|---|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Données invalides / type de fichier non autorisé |
| `401` | Non authentifié (token absent ou expiré) |
| `403` | Accès refusé (token CSRF invalide ou rôle insuffisant) |
| `404` | Ressource introuvable |
| `409` | Conflit (ex : slug ou email déjà utilisé) |
| `422` | Erreur de validation des champs |
| `429` | Trop de requêtes (rate limiting) |
| `500` | Erreur interne serveur |

**Erreur de validation (422) :**
```json
{
  "statut": "erreur",
  "message": "Données invalides",
  "erreurs": [
    { "champ": "email", "message": "email must be a valid email" },
    { "champ": "password", "message": "password is required" }
  ]
}
```

---

## 4. Services

### Routes publiques

---

#### GET /services

Retourne la liste des services actifs, triés par ordre.

**Query params :**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Numéro de page (défaut : 1) |
| `limit` | integer | Éléments par page (défaut : 20) |

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titre": "Développement Web",
      "slug": "developpement-web",
      "description": "Création de sites et applications web sur mesure.",
      "icone": "code",
      "imageUrl": "https://cdn.broadway.com/services/dev-web.jpg",
      "ordre": 0
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

#### GET /services/:slug

**Paramètre :** `slug` — ex: `developpement-web`

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "titre": "Développement Web",
    "slug": "developpement-web",
    "description": "...",
    "icone": "code",
    "imageUrl": "https://cdn.broadway.com/services/dev-web.jpg",
    "ordre": 0
  }
}
```

---

### Routes admin

> Toutes les routes `/admin/*` nécessitent `Authorization: Bearer <token>` et `X-CSRF-TOKEN`.

---

#### POST /admin/services

**Body :**
```json

{
  "titre": "Développement Web",
  "description": "Création de sites et applications web sur mesure.",
  "icone": "code",
  "imageUrl": "https://cdn.broadway.com/services/dev-web.jpg",
  "ordre": 0,
  "actif": true
}


```

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `titre` | string | Oui | 2–200 caractères |
| `description` | string | Oui | Min 10 caractères |
| `icone` | string | Non | Max 100 caractères |
| `imageUrl` | string (URL) | Non | |
| `ordre` | integer | Non | Défaut : 0 |
| `actif` | boolean | Non | Défaut : `true` |

> Le `slug` est généré automatiquement depuis le `titre`. Il n'est pas modifiable après création.

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Service créé avec succès.",
  "data": {
    "id": "uuid",
    "titre": "Développement Web",
    "slug": "developpement-web",
    "description": "...",
    "icone": "code",
    "imageUrl": null,
    "ordre": 0,
    "actif": true,
    "modifiePar": "uuid-admin",
    "createdAt": "2026-04-16T10:00:00.000Z",
    "updatedAt": "2026-04-16T10:00:00.000Z"
  }
}
```

---

#### GET /admin/services

**Query params :**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `actif` | `true` / `false` | Filtre par statut actif |

**Réponse 200 :** Liste paginée complète (tous les champs).

---

#### GET /admin/services/:id

**Paramètre :** `id` — UUID ou slug

**Réponse 200 :** Objet service complet.

---

#### PATCH /admin/services/:id

Tous les champs sont optionnels. Le `slug` n'est pas modifiable.

**Body :**
```json
{
  "titre": "Développement Web & Mobile",
  "actif": false
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Service mis à jour.",
  "data": { ... }
}
```

---

#### DELETE /admin/services/:id

Soft delete — passe `actif` à `false`. La ressource n'est pas supprimée physiquement.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Service désactivé."
}
```

---

#### PATCH /admin/services/reorder

Réordonne les services par drag & drop. Envoyer le tableau complet des IDs dans l'ordre souhaité.

**Body :**
```json
{
  "ids": [
    "uuid-service-3",
    "uuid-service-1",
    "uuid-service-2"
  ]
}
```

> L'index dans le tableau devient le champ `ordre` de chaque service (0, 1, 2…).

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Ordre des services mis à jour."
}
```

---

## 5. Produits

### Routes publiques

---

#### GET /produits

**Query params :**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `categorie` | string | Filtre par catégorie |

Retourne uniquement les produits `actif = true` et `statut ≠ ARCHIVE`.

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nom": "Broadway CRM",
      "slug": "broadway-crm",
      "description": "Solution CRM sur mesure.",
      "categorie": "Logiciel",
      "statut": "ACTIF",
      "features": ["Gestion contacts", "Pipeline ventes", "Reporting"],
      "imageUrl": "https://cdn.broadway.com/produits/crm.jpg"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

#### GET /produits/:slug

**Réponse 200 :** Objet produit public (sans champs admin).

---

### Routes admin

---

#### POST /admin/produits

**Body :**
```json
{
  "nom": "Broadway CRM",
  "description": "Solution CRM sur mesure pour les PME.",
  "categorie": "Logiciel",
  "statut": "ACTIF",
  "features": ["Gestion contacts", "Pipeline ventes", "Reporting"],
  "imageUrl": "https://cdn.broadway.com/produits/crm.jpg",
  "actif": true
}
```

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `nom` | string | Oui | 2–200 caractères |
| `description` | string | Oui | Min 10 caractères |
| `categorie` | string | Oui | Max 100 caractères |
| `statut` | string | Non | `NOUVEAU` / `ACTIF` / `ARCHIVE` — défaut : `ACTIF` |
| `features` | string[] | Non | Tableau de strings |
| `imageUrl` | string (URL) | Non | |
| `actif` | boolean | Non | Défaut : `true` |

---

#### GET /admin/produits

**Query params :** `page`, `limit`, `categorie`, `statut`, `actif`

---

#### GET /admin/produits/:id

**Paramètre :** `id` — UUID ou slug

---

#### PATCH /admin/produits/:id

Tous les champs sont optionnels sauf qu'au moins un est requis.

---

#### DELETE /admin/produits/:id

Soft delete — passe `actif = false` et `statut = ARCHIVE`.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Produit archivé."
}
```

---

## 6. Références / Projets

### Routes publiques

---

#### GET /references

Retourne les projets publiés (`publie = true`).

**Query params :** `page`, `limit`, `secteur`

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "titre": "Refonte SI — Orange Burkina",
      "client": "Orange Burkina Faso",
      "secteur": "Télécommunications",
      "description": "Migration et modernisation du système d'information.",
      "technologies": ["Node.js", "PostgreSQL", "React", "Docker"],
      "logoClientUrl": "https://cdn.broadway.com/clients/orange.png",
      "dateRealisation": "2025-12-01"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### Routes admin

---

#### POST /admin/references

**Body :**
```json
{
  "titre": "Refonte SI — Orange Burkina",
  "client": "Orange Burkina Faso",
  "secteur": "Télécommunications",
  "description": "Migration et modernisation du système d'information.",
  "technologies": ["Node.js", "PostgreSQL", "React"],
  "logoClientUrl": "https://cdn.broadway.com/clients/orange.png",
  "dateRealisation": "2025-12-01",
  "publie": true
}
```

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `titre` | string | Oui | 2–300 caractères |
| `client` | string | Oui | 2–200 caractères |
| `secteur` | string | Oui | Max 150 caractères |
| `description` | string | Oui | Min 10 caractères |
| `technologies` | string[] | Non | Tableau de strings |
| `logoClientUrl` | string (URL) | Non | |
| `dateRealisation` | string (ISO date) | Non | Ex : `2025-12-01` |
| `publie` | boolean | Non | Défaut : `true` |

---

#### GET /admin/references

**Query params :** `page`, `limit`, `secteur`, `publie`

---

#### GET /admin/references/:id

---

#### PATCH /admin/references/:id

Tous les champs optionnels (min 1 requis).

---

#### DELETE /admin/references/:id

Suppression physique (hard delete).

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Référence supprimée."
}
```

---

## 7. Partenaires

### Routes publiques

---

#### GET /partenaires

Retourne tous les partenaires actifs, triés par `ordre`.

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nom": "Microsoft",
      "logoUrl": "https://cdn.broadway.com/partenaires/microsoft.png",
      "siteWeb": "https://microsoft.com",
      "ordre": 0
    }
  ]
}
```

---

### Routes admin

---

#### POST /admin/partenaires

**Body :**
```json
{
  "nom": "Microsoft",
  "logoUrl": "https://cdn.broadway.com/partenaires/microsoft.png",
  "siteWeb": "https://microsoft.com",
  "ordre": 0,
  "actif": true
}
```

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `nom` | string | Oui | 2–200 caractères |
| `logoUrl` | string (URL) | Non | |
| `siteWeb` | string (URL) | Non | |
| `ordre` | integer | Non | Défaut : 0 |
| `actif` | boolean | Non | Défaut : `true` |

---

#### GET /admin/partenaires

**Query params :** `page`, `limit`, `actif`

---

#### GET /admin/partenaires/:id

---

#### PATCH /admin/partenaires/:id

---

#### DELETE /admin/partenaires/:id

Soft delete — passe `actif = false`.

---

#### PATCH /admin/partenaires/reorder

Même logique que les services.

**Body :**
```json
{
  "ids": ["uuid-3", "uuid-1", "uuid-2"]
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Ordre des partenaires mis à jour."
}
```

---

## 8. Leads / Contact

### Route publique

---

#### POST /contact

Soumet le formulaire de contact. Envoie automatiquement un email de notification à l'équipe.

**Rate limit : 5 requêtes / minute / IP.**

**Body :**
```json
{
  "nomComplet": "Marie Kaboré",
  "email": "marie@entreprise.bf",
  "organisation": "Entreprise SA",
  "sujet": "Demande de devis application mobile",
  "message": "Bonjour, nous souhaitons développer une application mobile pour..."
}
```

| Champ | Type | Requis | Contraintes |
|---|---|---|---|
| `nomComplet` | string | Oui | 2–200 caractères |
| `email` | string (email) | Oui | Format email valide |
| `organisation` | string | Non | Max 200 caractères |
| `sujet` | string | Oui | Max 200 caractères |
| `message` | string | Oui | 10–2000 caractères |

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.",
  "data": {
    "id": "uuid"
  }
}
```

**Réponse 429 (rate limit) :**
```json
{
  "success": false,
  "message": "Trop de tentatives. Veuillez patienter une minute avant de réessayer."
}
```

---

### Routes admin

---

#### GET /admin/leads

**Query params :**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `statut` | string | `NOUVEAU` / `EN_COURS` / `TRAITE` / `ARCHIVE` |
| `from` | string (ISO date) | Date de début (`createdAt >= from`) |
| `to` | string (ISO date) | Date de fin (`createdAt <= to`) |

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nomComplet": "Marie Kaboré",
      "email": "marie@entreprise.bf",
      "organisation": "Entreprise SA",
      "sujet": "Demande de devis",
      "statut": "NOUVEAU",
      "createdAt": "2026-04-16T10:30:00.000Z",
      "updatedAt": "2026-04-16T10:30:00.000Z"
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

#### GET /admin/leads/:id

Retourne le lead complet (avec message intégral et notes internes).

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nomComplet": "Marie Kaboré",
    "email": "marie@entreprise.bf",
    "organisation": "Entreprise SA",
    "sujet": "Demande de devis application mobile",
    "message": "Bonjour, nous souhaitons développer...",
    "statut": "EN_COURS",
    "notesInternes": "RDV planifié le 20/04",
    "ipAdresse": "196.200.x.x",
    "traitePar": "uuid-admin",
    "createdAt": "2026-04-16T10:30:00.000Z",
    "updatedAt": "2026-04-16T14:00:00.000Z"
  }
}
```

---

#### PATCH /admin/leads/:id/statut

**Body :**
```json
{
  "statut": "EN_COURS"
}
```

Valeurs acceptées : `NOUVEAU`, `EN_COURS`, `TRAITE`, `ARCHIVE`

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Statut du lead mis à jour.",
  "data": { ... }
}
```

---

#### PATCH /admin/leads/:id/notes

**Body :**
```json
{
  "notes": "Appel effectué le 17/04. Client intéressé, devis à envoyer."
}
```

> Remplace les notes existantes (non cumulatif). Pour conserver l'historique, inclure le texte précédent dans la valeur envoyée.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Note ajoutée.",
  "data": { ... }
}
```

---

#### DELETE /admin/leads/:id

Suppression physique (hard delete).

---

#### GET /admin/leads/export

Télécharge les leads au format CSV (compatible Excel avec BOM UTF-8).

**Query params :** `statut`, `from`, `to` (mêmes filtres que la liste)

**Headers de réponse :**
```http
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="leads-2026-04-16.csv"
```

**Colonnes CSV :**
`ID`, `Nom`, `Email`, `Organisation`, `Sujet`, `Message`, `Statut`, `Notes internes`, `IP`, `Date création`

---

## 9. Médias

> Toutes les routes médias sont admin-only.

---

#### POST /admin/medias/upload

Upload d'un fichier vers Cloudflare R2.

**Content-Type :** `multipart/form-data` (pas JSON)

**Form fields :**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `fichier` | File | Oui | Le fichier à uploader |
| `dossier` | string | Non | Sous-dossier de rangement (ex: `services`, `produits`) |

**Types autorisés :**

| Type MIME | Extension | Taille max |
|---|---|---|
| `image/jpeg` | `.jpg` / `.jpeg` | 5 MB |
| `image/png` | `.png` | 5 MB |
| `image/webp` | `.webp` | 5 MB |
| `application/pdf` | `.pdf` | 20 MB |

**Exemple fetch JavaScript :**
```javascript
const formData = new FormData();
formData.append('fichier', fileInput.files[0]);
formData.append('dossier', 'services');

const response = await fetch('/api/v1/admin/medias/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'X-CSRF-TOKEN': csrfToken,
    // Ne pas définir Content-Type — le navigateur le fait automatiquement avec boundary
  },
  body: formData,
});
```

**Réponse 201 :**
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès.",
  "data": {
    "id": "uuid",
    "nomFichier": "logo-client.png",
    "typeMime": "image/png",
    "tailleOctets": 245760,
    "url": "https://cdn.broadway.com/services/1713261600000-a1b2c3d4e5f6.png",
    "altText": null,
    "dossier": "services",
    "uploadePar": "uuid-admin",
    "createdAt": "2026-04-16T10:00:00.000Z"
  }
}
```

> Utiliser `data.url` comme valeur pour `imageUrl` / `logoUrl` dans les autres modules.

---

#### GET /admin/medias

**Query params :**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Numéro de page |
| `limit` | integer | Éléments par page |
| `typeMime` | string | Ex: `image`, `application/pdf` |
| `dossier` | string | Ex: `services`, `produits` |

**Réponse 200 :** Liste paginée des médias.

---

#### PATCH /admin/medias/:id

Modifie le texte alternatif d'un média (accessibilité / SEO).

**Body :**
```json
{
  "altText": "Logo du partenaire Microsoft"
}
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Texte alternatif mis à jour.",
  "data": { ... }
}
```

---

#### DELETE /admin/medias/:id

Supprime le média en base **et** sur le stockage R2.

> Vérifier qu'aucune entité n'utilise l'URL avant suppression.

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Média supprimé."
}
```

---

## 10. Analytics

### Route publique

---

#### POST /analytics/event

Enregistre un événement de navigation (appelé par le script de tracking frontend).

**Rate limit : 120 requêtes / minute / IP.**

**Body :**
```json
{
  "sessionId": "uuid-v4-généré-côté-client",
  "pagePath": "/services/developpement-web",
  "evenement": "PAGEVIEW",
  "dureeSecondes": 45,
  "referrer": "https://google.com"
}
```

| Champ | Type | Requis | Valeurs |
|---|---|---|---|
| `sessionId` | string (UUID v4) | Oui | Généré une fois par session, stocké en `sessionStorage` |
| `pagePath` | string | Oui | Chemin de la page (sans domaine) |
| `evenement` | string | Oui | `PAGEVIEW` / `CLICK` / `DOWNLOAD` / `FORM_SUBMIT` |
| `dureeSecondes` | integer | Non | Durée passée sur la page |
| `referrer` | string | Non | URL complète de la source |

**Réponse 201 :**
```json
{
  "success": true
}
```

**Exemple d'intégration tracking :**
```javascript
// Générer ou récupérer le sessionId
let sessionId = sessionStorage.getItem('bzt_session_id');
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem('bzt_session_id', sessionId);
}

// Tracker une page vue
async function trackPageView(path) {
  await fetch('/api/v1/analytics/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
      sessionId,
      pagePath: path,
      evenement: 'PAGEVIEW',
      referrer: document.referrer || null,
    }),
  });
}

// Tracker un téléchargement
async function trackDownload(filePath) {
  await fetch('/api/v1/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
    body: JSON.stringify({ sessionId, pagePath: filePath, evenement: 'DOWNLOAD' }),
  });
}
```

---

### Route admin

---

#### GET /admin/analytics/dashboard

Retourne les KPIs agrégés pour une période donnée.

**Query params :**

| Param | Type | Description |
|---|---|---|
| `from` | string (ISO date) | Date de début — défaut : 30 jours avant aujourd'hui |
| `to` | string (ISO date) | Date de fin — défaut : aujourd'hui |

**Exemple :** `GET /admin/analytics/dashboard?from=2026-04-01&to=2026-04-30`

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "periode": {
      "from": "2026-04-01T00:00:00.000Z",
      "to": "2026-04-30T00:00:00.000Z"
    },
    "visiteurs_uniques": 1284,
    "pages_vues": 4871,
    "duree_moyenne_secondes": 127,
    "taux_rebond_pct": 38,
    "top_pages": [
      { "path": "/", "views": 1240 },
      { "path": "/services", "views": 876 },
      { "path": "/contact", "views": 541 }
    ],
    "nouveaux_leads": 23,
    "appareils": {
      "desktop": 712,
      "mobile": 498,
      "tablette": 62,
      "unknown": 12
    },
    "trafic_journalier": [
      { "day": "2026-04-01", "pageviews": 142, "sessions": 98 },
      { "day": "2026-04-02", "pageviews": 165, "sessions": 112 }
    ],
    "sources_trafic": [
      { "source": "Direct", "visits": 512 },
      { "source": "google.com", "visits": 387 },
      { "source": "linkedin.com", "visits": 94 }
    ],
    "telechargements": 47
  }
}
```

---

## Annexe A — Flux d'authentification recommandé

```
1. App démarre
   └─ GET /csrf-token → stocker csrfToken
   └─ Vérifier si un accessToken valide existe en mémoire

2. Login
   └─ POST /auth/login → stocker accessToken en mémoire (pas localStorage)
   └─ refreshToken → cookie HTTP-Only automatique

3. Requête API
   └─ Authorization: Bearer <accessToken>
   └─ X-CSRF-TOKEN: <csrfToken>

4. Access token expiré (401 reçu)
   └─ POST /auth/refresh-token → nouveau accessToken
   └─ Réessayer la requête originale

5. Logout
   └─ POST /auth/logout → effacer accessToken de la mémoire
```

---

## Annexe B — Workflow upload média

```
1. Admin sélectionne un fichier
2. POST /admin/medias/upload (multipart/form-data)
   └─ Réponse : { data: { url: "https://cdn.broadway.com/..." } }
3. Copier data.url
4. Créer/modifier une ressource avec imageUrl = data.url
   ex: POST /admin/services { imageUrl: "https://cdn.broadway.com/..." }
```

---

## Annexe C — Codes statut HTTP résumés

| Endpoint | Méthode | Auth | CSRF | Rate Limit |
|---|---|---|---|---|
| `/csrf-token` | GET | Non | Non | Global 200/15min |
| `/auth/login` | POST | Non | Oui | 5/min |
| `/auth/refresh-token` | POST | Non | Oui | — |
| `/auth/logout` | POST | Oui | Oui | — |
| `/services` | GET | Non | Non | — |
| `/services/:slug` | GET | Non | Non | — |
| `/produits` | GET | Non | Non | — |
| `/produits/:slug` | GET | Non | Non | — |
| `/references` | GET | Non | Non | — |
| `/partenaires` | GET | Non | Non | — |
| `/contact` | POST | Non | Oui | **5/min** |
| `/analytics/event` | POST | Non | Oui | 120/min |
| `/admin/*` | Tous | **Oui** | **Oui** | Global |
