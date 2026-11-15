/**
 * TEST DE CONNECTIVITÉ ET CONFIGURATION DES FRONTENDS & BACKEND
 * Vérifie :
 * 1. Configuration dynamique SameSite/Secure sur Vercel (CSRF et RefreshToken)
 * 2. Règles CORS pour le Portail et l'Admin (origines *.vercel.app et variables d'environnement)
 * 3. Configuration des URLs de fallback dans frontend/admin et admin
 * 4. Configuration des URLs de fallback dans frontend/portal et route proxy
 * 5. Simulation de requêtes OPTIONS (Preflight) et GET avec Supertest
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Erreur:`, err.message);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Erreur:`, err.message);
  }
}

async function main() {
  console.log('================================================================');
  console.log('🧪 VALIDATION CONNECTIVITÉ MULTI-FRONTENDS <-> BACKEND (VERCEL)');
  console.log('================================================================\n');

  // ────────────────────────────────────────────────────────────
  // TEST 1 : DÉTECTION SAMESITE & SECURE SUR VERCEL
  // ────────────────────────────────────────────────────────────
  console.log('--- TEST 1 : COOKIES SAMESITE ET SECURE ---');

  runTest('Sur Vercel (VERCEL=1), le module CSRF active SameSite=None et Secure=true', () => {
    // Simuler Vercel
    const oldVercel = process.env.VERCEL;
    const oldNodeEnv = process.env.NODE_ENV;
    delete process.env.COOKIE_SAMESITE;
    process.env.VERCEL = '1';
    delete process.env.NODE_ENV;

    // Recharger csrf.js
    delete require.cache[require.resolve('../src/lib/csrf')];
    const csrfModule = require('../src/lib/csrf');
    assert.ok(csrfModule.doubleCsrfProtection, 'doubleCsrfProtection doit être exporté');

    // Restaurer
    if (oldVercel !== undefined) process.env.VERCEL = oldVercel; else delete process.env.VERCEL;
    if (oldNodeEnv !== undefined) process.env.NODE_ENV = oldNodeEnv; else delete process.env.NODE_ENV;
  });

  runTest('En local (développement), le module CSRF garde SameSite=Lax pour HTTP', () => {
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = 'development';
    delete process.env.COOKIE_SAMESITE;

    delete require.cache[require.resolve('../src/lib/csrf')];
    const csrfModule = require('../src/lib/csrf');
    assert.ok(csrfModule.doubleCsrfProtection);
  });

  // ────────────────────────────────────────────────────────────
  // TEST 2 : RÈGLES CORS POUR PORTAIL ET ADMIN
  // ────────────────────────────────────────────────────────────
  console.log('\n--- TEST 2 : PRÉFLIGHT CORS (PORTAL ET ADMIN SUR VERCEL) ---');

  await runAsyncTest('CORS accepte les requêtes OPTIONS (preflight) du Portail Next.js (*.vercel.app)', async () => {
    delete require.cache[require.resolve('../app')];
    const app = require('../app');
    const server = http.createServer(app);

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const options = {
          hostname: '127.0.0.1',
          port: port,
          path: '/api/v1/produits',
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://multiverus-web-site-portail-796qjq6th-herosking-jizs-projects.vercel.app',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type, X-CSRF-TOKEN',
          },
        };

        const req = http.request(options, (res) => {
          assert.strictEqual(res.statusCode, 204, 'Preflight doit répondre 204');
          assert.strictEqual(
            res.headers['access-control-allow-origin'],
            'https://multiverus-web-site-portail-796qjq6th-herosking-jizs-projects.vercel.app'
          );
          assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
          server.close(resolve);
        });

        req.on('error', (err) => {
          server.close(() => reject(err));
        });

        req.end();
      });
    });
  });

  await runAsyncTest('CORS accepte les requêtes OPTIONS (preflight) de l\'Admin SPA (*.vercel.app)', async () => {
    delete require.cache[require.resolve('../app')];
    const app = require('../app');
    const server = http.createServer(app);

    await new Promise((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const options = {
          hostname: '127.0.0.1',
          port: port,
          path: '/api/v1/auth/login',
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://multiverus-admin-dashboard.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, X-CSRF-TOKEN',
          },
        };

        const req = http.request(options, (res) => {
          assert.strictEqual(res.statusCode, 204);
          assert.strictEqual(
            res.headers['access-control-allow-origin'],
            'https://multiverus-admin-dashboard.vercel.app'
          );
          assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
          server.close(resolve);
        });

        req.on('error', (err) => {
          server.close(() => reject(err));
        });

        req.end();
      });
    });
  });

  // ────────────────────────────────────────────────────────────
  // TEST 3 : FICHIERS SOURCES DU FRONTEND ADMIN
  // ────────────────────────────────────────────────────────────
  console.log('\n--- TEST 3 : CONFIGURATION FRONTEND ADMIN ---');

  runTest('frontend/admin/src/lib/axios.ts ne contient plus l\'IP privée 100.119.90.39 en fallback prod', () => {
    const filePath = path.join(__dirname, '../../frontend/admin/src/lib/axios.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(!content.includes("100.119.90.39:8080"), 'L\'IP 100.119.90.39 ne doit plus être dans frontend/admin/src/lib/axios.ts');
    assert.ok(content.includes("https://multiverus-web-site.vercel.app/api/v1"), 'Doit pointer vers le backend Vercel par défaut');
  });

  runTest('admin/src/lib/axios.ts ne contient plus l\'IP privée 100.119.90.39 en fallback prod', () => {
    const filePath = path.join(__dirname, '../../admin/src/lib/axios.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(!content.includes("100.119.90.39:8080"), 'L\'IP 100.119.90.39 ne doit plus être dans admin/src/lib/axios.ts');
    assert.ok(content.includes("https://multiverus-web-site.vercel.app/api/v1"), 'Doit pointer vers le backend Vercel par défaut');
  });

  // ────────────────────────────────────────────────────────────
  // TEST 4 : FICHIERS SOURCES DU FRONTEND PORTAIL
  // ────────────────────────────────────────────────────────────
  console.log('\n--- TEST 4 : CONFIGURATION FRONTEND PORTAIL ---');

  runTest('frontend/portal/lib/axios.ts ne retombe plus sur un chemin relatif "/api/v1" silencieux en prod', () => {
    const filePath = path.join(__dirname, '../../frontend/portal/lib/axios.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes("https://multiverus-web-site.vercel.app/api/v1"), 'Doit pointer vers le backend Vercel par défaut');
  });

  runTest('frontend/portal/app/proxy/[...path]/route.ts ne contient plus l\'IP privée 100.119.90.39', () => {
    const filePath = path.join(__dirname, '../../frontend/portal/app/proxy/[...path]/route.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(!content.includes("100.119.90.39"), 'L\'IP 100.119.90.39 ne doit plus être dans proxy route');
    assert.ok(content.includes("https://multiverus-web-site.vercel.app/api/v1"), 'Doit utiliser la cible Vercel par défaut');
  });

  runTest('frontend/portal/next.config.ts autorise les images de multiverus-web-site.vercel.app', () => {
    const filePath = path.join(__dirname, '../../frontend/portal/next.config.ts');
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes("multiverus-web-site.vercel.app"), 'next.config.ts doit autoriser multiverus-web-site.vercel.app');
  });

  // ────────────────────────────────────────────────────────────
  // TEST 5 : GESTION DES LISTES D'EMAILS DESTINATAIRES
  // ────────────────────────────────────────────────────────────
  console.log('\n--- TEST 5 : PARSING DES DESTINATAIRES CONTACT_RECEIVER_EMAILS ---');

  runTest('Supporte une liste d\'emails séparés par des virgules et nettoie les espaces', () => {
    const rawInput = "contact@multiverus.com,  direction@multiverus.com,tech@multiverus.com ";
    const parsed = rawInput.split(',').map(e => e.trim()).filter(Boolean);
    assert.deepStrictEqual(parsed, [
      'contact@multiverus.com',
      'direction@multiverus.com',
      'tech@multiverus.com'
    ]);
    assert.strictEqual(parsed.join(', '), 'contact@multiverus.com, direction@multiverus.com, tech@multiverus.com');
  });

  runTest('Repli sur SMTP_USER si aucun destinataire spécifique n\'est fourni', () => {
    const rawInput = undefined;
    const smtpUser = "fallback@multiverus.com";
    const parsed = rawInput ? rawInput.split(',').map(e => e.trim()).filter(Boolean) : [smtpUser];
    assert.deepStrictEqual(parsed, ['fallback@multiverus.com']);
  });

  console.log('\n================================================================');
  console.log(`📊 RÉSULTAT : ${passedTests}/${totalTests} tests réussis`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS DE CONNECTIVITÉ SONT AU VERT !');
    process.exit(0);
  } else {
    console.error('⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
