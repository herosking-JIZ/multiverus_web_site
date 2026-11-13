/**
 * TEST DE VALIDATION DES ÉTAPES 1 ET 2
 * Vérifie :
 * 1. La connexion et la mise en cache de l'instance Prisma sur globalThis (Step 1)
 * 2. Le module de stockage S3 / Cloudflare R2, la génération d'URLs présignées et le fallback local (Step 2)
 */

'use strict';

require('dotenv').config();
const assert = require('assert');

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
  console.log('🧪 LANCEMENT DES TESTS DE VALIDATION ÉTAPE 1 & ÉTAPE 2');
  console.log('====================================================\n');

  // ────────────────────────────────────────────────────────────
  // TEST ÉTAPE 1 : GESTION DE PRISMA SUR GLOBALTHIS & POOLING
  // ────────────────────────────────────────────────────────────
  console.log('--- ÉTAPE 1 : GESTION PRISMA & SERVERLESS POOLING ---');

  runTest('Prisma exporte une instance valide', () => {
    const prisma = require('../src/lib/prisma');
    assert.ok(prisma, 'L\'instance Prisma doit exister');
    assert.strictEqual(typeof prisma.$connect, 'function', 'Prisma doit posséder la méthode $connect');
  });

  runTest('Prisma est attaché à globalThis (Singleton Serverless)', () => {
    const prisma1 = require('../src/lib/prisma');
    assert.strictEqual(globalThis.prisma, prisma1, 'globalThis.prisma doit être défini');
    
    // Simule une deuxième importation dans une autre fonction ou un rechargement HMR
    delete require.cache[require.resolve('../src/lib/prisma')];
    const prisma2 = require('../src/lib/prisma');
    assert.strictEqual(prisma1, prisma2, 'Les instances doivent être strictement identiques (singleton global)');
  });

  // ────────────────────────────────────────────────────────────
  // TEST ÉTAPE 2 : STOCKAGE OBJET S3 / R2 & FALLBACK
  // ────────────────────────────────────────────────────────────
  console.log('\n--- ÉTAPE 2 : STOCKAGE S3 / CLOUDFLARE R2 & PRESIGNED URLS ---');

  const storage = require('../src/lib/storage');
  const mediaService = require('../src/services/media.service');

  runTest('Le module storage.js est instanciable et possède les méthodes attendues', () => {
    assert.strictEqual(typeof storage.isConfigured, 'function');
    assert.strictEqual(typeof storage.generatePresignedPutUrl, 'function');
    assert.strictEqual(typeof storage.uploadBuffer, 'function');
    assert.strictEqual(typeof storage.deleteObject, 'function');
    assert.strictEqual(typeof storage.getPublicUrl, 'function');
  });

  runTest('storage.isConfigured() renvoie false lorsque les variables S3 sont absentes', () => {
    const oldBucket = process.env.S3_BUCKET_NAME;
    delete process.env.S3_BUCKET_NAME;

    assert.strictEqual(storage.isConfigured(), false);

    if (oldBucket) process.env.S3_BUCKET_NAME = oldBucket;
  });

  await runAsyncTest('mediaService.initiatePresignedUpload refuse les formats non autorisés', async () => {
    try {
      await mediaService.initiatePresignedUpload({
        nomFichier: 'script.exe',
        typeMime: 'application/x-msdownload',
        tailleOctets: 1024,
      });
      assert.fail('Aurait dû lever une erreur 400 pour format non autorisé');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert.ok(err.message.includes('non autorisé'));
    }
  });

  await runAsyncTest('mediaService.initiatePresignedUpload refuse les fichiers dépassant la limite', async () => {
    try {
      await mediaService.initiatePresignedUpload({
        nomFichier: 'document.pdf',
        typeMime: 'application/pdf',
        tailleOctets: 30 * 1024 * 1024, // 30 Mo alors que max pdf = 20 Mo
      });
      assert.fail('Aurait dû lever une erreur 400 pour fichier trop volumineux');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert.ok(err.message.includes('trop volumineux'));
    }
  });

  await runAsyncTest('Génération réussie d\'URL présignée lorsque S3/R2 est configuré', async () => {
    // Configuration temporaire S3 de test
    process.env.S3_BUCKET_NAME = 'multiverus-test-bucket';
    process.env.S3_ACCESS_KEY_ID = 'test-access-key-id-123456';
    process.env.S3_SECRET_ACCESS_KEY = 'test-secret-access-key-abcdef1234567890';
    process.env.S3_REGION = 'auto';
    process.env.S3_ENDPOINT = 'https://test-account.r2.cloudflarestorage.com';
    process.env.S3_PUBLIC_URL = 'https://cdn.multiverus.com';

    // Réinitialise le client S3 en cache
    storage._client = null;

    assert.strictEqual(storage.isConfigured(), true);

    const result = await storage.generatePresignedPutUrl({
      key: 'produits/test-image-123.webp',
      contentType: 'image/webp',
      expiresIn: 900,
    });

    assert.ok(result.uploadUrl, 'L\'URL d\'upload présignée doit être générée');
    assert.ok(result.uploadUrl.startsWith('https://'), 'L\'URL doit être en HTTPS');
    assert.ok(result.uploadUrl.includes('X-Amz-Signature') || result.uploadUrl.includes('X-Amz-Credential'), 'L\'URL doit contenir les paramètres de signature S3');
    assert.strictEqual(result.s3Key, 'produits/test-image-123.webp');
    assert.strictEqual(result.publicUrl, 'https://cdn.multiverus.com/produits/test-image-123.webp');
    assert.strictEqual(result.s3Bucket, 'multiverus-test-bucket');

    // Nettoyage des variables de test
    delete process.env.S3_BUCKET_NAME;
    delete process.env.S3_ACCESS_KEY_ID;
    delete process.env.S3_SECRET_ACCESS_KEY;
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_PUBLIC_URL;
    storage._client = null;
  });

  runTest('Vérification du chargement de l\'application Express et des nouvelles routes', () => {
    const app = require('../app');
    assert.ok(app, 'L\'application Express app.js doit se charger sans erreur');
  });

  console.log('\n====================================================');
  console.log(`📊 RÉSULTAT : ${passedTests}/${totalTests} tests réussis`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TOUS LES TESTS SONT VALIDES POUR LES ÉTAPES 1 ET 2 !');
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

