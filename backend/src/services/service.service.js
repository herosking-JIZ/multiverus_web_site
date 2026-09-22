const prisma = require('../lib/prisma');
const slugify = require('../utils/slugify');
const AppError = require('../utils/appError');
const mediaService = require('./media.service');

const IMAGE_SELECT = { id: true, url: true, cdnUrl: true, altText: true };

const generateUniqueSlug = async (titre, excludeId = null) => {
  const base = slugify(titre);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.service.findFirst({
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

class ServiceService {
  async create(data, userId) {
    const slug = await generateUniqueSlug(data.titre);

    return prisma.service.create({
      data: { ...data, slug, modifiePar: userId },
      include: { image: true },
    });
  }

  async findAll({ limit, skip, actif }) {
    const where = {};
    if (actif === 'true') where.actif = true;
    if (actif === 'false') where.actif = false;

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: { image: true },
      }),
      prisma.service.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(idOrSlug) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const service = await prisma.service.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: { image: true },
    });

    if (!service) throw new AppError('Service introuvable.', 404);
    return service;
  }

  async update(id, data, userId) {
    const service = await this.findOne(id);

    return prisma.service.update({
      where: { id: service.id },
      data: { ...data, modifiePar: userId },
      include: { image: true },
    });
  }

  async replaceImage(id, file, userId) {
    const service = await this.findOne(id);
    const oldImageId = service.imageId;

    const newMedia = await mediaService.upload(file, userId, 'services');

    await prisma.service.update({
      where: { id: service.id },
      data: { imageId: newMedia.id, modifiePar: userId },
    });

    if (oldImageId) {
      try { await mediaService.supprimerMedia(oldImageId); } catch { /* ignore si déjà supprimé */ }
    }

    return newMedia;
  }

  async softDelete(id, userId) {
    const service = await this.findOne(id);

    return prisma.service.update({
      where: { id: service.id },
      data: { actif: false, modifiePar: userId },
    });
  }

  async reorder(ids, userId) {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.service.update({
          where: { id },
          data: { ordre: index, modifiePar: userId },
        })
      )
    );
  }

  async findAllPublic({ skip, limit }) {
    const where = { actif: true };

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { ordre: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          titre: true,
          slug: true,
          description: true,
          icone: true,
          ordre: true,
          image: { select: IMAGE_SELECT },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { data, total };
  }

  async findOnePublic(slug) {
    const service = await prisma.service.findFirst({
      where: { slug, actif: true },
      select: {
        id: true,
        titre: true,
        slug: true,
        description: true,
        icone: true,
        ordre: true,
        image: { select: IMAGE_SELECT },
      },
    });

    if (!service) throw new AppError('Service introuvable.', 404);
    return service;
  }
}

module.exports = new ServiceService();
