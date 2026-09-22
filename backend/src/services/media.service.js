const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');

const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : path.join(process.cwd(), 'uploads');

const BASE_URL = (process.env.MEDIA_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const MIME_LIMITS = {
  'image/jpeg': 100 * 1024 * 1024,
  'image/png': 100 * 1024 * 1024,
  'image/webp': 100 * 1024 * 1024,
  'application/pdf': 20 * 1024 * 1024,
  'application/msword': 20 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 20 * 1024 * 1024,
  'video/mp4': 250 * 1024 * 1024,
  'video/webm': 250 * 1024 * 1024,
  'video/mpeg': 250 * 1024 * 1024,
  'video/ogg': 250 * 1024 * 1024,
  'video/quicktime': 250 * 1024 * 1024,
  'video/x-ms-wmv': 250 * 1024 * 1024,
  'video/x-flv': 250 * 1024 * 1024,
  'video/avi': 250 * 1024 * 1024,
  'video/mov': 250 * 1024 * 1024,
  'video/mkv': 250 * 1024 * 1024,
};

class MediaService {
  async upload(file, userId, dossier = '') {
    const maxSize = MIME_LIMITS[file.mimetype];
    if (!maxSize) throw new AppError('Type de fichier non autorisé.', 400);
    if (file.size > maxSize) {
      throw new AppError(`Fichier trop volumineux. Max : ${maxSize / (1024 * 1024)} MB pour ce type.`, 400);
    }

    // file.filename est le nom unique généré par multer diskStorage
    const relativePath = dossier ? `${dossier}/${file.filename}` : file.filename;
    const url = `${BASE_URL}/uploads/${relativePath}`;

    const media = await prisma.media.create({
      data: {
        nomFichier: file.originalname,
        typeMime: file.mimetype,
        tailleOctets: BigInt(file.size),
        s3Key: relativePath,   // chemin relatif depuis uploads/
        s3Bucket: 'local',
        s3Region: 'local',
        url,
        cdnUrl: url,
        uploadStatus: 'UPLOADED',
        visibilite: 'PUBLIC',
        dossier: dossier || null,
        uploadePar: userId || null,
      },
    });

    return { ...media, tailleOctets: Number(media.tailleOctets) };
  }

  async supprimerMedia(mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { variantes: true },
    });
    if (!media) throw new AppError('Média introuvable.', 404);

    // Suppression du fichier principal
    try { fs.unlinkSync(path.join(STORAGE_PATH, media.s3Key)); } catch { /* absent, on ignore */ }

    // Suppression des variantes
    for (const v of media.variantes) {
      try { fs.unlinkSync(path.join(STORAGE_PATH, v.s3Key)); } catch { /* ignore */ }
    }

    await prisma.media.delete({ where: { id: mediaId } });
  }

  async nettoyerPendingExpires() {
    const expires = await prisma.media.findMany({
      where: { uploadStatus: 'PENDING', uploadExpiresAt: { lt: new Date() } },
    });

    let count = 0;
    for (const media of expires) {
      try { fs.unlinkSync(path.join(STORAGE_PATH, media.s3Key)); } catch { /* ignore */ }
      await prisma.media.delete({ where: { id: media.id } });
      count++;
    }

    console.log(`[cleanup] ${count} média(s) PENDING expiré(s) supprimé(s).`);
    return count;
  }

  async findAll({ limit, skip, typeMime, dossier }) {
    const where = {};
    if (typeMime) where.typeMime = { contains: typeMime, mode: 'insensitive' };
    if (dossier) where.dossier = dossier;

    const [data, total] = await Promise.all([
      prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.media.count({ where }),
    ]);

    return { data: data.map((m) => ({ ...m, tailleOctets: Number(m.tailleOctets) })), total };
  }

  async findOne(id) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new AppError('Média introuvable.', 404);
    return { ...media, tailleOctets: Number(media.tailleOctets) };
  }

  async updateAltText(id, altText) {
    await this.findOne(id);
    const updated = await prisma.media.update({ where: { id }, data: { altText } });
    return { ...updated, tailleOctets: Number(updated.tailleOctets) };
  }

  async delete(id) {
    return this.supprimerMedia(id);
  }

}

module.exports = new MediaService();
