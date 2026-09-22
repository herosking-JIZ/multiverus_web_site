/**
 * Génère les images PNG placeholder pour les données du seed.
 * Utilise uniquement les modules Node.js natifs (zlib, fs, path).
 * Usage : node scripts/generate-seed-images.js
 */

'use strict';

require('dotenv').config();
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ─── CRC32 (requis par la spec PNG) ──────────────────────────
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── Générateur PNG ──────────────────────────────────────────
function makePNG(width, height, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeB = Buffer.from(type, 'ascii');
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc32(Buffer.concat([typeB, data])), 0);
    return Buffer.concat([len, typeB, data, crcVal]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  // Pixels : filtre 0 (None) + RGB * width pour chaque ligne
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const off = y * (1 + width * 3);
    raw[off] = 0; // filter None
    for (let x = 0; x < width; x++) {
      raw[off + 1 + x * 3]     = r;
      raw[off + 1 + x * 3 + 1] = g;
      raw[off + 1 + x * 3 + 2] = b;
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Config ──────────────────────────────────────────────────
const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : path.join(process.cwd(), 'uploads');

// Couleur par dossier (RGB)
const PALETTE = {
  services:    [59,  130, 246],  // bleu
  produits:    [16,  185, 129],  // vert
  clients:     [245, 158, 11],   // orange
  partenaires: [139, 92,  246],  // violet
};

// Liste exacte des fichiers attendus par le seed
const SEED_FILES = [
  'services/seed-dev-web.png',
  'services/seed-mobile.png',
  'services/seed-conseil.png',
  'services/seed-data.png',
  'services/seed-securite.png',
  'produits/seed-crm.png',
  'produits/seed-erp.png',
  'produits/seed-analytics.png',
  'clients/seed-orange.png',
  'clients/seed-sonabhy.png',
  'clients/seed-bceao.png',
  'partenaires/seed-microsoft.png',
  'partenaires/seed-aws.png',
  'partenaires/seed-oracle.png',
  'partenaires/seed-cisco.png',
];

// ─── Main ────────────────────────────────────────────────────
console.log(`\n🖼️  Génération des images seed dans : ${STORAGE_PATH}\n`);

for (const rel of SEED_FILES) {
  const dossier = rel.split('/')[0];
  const color   = PALETTE[dossier] || [100, 100, 100];
  const dest    = path.join(STORAGE_PATH, rel);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, makePNG(200, 200, color));
  console.log(`   ✅  ${rel}`);
}

console.log(`\n✅  ${SEED_FILES.length} images créées.\n`);
console.log('Pour tester : démarrez le serveur puis ouvrez dans un navigateur :');
const BASE_URL = (process.env.MEDIA_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
console.log(`   ${BASE_URL}/uploads/services/seed-dev-web.png\n`);
