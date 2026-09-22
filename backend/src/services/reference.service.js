const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const mediaService = require('./media.service');

const LOGO_SELECT = { id: true, url: true, cdnUrl: true, altText: true };

class ReferenceService {
  async create(data, userId) {
    return prisma.projet.create({
      data: { ...data, modifiePar: userId },
      include: { logo: true },
    });
  }

  async findAll({ limit, skip, secteur, publie }) {
    const where = {};
    if (secteur) where.secteur = { contains: secteur, mode: 'insensitive' };
    if (publie === 'true') where.publie = true;
    if (publie === 'false') where.publie = false;

    const [data, total] = await Promise.all([
      prisma.projet.findMany({
        where,
        orderBy: [{ dateRealisation: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: { logo: true },
      }),
      prisma.projet.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id) {
    const projet = await prisma.projet.findUnique({
      where: { id },
      include: { logo: true },
    });
    if (!projet) throw new AppError('Référence introuvable.', 404);
    return projet;
  }

  async update(id, data, userId) {
    await this.findOne(id);

    return prisma.projet.update({
      where: { id },
      data: { ...data, modifiePar: userId },
      include: { logo: true },
    });
  }

  async replaceLogo(id, file, userId) {
    const projet = await this.findOne(id);
    const oldLogoId = projet.logoId;

    const newMedia = await mediaService.upload(file, userId, 'references');

    await prisma.projet.update({
      where: { id: projet.id },
      data: { logoId: newMedia.id, modifiePar: userId },
    });

    if (oldLogoId) {
      try { await mediaService.supprimerMedia(oldLogoId); } catch { /* ignore si déjà supprimé */ }
    }

    return newMedia;
  }

  async delete(id) {
    await this.findOne(id);
    return prisma.projet.delete({ where: { id } });
  }

  async findAllPublic({ skip, limit, secteur }) {
    const where = { publie: true };
    if (secteur) where.secteur = { contains: secteur, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.projet.findMany({
        where,
        orderBy: [{ dateRealisation: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          titre: true,
          client: true,
          secteur: true,
          description: true,
          technologies: true,
          dateRealisation: true,
          logo: { select: LOGO_SELECT },
        },
      }),
      prisma.projet.count({ where }),
    ]);

    return { data, total };
  }
}

module.exports = new ReferenceService();
