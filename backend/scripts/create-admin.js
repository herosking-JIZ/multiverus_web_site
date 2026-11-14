require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { hashPassword } = require('../src/utils/hash');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'cprzachk@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Heroskingjesus100*';
  const nomComplet = process.env.ADMIN_NAME || 'Zacharie Compaore';

  console.log(`🔐 Création du compte administrateur pour : ${email}...`);

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
    console.log(`   Rôle     : ${admin.role}`);
    console.log(`   Actif    : ${admin.actif}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'admin :`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

