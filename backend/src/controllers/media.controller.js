const mediaService = require('../services/media.service');
const logAction = require('../utils/auditLog');
const { getPagination, paginatedResponse } = require('../utils/paginate');
const AppError = require('../utils/appError');

class MediaController {
  async upload(req, res, next) {
    try {
      if (!req.file) throw new AppError('Aucun fichier reçu.', 400);

      const { dossier } = req.body;
      const media = await mediaService.upload(req.file, req.user.id, dossier || '');

      await logAction(req, req.user.id, 'UPLOAD_MEDIA', 'MEDIA', media.id, {
        nomFichier: media.nomFichier,
        typeMime: media.typeMime,
      });

      return res.status(201).json({
        success: true,
        message: 'Fichier uploadé avec succès.',
        data: media,
      });
    } catch (err) {
      // Nettoyage du fichier disk si le service a planté après l'écriture
      if (req.file?.path) {
        try { require('fs').unlinkSync(req.file.path); } catch { /* ignore */ }
      }
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const { page, limit, skip } = getPagination(req.query);
      const { typeMime, dossier } = req.query;
      const { data, total } = await mediaService.findAll({ limit, skip, typeMime, dossier });
      return res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
    } catch (err) {
      next(err);
    }
  }

  async updateAltText(req, res, next) {
    try {
      const media = await mediaService.updateAltText(req.params.id, req.body.altText);
      await logAction(req, req.user.id, 'UPDATE_MEDIA_ALTTEXT', 'MEDIA', media.id);
      return res.json({
        success: true,
        message: 'Texte alternatif mis à jour.',
        data: media,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await mediaService.delete(req.params.id);
      await logAction(req, req.user.id, 'DELETE_MEDIA', 'MEDIA', req.params.id);
      return res.json({ success: true, message: 'Média supprimé.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MediaController();
