require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { hashPassword } = require('../src/utils/hash');

async function createAdmin() {
  // Récupération sécurisée depuis les variables d'environnement ou arguments CLI
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];
  const nomComplet = process.env.ADMIN_NAME || process.argv[4] || 'Administrateur MultiVerus';

  if (!email || !password) {
    console.error('❌ [SÉCURITÉ] ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires.');
    console.error('   Usage via variables d\'environnement :');
    console.error('     ADMIN_EMAIL="admin@multiverus.com" ADMIN_PASSWORD="VotreMotDePasse" npm run admin:create');
    console.error('   Ou via arguments CLI :');
    console.error('     node scripts/create-admin.js admin@multiverus.com "VotreMotDePasse" "Nom Prénom"');
    console.error('   (Ne jamais commiter de mots de passe en clair dans le code)');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Le mot de passe doit comporter au moins 8 caractères.');
    process.exit(1);
  }

  console.log(`🔐 Configuration du compte administrateur pour : ${email}...`);

  try {
    const hashedPassword = await hashPassword(password);

    const admin = await prisma.utilisateur.upsert({
      where: { email },
      update: {
        motDePasse: hashedPassword,
        role: 'ADMIN',
        actif: true,
        nomComplet,
      },
      create: {
        email,
        motDePasse: hashedPassword,
        role: 'ADMIN',
        actif: true,
        nomComplet,
      },
    });

    console.log(`✅ Administrateur configuré avec succès !`);
    console.log(`   ID       : ${admin.id}`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Nom      : ${admin.nomComplet}`);
    console.log(`   Rôle     : ${admin.role}`);
    console.log(`   Actif    : ${admin.actif}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la configuration de l'admin :`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
