const prisma = require('../lib/prisma');
const slugify = require('../utils/slugify');
const AppError = require('../utils/appError');
const mediaService = require('./media.service');

const IMAGE_SELECT = { id: true, url: true, cdnUrl: true, altText: true };

const generateUniqueSlug = async (nom, excludeId = null) => {
  const base = slugify(nom);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.produit.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) break;
    slug = `${base}-${counter++}`;
  }

  return slug;
};

class ProduitService {
  async create(data, userId) {
    const slug = await generateUniqueSlug(data.nom);

    return prisma.produit.create({
      data: { ...data, slug, modifiePar: userId },
      include: { image: true },
    });
  }

  async findAll({ limit, skip, categorie, statut, actif }) {
    const where = {};
    if (categorie) where.categorie = categorie;
    if (statut) where.statut = statut;
    if (actif === 'true') where.actif = true;
    if (actif === 'false') where.actif = false;

    const [data, total] = await Promise.all([
      prisma.produit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { image: true },
      }),
      prisma.produit.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(idOrSlug) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const produit = await prisma.produit.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: { image: true },
    });

    if (!produit) throw new AppError('Produit introuvable.', 404);
    return produit;
  }

  async update(id, data, userId) {
    const produit = await this.findOne(id);

    return prisma.produit.update({
      where: { id: produit.id },
      data: { ...data, modifiePar: userId },
      include: { image: true },
    });
  }

  async replaceImage(id, file, userId) {
    const produit = await this.findOne(id);
    const oldImageId = produit.imageId;

    const newMedia = await mediaService.upload(file, userId, 'produits');

    await prisma.produit.update({
      where: { id: produit.id },
      data: { imageId: newMedia.id, modifiePar: userId },
    });

    if (oldImageId) {
      try { await mediaService.supprimerMedia(oldImageId); } catch { /* ignore si déjà supprimé */ }
    }

    return newMedia;
  }

  async softDelete(id, userId) {
    const produit = await this.findOne(id);

    return prisma.produit.update({
      where: { id: produit.id },
      data: { actif: false, statut: 'ARCHIVE', modifiePar: userId },
    });
  }

  async findAllPublic({ skip, limit, categorie }) {
    const where = { actif: true, statut: { not: 'ARCHIVE' } };
    if (categorie) where.categorie = categorie;

    const [data, total] = await Promise.all([
      prisma.produit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          nom: true,
          slug: true,
          description: true,
          categorie: true,
          statut: true,
          features: true,
          image: { select: IMAGE_SELECT },
        },
      }),
      prisma.produit.count({ where }),
    ]);

    return { data, total };
  }

  async findOnePublic(slug) {
    const produit = await prisma.produit.findFirst({
      where: { slug, actif: true, statut: { not: 'ARCHIVE' } },
      select: {
        id: true,
        nom: true,
        slug: true,
        description: true,
        categorie: true,
        statut: true,
        features: true,
        image: { select: IMAGE_SELECT },
      },
    });

    if (!produit) throw new AppError('Produit introuvable.', 404);
    return produit;
  }
}

module.exports = new ProduitService();
