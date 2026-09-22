# Déploiement Broadway Technologies — VPS Hostinger

## Architecture

```
Internet (HTTPS)
       │
       ▼
┌─────────────────────────────────────┐
│           Nginx (port 443/80)        │
│  ┌────────────────┐  ┌────────────┐ │
│  │  /uploads/*    │  │  /api/v1/* │ │
│  │  Fichiers      │  │  Reverse   │ │
│  │  statiques     │  │  Proxy     │ │
│  │  (direct disk) │  │  → :3000   │ │
│  └────────────────┘  └────────────┘ │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         PM2 — Node.js :3000          │
│         server.js (Express)          │
│  ┌──────────────────────────────┐   │
│  │  Cron (node-cron)            │   │
│  │  → jobs/index.js             │   │
│  │  → nettoyage PENDING/heure   │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌────────────┐   ┌──────────────────────┐
│ PostgreSQL  │   │  /var/www/bzt/uploads │
│  (local)   │   │  Fichiers médias      │
└────────────┘   └──────────────────────┘
```

---

## 1. Prérequis VPS — Installation des outils

Se connecter en SSH :
```bash
ssh root@TON_IP_HOSTINGER
```

### Mise à jour système
```bash
apt update && apt upgrade -y
```

### Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # doit afficher v20.x.x
```

### PM2 (gestionnaire de processus)
```bash
npm install -g pm2
```

### Nginx
```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### Git
```bash
apt install -y git
```

### PostgreSQL
```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

---

## 2. Base de données

```bash
sudo -u postgres psql
```

```sql
CREATE USER bzt_user WITH PASSWORD 'MOT_DE_PASSE_FORT_ICI';
CREATE DATABASE bzt_db OWNER bzt_user;
\q
```

---

## 3. Déploiement du code

### Créer le répertoire et cloner
```bash
mkdir -p /var/www/bzt
cd /var/www/bzt
git clone https://github.com/TON_COMPTE/TON_REPO.git .
```

### Installer les dépendances (sans devDependencies)
```bash
npm install --omit=dev
```

### Créer et configurer le dossier uploads
```bash
mkdir -p /var/www/bzt/uploads
chown -R www-data:www-data /var/www/bzt/uploads
chmod 755 /var/www/bzt/uploads
```

> Le processus Node.js (PM2) doit pouvoir écrire dans ce dossier.
> Si PM2 tourne en tant que `root`, `chown root:root` suffit.

---

## 4. Fichier .env de production

Créer `/var/www/bzt/.env` :

```bash
nano /var/www/bzt/.env
```

Coller et remplir toutes les valeurs :

```bash
# ─── BASE DE DONNÉES ────────────────────────────────────────────────
DATABASE_URL="postgresql://bzt_user:MOT_DE_PASSE_FORT_ICI@localhost:5432/bzt_db"

# ─── STOCKAGE MÉDIAS ────────────────────────────────────────────────
# Chemin absolu du dossier uploads sur le VPS
MEDIA_STORAGE_PATH=/var/www/bzt/uploads
# URL publique de base (ton domaine, sans slash final)
MEDIA_BASE_URL=https://ton-domaine.com

# ─── JWT ────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=GENERE_AVEC_openssl_rand_-hex_64
JWT_REFRESH_SECRET=GENERE_AVEC_openssl_rand_-hex_64

# ─── CSRF ───────────────────────────────────────────────────────────
CSRF_SECRET=GENERE_AVEC_openssl_rand_-hex_64
COOKIE_SECRET=GENERE_AVEC_openssl_rand_-hex_32

# ─── MAIL ───────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ton-email@gmail.com
SMTP_PASS=app_password_gmail_16_chars
SMTP_FROM="Broadway Technologies <ton-email@gmail.com>"

# ─── APP ────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://ton-domaine-frontend.com
```

> Générer les secrets avec :
> ```bash
> openssl rand -hex 64
> ```

---

## 5. Migrations Prisma

```bash
cd /var/www/bzt

# Générer le client Prisma
npx prisma generate

# Appliquer toutes les migrations existantes (sans en créer de nouvelles)
npx prisma migrate deploy
```

---

## 6. Lancer avec PM2

```bash
cd /var/www/bzt

# Démarrer l'application
pm2 start server.js --name "bzt-api" --env production

# Sauvegarder pour redémarrage automatique après reboot
pm2 save
pm2 startup
# → suivre la commande affichée par pm2 startup

# Vérifier le statut
pm2 status
pm2 logs bzt-api --lines 50
```

---

## 7. Configuration Nginx

Créer le fichier de configuration :

```bash
nano /etc/nginx/sites-available/bzt
```

Coller la configuration suivante (remplacer `ton-domaine.com`) :

```nginx
server {
    listen 80;
    server_name ton-domaine.com www.ton-domaine.com;

    # ── Fichiers médias — servis directement par Nginx (bypass Node.js) ──
    location /uploads/ {
        alias /var/www/bzt/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;

        # Bloquer l'exécution de scripts dans uploads
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # ── API Node.js — reverse proxy ──────────────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Timeout pour les requêtes longues
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # ── Taille maximale des uploads (doit correspondre à la limite multer) ──
    client_max_body_size 25M;
}
```

Activer le site :

```bash
ln -s /etc/nginx/sites-available/bzt /etc/nginx/sites-enabled/
nginx -t          # vérifier la syntaxe
systemctl reload nginx
```

---

## 8. HTTPS — Certificat SSL Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx

# Obtenir et configurer le certificat automatiquement
certbot --nginx -d ton-domaine.com -d www.ton-domaine.com

# Vérifier le renouvellement automatique
certbot renew --dry-run
```

> Certbot modifie automatiquement le fichier Nginx pour ajouter le bloc HTTPS (port 443) et la redirection HTTP → HTTPS.

---

## 9. Commandes de maintenance

### Redémarrer l'app après un changement de code
```bash
cd /var/www/bzt
git pull
npm install --omit=dev
npx prisma generate
npx prisma migrate deploy
pm2 restart bzt-api
```

### Voir les logs en temps réel
```bash
pm2 logs bzt-api
```

### Vérifier l'espace disque (uploads)
```bash
du -sh /var/www/bzt/uploads/
```

### Sauvegarder la base de données
```bash
pg_dump -U bzt_user bzt_db > /var/backups/bzt-$(date +%Y%m%d).sql
```

---

## 10. Checklist finale avant go-live

- [ ] VPS accessible en SSH
- [ ] Node.js 20 installé (`node -v`)
- [ ] PM2 installé (`pm2 -v`)
- [ ] PostgreSQL démarré, base `bzt_db` créée
- [ ] `/var/www/bzt/.env` rempli avec les vraies valeurs
- [ ] `npx prisma migrate deploy` exécuté sans erreur
- [ ] `pm2 start server.js --name bzt-api` — statut `online`
- [ ] `pm2 logs bzt-api` — aucune erreur de démarrage
- [ ] Dossier `/var/www/bzt/uploads/` créé avec les bonnes permissions
- [ ] Nginx configuré et testé (`nginx -t`)
- [ ] Certificat SSL Let's Encrypt installé
- [ ] `GET https://ton-domaine.com/api/v1/csrf-token` → répond `200`
- [ ] `POST https://ton-domaine.com/api/v1/auth/login` → répond `200`
- [ ] Upload d'un fichier → fichier présent dans `/var/www/bzt/uploads/`
- [ ] URL retournée accessible depuis le navigateur
- [ ] `pm2 save` + `pm2 startup` exécutés (redémarrage auto)


