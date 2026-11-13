const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const storage = require('../lib/storage');
const AppError = require('../utils/appError');

const STORAGE_PATH = process.env.MEDIA_STORAGE_PATH
  ? path.resolve(process.env.MEDIA_STORAGE_PATH)
  : path.join(process.cwd(), 'uploads');

const BASE_URL = (process.env.MEDIA_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

const MIME_LIMITS = {
  'image/jpeg': 100 * 1024 * 1024,
  'image/png': 100 * 1024 * 1024,
  'image/webp': 100 * 1024 * 1024,
  'image/svg+xml': 20 * 1024 * 1024,
  'image/gif': 50 * 1024 * 1024,
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
  /**
   * Génère une URL présignée pour l'upload direct vers S3 / Cloudflare R2 (Serverless).
   * Crée l'enregistrement Media avec le statut PENDING.
   */
  async initiatePresignedUpload({ nomFichier, typeMime, tailleOctets, dossier = '', userId = null, altText = null }) {
    const maxSize = MIME_LIMITS[typeMime];
    if (!maxSize) {
      throw new AppError('Type de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG, PDF, Vidéos...', 400);
    }

    const taille = Number(tailleOctets);
    if (taille > maxSize) {
      throw new AppError(`Fichier trop volumineux. Max : ${maxSize / (1024 * 1024)} MB pour ce type.`, 400);
    }

    if (!storage.isConfigured()) {
      throw new AppError(
        "Le stockage S3 / Cloudflare R2 n'est pas configuré. Veuillez renseigner S3_BUCKET_NAME, S3_ACCESS_KEY_ID et S3_SECRET_ACCESS_KEY.",
        500
      );
    }

    // Nom unique sécurisé
    const ext = path.extname(nomFichier).toLowerCase() || '';
    const uniqueName = `${uuidv4()}${ext}`;
    const cleanDossier = (dossier || '').replace(/^\/+|\/+$/g, '');
    const s3Key = cleanDossier ? `${cleanDossier}/${uniqueName}` : uniqueName;

    // Expiration de l'URL présignée (15 minutes)
    const expiresInSeconds = 15 * 60;
    const uploadExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const { uploadUrl, publicUrl, s3Bucket, s3Region } = await storage.generatePresignedPutUrl({
      key: s3Key,
      contentType: typeMime,
      expiresIn: expiresInSeconds,
    });

    // Enregistrement préalable avec statut PENDING
    const media = await prisma.media.create({
      data: {
        nomFichier,
        typeMime,
        tailleOctets: BigInt(taille),
        s3Key,
        s3Bucket,
        s3Region,
        url: publicUrl,
        cdnUrl: publicUrl,
        uploadStatus: 'PENDING',
        uploadExpiresAt,
        visibilite: 'PUBLIC',
        dossier: cleanDossier || null,
        uploadePar: userId || null,
        altText: altText || null,
      },
    });

    return {
      uploadUrl,
      mediaId: media.id,
      s3Key,
      publicUrl,
      uploadExpiresAt,
      media: { ...media, tailleOctets: Number(media.tailleOctets) },
    };
  }

  /**
   * Confirme qu'un upload présigné a bien été effectué par le client.
   * Passe le statut de PENDING à UPLOADED.
   */
  async confirmUpload(mediaId, meta = {}) {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      throw new AppError('Média introuvable.', 404);
    }

    if (media.uploadStatus === 'UPLOADED') {
      return { ...media, tailleOctets: Number(media.tailleOctets) };
    }

    const updateData = {
      uploadStatus: 'UPLOADED',
      uploadExpiresAt: null,
    };

    if (meta.altText !== undefined) updateData.altText = meta.altText;
    if (meta.largeur !== undefined) updateData.largeur = meta.largeur;
    if (meta.hauteur !== undefined) updateData.hauteur = meta.hauteur;
    if (meta.dureeSecondes !== undefined) updateData.dureeSecondes = meta.dureeSecondes;

    const updated = await prisma.media.update({
      where: { id: mediaId },
      data: updateData,
    });

    return { ...updated, tailleOctets: Number(updated.tailleOctets) };
  }

  /**
   * Upload direct côté serveur (Multer).
   * Supporte S3/R2 si configuré, avec fallback automatique vers le stockage disque local.
   */
  async upload(file, userId, dossier = '') {
    const maxSize = MIME_LIMITS[file.mimetype];
    if (!maxSize) throw new AppError('Type de fichier non autorisé.', 400);
    if (file.size > maxSize) {
      throw new AppError(`Fichier trop volumineux. Max : ${maxSize / (1024 * 1024)} MB pour ce type.`, 400);
    }

    const cleanDossier = (dossier || '').replace(/^\/+|\/+$/g, '');
    const relativePath = cleanDossier ? `${cleanDossier}/${file.filename}` : file.filename;

    let s3Bucket = 'local';
    let s3Region = 'local';
    let url = `${BASE_URL}/uploads/${relativePath}`;
    let cdnUrl = url;

    // Si S3/R2 est configuré, on transfère le fichier vers le stockage Cloud
    if (storage.isConfigured()) {
      const fileBuffer = fs.readFileSync(file.path);
      const uploadResult = await storage.uploadBuffer({
        key: relativePath,
        buffer: fileBuffer,
        contentType: file.mimetype,
      });

      s3Bucket = uploadResult.s3Bucket;
      s3Region = uploadResult.s3Region;
      url = uploadResult.publicUrl;
      cdnUrl = uploadResult.publicUrl;

      // Supprimer le fichier temporaire local après envoi vers S3
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
    }

    const media = await prisma.media.create({
      data: {
        nomFichier: file.originalname,
        typeMime: file.mimetype,
        tailleOctets: BigInt(file.size),
        s3Key: relativePath,
        s3Bucket,
        s3Region,
        url,
        cdnUrl,
        uploadStatus: 'UPLOADED',
        visibilite: 'PUBLIC',
        dossier: cleanDossier || null,
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

    // Suppression depuis S3 si applicable
    if (media.s3Bucket !== 'local' && storage.isConfigured()) {
      try {
        await storage.deleteObject({ key: media.s3Key, bucket: media.s3Bucket });
      } catch (err) {
        console.warn(`[storage] Impossible de supprimer le fichier S3 ${media.s3Key}:`, err.message);
      }
      for (const v of media.variantes) {
        try {
          await storage.deleteObject({ key: v.s3Key, bucket: v.s3Bucket });
        } catch {
          /* ignore */
        }
      }
    }

    // Suppression du fichier local si présent (ou si stockage local)
    try {
      const localPath = path.join(STORAGE_PATH, media.s3Key);
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch {
      /* ignore */
    }

    for (const v of media.variantes) {
      try {
        const localVPath = path.join(STORAGE_PATH, v.s3Key);
        if (fs.existsSync(localVPath)) fs.unlinkSync(localVPath);
      } catch {
        /* ignore */
      }
    }

    await prisma.media.delete({ where: { id: mediaId } });
  }

  async nettoyerPendingExpires() {
    const expires = await prisma.media.findMany({
      where: { uploadStatus: 'PENDING', uploadExpiresAt: { lt: new Date() } },
    });

    let count = 0;
    for (const media of expires) {
      if (media.s3Bucket !== 'local' && storage.isConfigured()) {
        try {
          await storage.deleteObject({ key: media.s3Key, bucket: media.s3Bucket });
        } catch {
          /* ignore */
        }
      }
      try {
        const localPath = path.join(STORAGE_PATH, media.s3Key);
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      } catch {
        /* ignore */
      }

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
