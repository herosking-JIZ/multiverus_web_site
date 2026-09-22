// ============================================================
// BROADWAY TECHNOLOGIES — Seed de données de test
// Usage : node prisma/seed.js
// ============================================================

require('dotenv').config();
const fs                 = require('fs');
const path               = require('path');
const { PrismaClient }   = require('@prisma/client');
const { PrismaPg }       = require('@prisma/adapter-pg');
const { Pool }           = require('pg');
const bcrypt             = require('bcrypt');

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ─── Config chemins ──────────────────────────────────────────
const BASE_URL = (process.env.MEDIA_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : path.join(process.cwd(), 'uploads');

// ─── Helpers ─────────────────────────────────────────────────
const hash = (pwd) => bcrypt.hash(pwd, 12);

// ─── Helper : lit un fichier réel (JPEG/PNG/SVG) et retourne l'objet media ───
function readRealMedia(dossier, nomFichier, altText) {
  const sourcePath   = path.join(STORAGE_PATH, dossier, nomFichier);
  const relativePath = `${dossier}/${nomFichier}`;
  const url          = `${BASE_URL}/uploads/${relativePath}`;

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Fichier non trouvé : ${sourcePath}`);
  }

  const buf = fs.readFileSync(sourcePath);

  // Déterminer le type MIME selon l'extension
  const ext = path.extname(nomFichier).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  const typeMime = mimeTypes[ext] || 'application/octet-stream';

  return {
    nomFichier,
    typeMime,
    tailleOctets: BigInt(buf.length),
    s3Key:        relativePath,
    s3Bucket:     'local',
    s3Region:     'local',
    url,
    cdnUrl:       url,
    uploadStatus: 'UPLOADED',
    visibilite:   'PUBLIC',
    dossier,
    altText,
  };
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Démarrage du seed...\n');

  // ────────────────────────────────────────
  // 1. NETTOYAGE (ordre inverse des FK)
  // ────────────────────────────────────────
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.auditLog.deleteMany();
  await prisma.evenementAnalytics.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.service.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.partenaire.deleteMany();
  await prisma.mediaVariante.deleteMany();
  await prisma.media.deleteMany();
  await prisma.utilisateur.deleteMany();
  console.log('   ✅ Tables vidées.\n');

  // ────────────────────────────────────────
  // 2. UTILISATEURS ADMIN
  // ────────────────────────────────────────
  console.log('👤 Création des utilisateurs...');

  const [adminPwd, editorPwd] = await Promise.all([hash('Admin1234!'), hash('Editor1234!')]);

  const admin = await prisma.utilisateur.create({
    data: { nomComplet: 'Super Admin',  email: 'admin@broadway.com',  motDePasse: adminPwd,  role: 'ADMIN', actif: true },
  });
  const editor = await prisma.utilisateur.create({
    data: { nomComplet: 'Éditeur Test', email: 'editor@broadway.com', motDePasse: editorPwd, role: 'ADMIN', actif: true },
  });

  console.log('   ✅ admin@broadway.com   →  Admin1234!');
  console.log('   ✅ editor@broadway.com  →  Editor1234!\n');

  // ────────────────────────────────────────
  // 3. MÉDIAS PUBLICS — fichiers JPEG réels
  // ────────────────────────────────────────
  console.log('🖼️  Importation des images JPEG du dossier public...');

  const mediaPublics = await Promise.all([
    prisma.media.create({ data: { ...readRealMedia('public', 'dg.jpeg', 'Photo DG'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('public', 'kader_kadi.jpeg', 'Kader Kadi'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('public', 'kadi.jpeg', 'Kadi'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('public', 'personnel.jpeg', 'Équipe Personnel'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('public', 'portail.jpeg', 'Portail'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('public', 'portail_vehicule.jpeg', 'Portail Véhicule'), uploadePar: admin.id } }).catch(() => null),
  ]);

  const mediaPublicsCount = mediaPublics.filter(m => m !== null).length;
  console.log(`   ✅ ${mediaPublicsCount} images JPEG importées du dossier public.\n`);

  // ────────────────────────────────────────
  // 3b. MÉDIAS RÉELS — Produits, Projets, Partenaires
  // ────────────────────────────────────────
  console.log('🖼️  Importation des images réelles (produits, clients, partenaires)...');

  // Produits
  const mediaProduksReels = await Promise.all([
    prisma.media.create({ data: { ...readRealMedia('produits', 'broadway-shield.jpg', 'Broadway Shield - Plateforme SOC'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('produits', 'bureau-virtuel-mydesk.png', 'Broadway CloudDesk - Bureau Virtuel'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('produits', 'énergie.jpg', 'Broadway GreenSync - Gestion Énergétique'), uploadePar: admin.id } }).catch(() => null),
  ]);

  // Projets/Clients
  const mediaProjetsReels = await Promise.all([
    prisma.media.create({ data: { ...readRealMedia('clients', 'ministere-economie.jpg', 'Ministère de l\'Économie'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('clients', 'bank-of-africa.jpg', 'Bank of Africa Group'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('clients', 'tech-corps-logistic.png', 'TechCorp Logistics'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('clients', 'SONABEL.jpg', 'Sonabel'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('clients', 'telecomtraining-global-telo.jpg', 'Global Telco Hub'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('clients', 'santechmedical.jpg', 'SanTech Medical'), uploadePar: admin.id } }).catch(() => null),
  ]);

  // Partenaires
  const mediaPartenairesReels = await Promise.all([
    prisma.media.create({ data: { ...readRealMedia('partenaires', 'microsoft.svg', 'Logo Microsoft'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('partenaires', 'aws.svg', 'Logo AWS'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('partenaires', 'oracle.svg', 'Logo Oracle'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('partenaires', 'cisco.svg', 'Logo Cisco'), uploadePar: admin.id } }).catch(() => null),
    prisma.media.create({ data: { ...readRealMedia('partenaires', 'fortinet.svg', 'Logo Fortinet'), uploadePar: admin.id } }).catch(() => null),
  ]);

  const produksReelsCount = mediaProduksReels.filter(m => m !== null).length;
  const projetsReelsCount = mediaProjetsReels.filter(m => m !== null).length;
  const partenairesReelsCount = mediaPartenairesReels.filter(m => m !== null).length;

  console.log(`   ✅ ${produksReelsCount} images produits importées`);
  console.log(`   ✅ ${projetsReelsCount} images clients importées`);
  console.log(`   ✅ ${partenairesReelsCount} images partenaires importées\n`);

  // ────────────────────────────────────────
  // 4. TOTAL DES MÉDIAS
  // ────────────────────────────────────────
  const totalMedias = mediaPublicsCount + produksReelsCount + projetsReelsCount + partenairesReelsCount;

  // ────────────────────────────────────────
  // 5. SERVICES
  // ────────────────────────────────────────
  console.log('⚙️  Création des services...');

  const servicesData = [
    {
      titre:       'Développement Web & Mobile',
      slug:        'developpement-web-mobile',
      description: 'Conception et développement de sites web, applications web sur mesure et applications mobiles iOS/Android. Nous transformons vos idées en produits numériques performants.',
      icone:       'code',
      ordre:       0,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Applications Mobiles',
      slug:        'applications-mobiles',
      description: "Développement d'applications mobiles natives et hybrides pour iOS et Android. Expériences utilisateur soignées, performances optimisées.",
      icone:       'smartphone',
      ordre:       1,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Conseil & Transformation Digitale',
      slug:        'conseil-transformation-digitale',
      description: "Accompagnement stratégique dans votre transformation numérique. Audit de l'existant, roadmap digitale, conduite du changement et formation des équipes.",
      icone:       'lightbulb',
      ordre:       2,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Data & Intelligence Artificielle',
      slug:        'data-intelligence-artificielle',
      description: 'Exploitez vos données pour prendre de meilleures décisions. Data engineering, Machine Learning, dashboards analytiques et automatisation intelligente.',
      icone:       'bar-chart',
      ordre:       3,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Cybersécurité',
      slug:        'cybersecurite',
      description: "Audit de sécurité, tests de pénétration, mise en conformité et formation. Protégez vos systèmes et vos données contre les menaces actuelles.",
      icone:       'shield',
      ordre:       4,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Cloud Computing',
      slug:        'cloud-computing',
      description: 'Accédez à vos données délocalisées sans les coûts d\'infrastructure liés. Nous facilitons votre transition vers le cloud et optimisons vos ressources existantes pour accroître votre agilité et vos performances globales.',
      icone:       'cloud',
      ordre:       6,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Business Intelligence',
      slug:        'business-intelligence',
      description: 'Analyse de données, KPIs et tableaux de bord pour piloter vos décisions. Transformez vos données brutes en informations stratégiques exploitables pour devancer la concurrence.',
      icone:       'chart',
      ordre:       7,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Ingénierie Logicielles',
      slug:        'ingenierie-logicielles',
      description: 'Conception et développement de sites web, applications mobiles et logiciels sur mesure. Nos développeurs expérimentés créent des solutions technologiques robustes et évolutives.',
      icone:       'code',
      ordre:       8,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Ingénierie Réseaux',
      slug:        'ingenierie-reseaux',
      description: 'Étude, mise en place et sécurisation complète de vos réseaux locaux et d\'inter-connexion. Nous concevons des infrastructures réseau de haute performance et résilientes.',
      icone:       'network',
      ordre:       9,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Nouvelles Énergies',
      slug:        'nouvelles-energies',
      description: 'Solutions globales pour une transition vers l\'énergie propre et renouvelable. Nous intégrons des technologies intelligentes et durables pour optimiser votre consommation énergétique.',
      icone:       'zap',
      ordre:       10,
      actif:       true,
      imageId:     null,
    },
    {
      titre:       'Audit & Conformité',
      slug:        'audit-conformite',
      description: 'Vérification approfondie des processus et des normes de fonctionnement de votre entreprise. Nous vous aidons à évaluer, atteindre et maintenir rigoureusement la conformité avec l\'ensemble des standards internationaux.',
      icone:       'clock',
      ordre:       11,
      actif:       true,
      imageId:     null,
    },
  ];

  await prisma.service.createMany({ data: servicesData.map((s) => ({ ...s, modifiePar: admin.id })) });
  console.log(`   ✅ ${servicesData.length} services créés (tous actifs).\n`);

  // ────────────────────────────────────────
  // 6. PRODUITS
  // ────────────────────────────────────────
  console.log('📦 Création des produits...');

  const produitsData = [
    {
      nom:         'Broadway Shield',
      slug:        'broadway-shield',
      description: 'Une plateforme intelligente (SOC) de surveillance et de remédiation en temps réel. Broadway Shield protège vos données contre les attaques zero-day et les menaces internes.',
      categorie:   'Sécurité',
      statut:      'ACTIF',
      features:    ['Détection IA des anomalies 24/7', 'Tableau de bord centralisé', 'Automatisation des réponses (SOAR)', 'Rapports de conformité en un clic'],
      actif:       true,
      imageId:     mediaProduksReels[0]?.id || null,
    },
    {
      nom:         'Broadway CloudDesk',
      slug:        'broadway-clouddesk',
      description: 'Votre bureau virtuel accessible partout. CloudDesk unifie vos applications, vos fichiers et vos communications dans un espace de travail ultra-rapide et hautement sécurisé.',
      categorie:   'Productivité',
      statut:      'ACTIF',
      features:    ['Accès universel multi-appareils', 'Chiffrement de bout en bout', 'Gestion granulaire des droits utilisateurs', 'Intégration transparente avec vos applications IT'],
      actif:       true,
      imageId:     mediaProduksReels[1]?.id || null,
    },
    {
      nom:         'Broadway GreenSync',
      slug:        'broadway-greensync',
      description: 'Un logiciel intelligent de gestion énergétique pour vos parcs immobiliers et industriels. Surveillez, lissez vos pics de consommation et réduisez vos coûts d\'énergie de 30% en moyenne.',
      categorie:   'Énergie',
      statut:      'ACTIF',
      features:    ['Cartographie énergétique complète', 'Alertes de surconsommation automatiques', 'Modélisation de la transition solaire', 'Reporting automatisé RSE'],
      actif:       true,
      imageId:     mediaProduksReels[2]?.id || null,
    },
  ];

  await prisma.produit.createMany({ data: produitsData.map((p) => ({ ...p, modifiePar: admin.id })) });
  console.log(`   ✅ ${produitsData.length} produits créés (tous actifs).\n`);

  // ────────────────────────────────────────
  // 7. PROJETS / RÉFÉRENCES
  // ────────────────────────────────────────
  console.log('🏗️  Création des références...');

  const projetsData = [
    {
      titre:           'Refonte et sécurisation du système d\'information central',
      client:          'Ministère de l\'Économie',
      secteur:         'Gouvernement',
      description:     'Déploiement d\'une architecture réseau résiliente et d\'un SOC complet pour protéger les données financières sensibles contre les cyberattaques avancées.',
      technologies:    ['Cyber Sécurité', 'Ingénierie Réseaux'],
      dateRealisation: new Date('2023-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[0]?.id || null,
    },
    {
      titre:           'Mise en place d\'une plateforme d\'analytique BI de bout en bout',
      client:          'Bank of Africa - Group',
      secteur:         'Secteur Bancaire',
      description:     'Création d\'entrepôts de données et de tableaux de bord en temps réel pour optimiser le pilotage financier à travers 15 filiales africaines.',
      technologies:    ['Business Intelligence', 'Data Engineering'],
      dateRealisation: new Date('2022-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[1]?.id || null,
    },
    {
      titre:           'Migration totale vers une infrastructure 100% Cloud',
      client:          'TechCorp Logistics',
      secteur:         'Supply Chain',
      description:     'Transfert sans interruption de l\'ensemble de l\'écosystème applicatif vers AWS avec une réduction des coûts d\'infrastructure de 40%.',
      technologies:    ['Cloud Computing', 'Infogérance'],
      dateRealisation: new Date('2023-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[2]?.id || null,
    },
    {
      titre:           'Intégration d\'un ERP sur-mesure pour la facturation',
      client:          'Sonabel',
      secteur:         'Énergie',
      description:     'Développement complet d\'un progiciel de gestion intégré reliant les interventions terrain, le service client et la facturation automatique.',
      technologies:    ['Ingénierie Logicielles'],
      dateRealisation: new Date('2022-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[3]?.id || null,
    },
    {
      titre:           'Audit de conformité et sécurisation ISO 27001',
      client:          'Global Telco Hub',
      secteur:         'Télécommunications',
      description:     'Accompagnement de bout en bout pour la conformité et la certification ISO 27001, avec mise en place des processus de gouvernance IT de référence.',
      technologies:    ['Audit & Conformité', 'Gouvernance IT'],
      dateRealisation: new Date('2024-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[4]?.id || null,
    },
    {
      titre:           'Infrastructure Datacenter Haute Disponibilité',
      client:          'SanTech Medical',
      secteur:         'Santé',
      description:     'Conception et déploiement d\'une architecture serveurs/stockage hybride répondant aux normes HIPAA pour assurer la disponibilité vitale des dossiers patients.',
      technologies:    ['Infogérance', 'Ingénierie Réseaux'],
      dateRealisation: new Date('2023-01-01'),
      publie:          true,
      logoId:          mediaProjetsReels[5]?.id || null,
    },
  ];

  await prisma.projet.createMany({ data: projetsData.map((p) => ({ ...p, modifiePar: admin.id })) });
  console.log(`   ✅ ${projetsData.length} projets créés (tous publiés).\n`);

  // ────────────────────────────────────────
  // 8. PARTENAIRES
  // ────────────────────────────────────────
  console.log('🤝 Création des partenaires...');

  const partenairesData = [
    { nom: 'Microsoft',          siteWeb: 'https://microsoft.com',   ordre: 0, actif: true,  logoId: mediaPartenairesReels[0]?.id || null },
    { nom: 'Amazon Web Services', siteWeb: 'https://aws.amazon.com', ordre: 1, actif: true,  logoId: mediaPartenairesReels[1]?.id || null },
    { nom: 'Oracle',             siteWeb: 'https://oracle.com',      ordre: 2, actif: true,  logoId: mediaPartenairesReels[2]?.id || null },
    { nom: 'Cisco',              siteWeb: 'https://cisco.com',       ordre: 3, actif: true,  logoId: mediaPartenairesReels[3]?.id || null },
    { nom: 'Fortinet',           siteWeb: 'https://fortinet.com',    ordre: 4, actif: true,  logoId: mediaPartenairesReels[4]?.id || null },
  ];

  await prisma.partenaire.createMany({ data: partenairesData.map((p) => ({ ...p, modifiePar: admin.id })) });
  console.log(`   ✅ ${partenairesData.length} partenaires créés (tous actifs avec images).\n`);

  // ────────────────────────────────────────
  // 9. LEADS
  // ────────────────────────────────────────
  console.log('📬 Création des leads...');

  const leadsData = [
    {
      nomComplet:   'Moussa Kaboré',
      email:        'moussa.kabore@entreprise.bf',
      organisation: 'Entreprise Kaboré & Fils',
      sujet:        'Demande de devis — Application mobile e-commerce',
      message:      "Bonjour, nous sommes une entreprise de distribution alimentaire basée à Ouagadougou. Nous souhaitons développer une application mobile pour nos clients permettant de passer des commandes en ligne et suivre leurs livraisons. Pouvez-vous nous contacter pour discuter du projet ?",
      statut:       'NOUVEAU',
      ipAdresse:    '196.28.45.12',
    },
    {
      nomComplet:    'Fatoumata Diallo',
      email:         'f.diallo@banque-sahel.com',
      organisation:  'Banque du Sahel',
      sujet:         'Intégration CRM — Broadway CRM',
      message:       "Nous avons besoin d'une démonstration de Broadway CRM pour notre direction commerciale. Nous avons environ 50 utilisateurs potentiels. Merci de nous proposer un RDV la semaine prochaine.",
      statut:        'EN_COURS',
      notesInternes: 'RDV planifié le 25/04/2026. Contact : Fatoumata, directrice commerciale.',
      traitePar:     admin.id,
      ipAdresse:     '41.207.14.88',
    },
    {
      nomComplet:    'Ibrahim Sawadogo',
      email:         'i.sawadogo@mef.gov.bf',
      organisation:  "Ministère de l'Économie et des Finances",
      sujet:         "Appel d'offres — Système de reporting",
      message:       "Nous lançons un appel d'offres pour la mise en place d'un système de reporting financier consolidé. Le cahier des charges est disponible sur demande. Merci de nous soumettre votre candidature avant le 30 avril 2026.",
      statut:        'TRAITE',
      notesInternes: 'Dossier soumis le 18/04. Réponse attendue le 05/05.',
      traitePar:     admin.id,
      ipAdresse:     '196.28.1.4',
    },
    {
      nomComplet:   'Aïcha Ouédraogo',
      email:        'aicha@startup-tech.bf',
      organisation: 'StartupTech BF',
      sujet:        'Développement MVP — Fintech',
      message:      "Notre startup développe une solution de micro-crédit mobile. Nous cherchons un partenaire technique pour développer notre MVP. Budget estimé : 15 000 000 FCFA. Timeline souhaitée : 4 mois.",
      statut:       'NOUVEAU',
      ipAdresse:    '105.235.12.67',
    },
    {
      nomComplet:    'Jean-Paul Martin',
      email:         'jmartin@ong-solidaire.org',
      organisation:  'ONG Solidaire Afrique',
      sujet:         'Système de collecte de données terrain',
      message:       "Nous avons besoin d'une solution mobile hors-ligne pour la collecte de données lors de nos enquêtes terrain. Environ 80 agents de terrain dans 5 pays.",
      statut:        'ARCHIVE',
      notesInternes: 'Client non qualifié — budget insuffisant.',
      traitePar:     editor.id,
      ipAdresse:     '82.65.142.10',
    },
  ];

  await prisma.lead.createMany({ data: leadsData });
  console.log(`   ✅ ${leadsData.length} leads créés (NOUVEAU×2, EN_COURS×1, TRAITE×1, ARCHIVE×1).\n`);

  // ────────────────────────────────────────
  // 10. ÉVÉNEMENTS ANALYTICS
  // ────────────────────────────────────────
  console.log('📊 Création des événements analytics...');

  const sessions = [
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
  ];
  const pages = ['/', '/services', '/services/developpement-web-mobile', '/produits', '/produits/broadway-crm', '/contact', '/references'];
  const now   = new Date();
  const events = [];

  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    events.push({
      sessionId:      sessions[i % sessions.length],
      pagePath:       pages[i % pages.length],
      evenement:      i % 5 === 0 ? 'CLICK' : i % 7 === 0 ? 'FORM_SUBMIT' : 'PAGEVIEW',
      dureeSecondes:  Math.floor(Math.random() * 180) + 10,
      referrer:       i % 3 === 0 ? 'https://google.com' : i % 4 === 0 ? 'https://linkedin.com' : null,
      timestamp:      new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.evenementAnalytics.createMany({ data: events });
  console.log(`   ✅ ${events.length} événements analytics créés.\n`);

  // ────────────────────────────────────────
  // RÉSUMÉ
  // ────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅  Seed terminé avec succès !\n');
  console.log('COMPTES DE TEST :');
  console.log('  admin@broadway.com   →  Admin1234!  (rôle ADMIN)');
  console.log('  editor@broadway.com  →  Editor1234! (rôle ADMIN)');
  console.log('\nDONNÉES CRÉÉES :');
  console.log(`  Médias      : ${totalMedias} total (images réelles uniquement)`);
  console.log(`    • ${mediaPublicsCount} images publiques (JPEG)`);
  console.log(`    • ${produksReelsCount} images produits`);
  console.log(`    • ${projetsReelsCount} images clients`);
  console.log(`    • ${partenairesReelsCount} images partenaires ✨ (Fortinet inclus)`);
  console.log(`  Services    : ${servicesData.length} (tous actifs)`);
  console.log(`  Produits    : ${produitsData.length} (tous actifs avec images)`);
  console.log(`  Projets     : ${projetsData.length} (tous publiés avec images)`);
  console.log(`  Partenaires : ${partenairesData.length} (tous actifs avec images)`);
  console.log(`  Leads       : ${leadsData.length}`);
  console.log(`  Analytics   : ${events.length} événements`);
  console.log('\nURLS IMAGES (tester dans le navigateur) :');
  console.log('  Images publiques :');
  console.log(`    ${BASE_URL}/uploads/public/dg.jpeg`);
  console.log(`    ${BASE_URL}/uploads/public/kader_kadi.jpeg`);
  console.log(`    ${BASE_URL}/uploads/public/portail.jpeg`);
  console.log('  Images produits :');
  console.log(`    ${BASE_URL}/uploads/produits/broadway-shield.jpg`);
  console.log(`    ${BASE_URL}/uploads/produits/bureau-virtuel-mydesk.png`);
  console.log('  Images clients :');
  console.log(`    ${BASE_URL}/uploads/clients/ministere-economie.jpg`);
  console.log(`    ${BASE_URL}/uploads/clients/bank-of-africa.jpg`);
  console.log('  Images partenaires :');
  console.log(`    ${BASE_URL}/uploads/partenaires/microsoft.svg`);
  console.log(`    ${BASE_URL}/uploads/partenaires/fortinet.svg`);
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .catch((e) => { console.error('❌ Erreur lors du seed :', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
