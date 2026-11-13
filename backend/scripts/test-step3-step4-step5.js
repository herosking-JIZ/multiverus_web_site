/**
 * TEST DE VALIDATION DES ÉTAPES 3, 4 ET 5
 * Vérifie :
 * 1. Les routes Vercel Cron et la sécurisation par CRON_SECRET (Étape 3)
 * 2. Les points d'entrée Serverless Vercel (api/index.js) et Netlify (netlify/functions/api.js) (Étape 4)
 * 3. La configuration vercel.json et netlify.toml (Étape 4)
 * 4. La configuration dynamique CORS, Cookies et CSRF (Étape 5)
 */

'use strict';

require('dotenv').config();
const assert = require('assert');
const fs = require('fs');
const path = require('path');

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
  console.log('====================================================');
  console.log('🧪 LANCEMENT DES TESTS DE VALIDATION ÉTAPES 3, 4 & 5');
  console.log('====================================================\n');

  // ────────────────────────────────────────────────────────────
  // TEST ÉTAPE 4 : VERCEL.JSON, NETLIFY.TOML & ENTRY POINTS
  // ────────────────────────────────────────────────────────────
  console.log('--- ÉTAPE 4 : CONFIGURATION VERCEL & NETLIFY ---');

  runTest('Vercel entry point api/index.js exporte une application Express', () => {
    const vercelApp = require('../api/index');
    assert.ok(vercelApp, 'api/index.js doit être chargé');
    assert.strictEqual(typeof vercelApp.handle, 'function', 'api/index.js doit être une application Express');
  });

  runTest('vercel.json est un JSON valide et contient rewrites + crons', () => {
    const vercelConfigPath = path.join(__dirname, '../vercel.json');
    assert.ok(fs.existsSync(vercelConfigPath), 'vercel.json doit exister');
    const content = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    assert.strictEqual(content.version, 2);
    assert.ok(Array.isArray(content.rewrites), 'rewrites doit être un tableau');
    assert.ok(content.rewrites.some((r) => r.destination === '/api/index.js'), 'destination /api/index.js requise');
    assert.ok(Array.isArray(content.crons), 'crons doit être un tableau');
    assert.ok(content.crons.some((c) => c.path === '/api/v1/cron/cleanup-pending'), 'cron cleanup-pending requis');
  });

  runTest('Netlify entry point netlify/functions/api.js exporte un handler serverless valide', () => {
    const netlifyFunc = require('../netlify/functions/api');
    assert.ok(netlifyFunc, 'Le module Netlify doit exister');
    assert.strictEqual(typeof netlifyFunc.handler, 'function', 'handler doit être une fonction');
  });

  runTest('netlify.toml existe et configure les fonctions et redirections', () => {
    const tomlPath = path.join(__dirname, '../netlify.toml');
    assert.ok(fs.existsSync(tomlPath), 'netlify.toml doit exister');
    const content = fs.readFileSync(tomlPath, 'utf8');
    assert.ok(content.includes('functions = "netlify/functions"'));
    assert.ok(content.includes('/.netlify/functions/api/:splat'));
  });

  // ────────────────────────────────────────────────────────────
  // TEST ÉTAPE 3 : VERCEL CRON JOBS ROUTE & AUTHENTICATION
  // ────────────────────────────────────────────────────────────
  console.log('\n--- ÉTAPE 3 : VERCEL CRON ROUTE & SÉCURITÉ ---');

  const cronController = require('../src/controllers/cron.controller');

  await runAsyncTest('cronController.cleanupPendingUploads refuse les requêtes sans jeton CRON_SECRET valide', async () => {
    process.env.CRON_SECRET = 'super-secret-cron-token-999';

    let statusOutput = null;
    let jsonOutput = null;

    const mockReq = {
      headers: { authorization: 'Bearer mauvais-token' },
    };
    const mockRes = {
      status: (code) => {
        statusOutput = code;
        return {
          json: (data) => {
            jsonOutput = data;
          },
        };
      },
    };

    await cronController.cleanupPendingUploads(mockReq, mockRes, () => {});

    assert.strictEqual(statusOutput, 401, 'Doit retourner 401 Unauthorized');
    assert.strictEqual(jsonOutput.success, false);
    assert.ok(jsonOutput.message.includes('invalide'));

    delete process.env.CRON_SECRET;
  });

  // ────────────────────────────────────────────────────────────
  // TEST ÉTAPE 5 : CORS, HEADERS & COOKIES SAMESITE
  // ────────────────────────────────────────────────────────────
  console.log('\n--- ÉTAPE 5 : SÉCURITÉ CORS, HEADERS & COOKIES ---');

  runTest('CORS et application app.js se chargent avec les nouvelles règles multi-domaines', () => {
    process.env.FRONTEND_URL = 'https://multiverus.com, https://admin.multiverus.com';
    delete require.cache[require.resolve('../app')];
    const app = require('../app');
    assert.ok(app, 'L\'application doit se charger sans erreur avec plusieurs FRONTEND_URL');
  });

  runTest('Le module CSRF csrf.js s\'adapte aux variables d\'environnement COOKIE_SAMESITE', () => {
    process.env.COOKIE_SAMESITE = 'None';
    process.env.NODE_ENV = 'production';
    delete require.cache[require.resolve('../src/lib/csrf')];
    const csrf = require('../src/lib/csrf');
    assert.ok(csrf.doubleCsrfProtection, 'Le middleware doubleCsrfProtection doit exister');
    assert.strictEqual(typeof csrf.generateToken, 'function', 'generateToken doit être une fonction');

    delete process.env.COOKIE_SAMESITE;
    process.env.NODE_ENV = 'development';
  });

  console.log('\n====================================================');
  console.log(`📊 RÉSULTAT : ${passedTests}/${totalTests} tests réussis`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT VALIDES POUR LES ÉTAPES 3, 4 ET 5 !');
    process.exit(0);
  } else {
    console.error('⚠️ Certains tests ont échoué.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Erreur inattendue durant les tests :', err);
  process.exit(1);
});

