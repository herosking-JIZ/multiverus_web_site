const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const mediaService = require('./media.service');

const LOGO_SELECT = { id: true, url: true, cdnUrl: true, altText: true };

class PartenaireService {
  async create(data, userId) {
    return prisma.partenaire.create({
      data: { ...data, modifiePar: userId },
      include: { logo: true },
    });
  }

  async findAll({ limit, skip, actif }) {
    const where = {};
    if (actif === 'true') where.actif = true;
    if (actif === 'false') where.actif = false;

    const [data, total] = await Promise.all([
      prisma.partenaire.findMany({
        where,
        orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: { logo: true },
      }),
      prisma.partenaire.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id) {
    const partenaire = await prisma.partenaire.findUnique({
      where: { id },
      include: { logo: true },
    });
    if (!partenaire) throw new AppError('Partenaire introuvable.', 404);
    return partenaire;
  }

  async update(id, data, userId) {
    await this.findOne(id);

    return prisma.partenaire.update({
      where: { id },
      data: { ...data, modifiePar: userId },
      include: { logo: true },
    });
  }

  async replaceLogo(id, file, userId) {
    const partenaire = await this.findOne(id);
    const oldLogoId = partenaire.logoId;

    const newMedia = await mediaService.upload(file, userId, 'partenaires');

    await prisma.partenaire.update({
      where: { id: partenaire.id },
      data: { logoId: newMedia.id, modifiePar: userId },
    });

    if (oldLogoId) {
      try { await mediaService.supprimerMedia(oldLogoId); } catch { /* ignore si déjà supprimé */ }
    }

    return newMedia;
  }

  async softDelete(id, userId) {
    await this.findOne(id);

    return prisma.partenaire.update({
      where: { id },
      data: { actif: false, modifiePar: userId },
    });
  }

  async reorder(ids, userId) {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.partenaire.update({
          where: { id },
          data: { ordre: index, modifiePar: userId },
        })
      )
    );
  }

  async findAllPublic() {
    return prisma.partenaire.findMany({
      where: { actif: true },
      orderBy: { ordre: 'asc' },
      select: {
        id: true,
        nom: true,
        siteWeb: true,
        ordre: true,
        logo: { select: LOGO_SELECT },
      },
    });
  }
}

module.exports = new PartenaireService();
