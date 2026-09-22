# Guide d'intégration Frontend React — API BZT

## Contexte

L'API utilise un système de sécurité appelé **CSRF double-submit**. Avant d'envoyer n'importe quelle requête POST/PUT/PATCH/DELETE, le frontend doit obligatoirement récupérer un token CSRF auprès du serveur et le renvoyer dans chaque requête mutante. Sans ça, le serveur répond **403 Forbidden**.

---

## Comment ça fonctionne (à lire une fois)

```
Frontend                              Backend
   |                                     |
   |── GET /api/v1/csrf-token ─────────►| Génère le token
   |◄─ { csrfToken: "abc123..." } ──────| + pose un cookie httpOnly "ps-csrf-token"
   |                                     |
   |── POST /api/v1/auth/login ────────►| Vérifie que :
   |   Header : x-csrf-token: abc123    |   header x-csrf-token == cookie ps-csrf-token
   |   Cookie : ps-csrf-token=abc123    | ✓ OK → traite la requête
   |                                     | ✗ manquant ou différent → 403
```

Deux conditions **simultanées** sont nécessaires pour que ça passe :
1. Le cookie `ps-csrf-token` est joint automatiquement par le navigateur (nécessite `withCredentials: true`)
2. Le header `x-csrf-token` contient la valeur retournée par `/csrf-token`

---

## Étape 1 — Installer Axios

```bash
npm install axios
```

---

## Étape 2 — Créer le client Axios

Crée le fichier `src/lib/apiClient.js` :

```js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true,   // envoie les cookies à chaque requête (OBLIGATOIRE)
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
```

> `withCredentials: true` est le point le plus critique. Sans cette ligne, le navigateur ne joint pas le cookie `ps-csrf-token` aux requêtes cross-origin et le serveur répond toujours 403.

---

## Étape 3 — Créer le service CSRF

Crée le fichier `src/lib/csrf.js` :

```js
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

Ce service garde le token en mémoire pour éviter d'appeler `/csrf-token` à chaque requête.

---

## Étape 4 — Ajouter les intercepteurs Axios

Reviens dans `src/lib/apiClient.js` et complète-le comme suit :

```js
import axios from 'axios';
import { getCsrfToken, fetchCsrfToken } from './csrf';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur requête : injecte x-csrf-token sur POST / PUT / PATCH / DELETE
apiClient.interceptors.request.use(async (config) => {
    const mutatingMethods = ['post', 'put', 'patch', 'delete'];
    if (mutatingMethods.includes(config.method)) {
        let token = getCsrfToken();
        if (!token) {
            token = await fetchCsrfToken();
        }
        config.headers['x-csrf-token'] = token;
    }
    return config;
});

// Intercepteur réponse : si le token a expiré (403), renouvelle et réessaie une fois
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await fetchCsrfToken();
            originalRequest.headers['x-csrf-token'] = newToken;
            return apiClient(originalRequest);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

Grâce à ces intercepteurs, tu n'as **jamais besoin de gérer le token manuellement** dans tes composants.

---

## Étape 5 — Initialiser le token au démarrage

Dans `src/main.jsx` (ou `src/index.jsx`), appelle `fetchCsrfToken()` avant de monter l'application :

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { fetchCsrfToken } from './lib/csrf';

fetchCsrfToken().then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
```

Cela garantit que le cookie et le token sont disponibles avant la première interaction utilisateur.

---

## Étape 6 — Utiliser apiClient dans tes composants

À partir de maintenant, utilise toujours `apiClient` à la place de `fetch` ou d'un axios non configuré.

**Connexion :**
```jsx
import apiClient from '../lib/apiClient';

async function handleLogin(email, password) {
    try {
        const res = await apiClient.post('/auth/login', { email, password });
        // res.data contient { accessToken, user, ... }
        console.log('Connecté :', res.data);
    } catch (err) {
        console.error('Erreur :', err.response?.data?.message);
    }
}
```

**Inscription :**
```jsx
const res = await apiClient.post('/auth/register', {
    nomComplet: 'Jean Dupont',
    email: 'jean@example.com',
    password: 'MonMot2Passe!',
});
```

**Requête authentifiée (avec accessToken) :**
```jsx
const res = await apiClient.get('/services', {
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
});
```

---

## Récapitulatif des erreurs fréquentes

| Erreur | Cause probable | Solution |
|---|---|---|
| `403 invalid csrf token` | `withCredentials: true` manquant | L'ajouter dans `axios.create()` |
| `403 invalid csrf token` | Header `x-csrf-token` absent | Vérifier que l'intercepteur est bien branché |
| `403 invalid csrf token` | Token expiré | L'intercepteur response le renouvelle automatiquement |
| `CORS: Not allowed` | Ton origine n'est pas dans la liste | Demander au backend d'ajouter ton URL |
| `/api/v1/api/v1/csrf-token` (double préfixe) | `baseURL` inclut déjà `/api/v1` | Appeler `/csrf-token` et non `/api/v1/csrf-token` |

---

## Structure de fichiers finale

```
src/
├── lib/
│   ├── apiClient.js   ← client axios configuré + intercepteurs
│   └── csrf.js        ← fetchCsrfToken / getCsrfToken
├── main.jsx           ← fetchCsrfToken() avant ReactDOM.render
└── components/
    └── LoginForm.jsx  ← utilise apiClient.post(...)
```
